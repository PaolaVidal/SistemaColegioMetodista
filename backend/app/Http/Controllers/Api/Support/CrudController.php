<?php

namespace App\Http\Controllers\Api\Support;

use App\Http\Controllers\Controller;
use App\Policies\Api\ResourcePolicy;
use App\Services\ContextoAuditoriaService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

abstract class CrudController extends Controller
{
    protected string $tabla;

    public function index(Request $request)
    {
        $columnas = array_column(Schema::getColumns($this->tabla), 'name');
        $consulta = app(ResourcePolicy::class)->consulta($request->user(), $this->tabla);

        foreach ((array) $request->query('filtros', []) as $campo => $valor) {
            if (! in_array($campo, $columnas, true) || ! is_scalar($valor)) {
                throw ValidationException::withMessages(['filtros' => 'El filtro solicitado no es válido.']);
            }
            $consulta->where($campo, $valor);
        }

        $orden = $request->query('orden', 'id');
        $direccion = strtolower((string) $request->query('direccion', 'asc'));
        if (! in_array($orden, $columnas, true) || ! in_array($direccion, ['asc', 'desc'], true)) {
            throw ValidationException::withMessages(['orden' => 'El orden solicitado no es válido.']);
        }

        $resultados = $consulta->orderBy($orden, $direccion)
            ->paginate(min(max((int) $request->query('por_pagina', 25), 1), 100));
        $resultados->getCollection()->transform(fn ($registro) => $this->presentar($registro));

        return response()->json($resultados);
    }

    public function store(Request $request)
    {
        app(ResourcePolicy::class)->autorizar($request->user(), $this->tabla, 'C');
        try {
            $registro = DB::transaction(function () use ($request) {
                $this->contextoAuditoria();
                $datos = $this->validar($request, false);
                $this->validarNegocio($datos, null);
                $datos = $this->preparar($datos);
                app(ResourcePolicy::class)->autorizarDestino($request->user(), $this->tabla, $datos);
                $this->agregarFechas($datos, true);
                $id = DB::table($this->tabla)->insertGetId($datos);
                $nuevo = $this->buscar($id);
                $this->despuesDeGuardar(null, $nuevo);

                return $nuevo;
            });
        } catch (QueryException $exception) {
            return $this->errorIntegridad($exception);
        }

        return response()->json($this->presentar($registro), 201);
    }

    public function show(int $registro)
    {
        $politica = app(ResourcePolicy::class);
        $usuario = request()->user();
        abort_unless($politica->visible($usuario, $this->tabla, $registro), 404, 'Registro no encontrado.');

        return response()->json($this->presentar($this->buscar($registro)));
    }

    public function update(Request $request, int $registro)
    {
        $politica = app(ResourcePolicy::class);
        $politica->autorizar($request->user(), $this->tabla, 'U');
        try {
            $actualizado = DB::transaction(function () use ($request, $registro) {
                $this->contextoAuditoria();
                $actual = app(ResourcePolicy::class)->aplicarAlcance(DB::table($this->tabla), $request->user(), $this->tabla)
                    ->where($this->tabla.'.id', $registro)->lockForUpdate()->first();
                abort_if($actual === null, 404, 'Registro no encontrado.');
                $datos = $this->validar($request, true);
                $this->validarNegocio($datos, $actual);
                $datos = $this->preparar($datos);
                app(ResourcePolicy::class)->autorizarDestino($request->user(), $this->tabla, array_merge((array) $actual, $datos));
                if ($datos !== []) {
                    $this->agregarFechas($datos, false);
                    DB::table($this->tabla)->where('id', $registro)->update($datos);
                }
                $nuevo = $this->buscar($registro);
                $this->despuesDeGuardar($actual, $nuevo);

                return $nuevo;
            });
        } catch (QueryException $exception) {
            return $this->errorIntegridad($exception);
        }

        return response()->json($this->presentar($actualizado));
    }

    public function destroy(int $registro)
    {
        $politica = app(ResourcePolicy::class);
        $politica->autorizar(request()->user(), $this->tabla, 'D');
        try {
            DB::transaction(function () use ($registro) {
                $this->contextoAuditoria();
                $actual = app(ResourcePolicy::class)->aplicarAlcance(DB::table($this->tabla), request()->user(), $this->tabla)
                    ->where($this->tabla.'.id', $registro)->lockForUpdate()->first();
                abort_if($actual === null, 404, 'Registro no encontrado.');
                DB::table($this->tabla)->where('id', $registro)->delete();
                $this->despuesDeGuardar($actual, null);
            });
        } catch (QueryException $exception) {
            return $this->errorIntegridad($exception);
        }

        return response()->noContent();
    }

    protected function reglasAdicionales(): array
    {
        return [];
    }

    private function contextoAuditoria(): void
    {
        if ($this->tabla === 'calificaciones') {
            app(ContextoAuditoriaService::class)->establecer(request()->user()->id);
        }
    }

    protected function validarNegocio(array $datos, ?object $actual): void {}

    protected function preparar(array $datos): array
    {
        return $datos;
    }

    protected function presentar(object $registro): object
    {
        return $registro;
    }

    protected function despuesDeGuardar(?object $anterior, ?object $nuevo): void {}

    protected function buscar(int $id): object
    {
        $registro = DB::table($this->tabla)->where('id', $id)->first();
        abort_if($registro === null, 404, 'Registro no encontrado.');

        return $registro;
    }

    private function validar(Request $request, bool $parcial): array
    {
        $entrada = $request->all();
        $columnas = Schema::getColumns($this->tabla);
        $permitidas = array_diff(array_column($columnas, 'name'), ['id', 'created_at', 'updated_at', 'version_sesion']);
        $desconocidas = array_diff(array_keys($entrada), $permitidas);
        if ($desconocidas !== []) {
            throw ValidationException::withMessages([
                'campos' => 'Campos no permitidos: '.implode(', ', $desconocidas).'.',
            ]);
        }

        $reglas = [];
        foreach ($columnas as $columna) {
            $campo = $columna['name'];
            if (! in_array($campo, $permitidas, true)) {
                continue;
            }
            $base = (! $parcial && ! $columna['nullable'] && $columna['default'] === null)
                ? ['required'] : ['sometimes'];
            if ($columna['nullable']) {
                $base[] = 'nullable';
            }
            $reglas[$campo] = array_merge($base, $this->reglaTipo($columna), $this->reglasAdicionales()[$campo] ?? []);
        }

        $datos = Validator::make($entrada, $reglas)->validate();
        foreach (Schema::getForeignKeys($this->tabla) as $foranea) {
            if (count($foranea['columns']) !== 1 || count($foranea['foreign_columns']) !== 1) {
                continue;
            }
            $campo = $foranea['columns'][0];
            if (isset($datos[$campo]) && ! DB::table($foranea['foreign_table'])
                ->where($foranea['foreign_columns'][0], $datos[$campo])->exists()) {
                throw ValidationException::withMessages([$campo => 'El registro relacionado no existe.']);
            }
        }

        return $datos;
    }

    private function reglaTipo(array $columna): array
    {
        $tipo = strtolower($columna['type_name']);
        if (str_contains($tipo, 'bool')) {
            return ['boolean'];
        }
        if (str_contains($tipo, 'int')) {
            return ['integer'];
        }
        if (in_array($tipo, ['numeric', 'decimal', 'float4', 'float8'], true)) {
            return ['numeric'];
        }
        if (str_contains($tipo, 'date') || str_contains($tipo, 'timestamp')) {
            return ['date'];
        }
        if (str_contains($tipo, 'time')) {
            return ['regex:/^\d{2}:\d{2}(:\d{2})?$/'];
        }
        if (str_contains($tipo, 'json')) {
            return ['array'];
        }
        if (in_array($tipo, ['varchar', 'bpchar', 'text', 'char'], true)) {
            preg_match('/\((\d+)\)/', $columna['type'], $partes);

            return isset($partes[1]) ? ['string', 'max:'.$partes[1]] : ['string'];
        }

        return [];
    }

    private function agregarFechas(array &$datos, bool $creacion): void
    {
        $columnas = array_column(Schema::getColumns($this->tabla), 'name');
        if ($creacion && in_array('created_at', $columnas, true)) {
            $datos['created_at'] = now();
        }
        if (in_array('updated_at', $columnas, true)) {
            $datos['updated_at'] = now();
        }
    }

    private function errorIntegridad(QueryException $exception)
    {
        $estado = $exception->errorInfo[0] ?? null;
        $respuestas = [
            '23502' => [422, 'Falta un dato obligatorio.'],
            '23503' => [409, 'El registro tiene relaciones que impiden la operación.'],
            '23505' => [409, 'Ya existe un registro con esos datos únicos.'],
            '23514' => [422, 'Los datos no cumplen una restricción de la base.'],
            'P0001' => [422, 'La operación viola una regla de negocio de la base.'],
        ];
        if (! isset($respuestas[$estado])) {
            throw $exception;
        }
        [$codigo, $mensaje] = $respuestas[$estado];

        return response()->json(['message' => $mensaje], $codigo);
    }
}
