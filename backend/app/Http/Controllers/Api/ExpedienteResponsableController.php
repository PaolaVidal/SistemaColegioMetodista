<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Policies\Api\ResourcePolicy;
use App\Support\CuentasUsuario;
use App\Support\Formatos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

// Responsable con los estudiantes a su cargo y, opcionalmente, su cuenta de acceso.
class ExpedienteResponsableController extends Controller
{
    public function show(int $responsable)
    {
        abort_unless(app(ResourcePolicy::class)->visible(request()->user(), 'responsables', $responsable), 404);

        return response()->json($this->obtener($responsable));
    }

    public function store(Request $request)
    {
        $this->autorizar($request, 'C');
        $data = $this->validar($request);

        $id = DB::transaction(function () use ($data) {
            $id = DB::table('responsables')->insertGetId($data['responsable'] + ['created_at' => now(), 'updated_at' => now()]);
            $this->guardarRelacionados($id, $data);

            return $id;
        });

        return response()->json($this->obtener($id), 201);
    }

    public function update(Request $request, int $responsable)
    {
        $this->autorizar($request, 'U');
        abort_if(DB::table('responsables')->where('id', $responsable)->doesntExist(), 404);
        $data = $this->validar($request, $responsable);

        DB::transaction(function () use ($responsable, $data) {
            DB::table('responsables')->where('id', $responsable)->update($data['responsable'] + ['updated_at' => now()]);
            $this->guardarRelacionados($responsable, $data);
        });

        return response()->json($this->obtener($responsable));
    }

    public function sugerirNombreUsuario(Request $request)
    {
        $datos = $request->validate([
            'nombres' => ['required', 'string', 'max:60'],
            'apellidos' => ['required', 'string', 'max:60'],
        ]);

        return response()->json(['nombre_usuario' => CuentasUsuario::sugerirNombre($datos['nombres'], $datos['apellidos'])]);
    }

    private function autorizar(Request $request, string $accion): void
    {
        $politica = app(ResourcePolicy::class);
        $politica->autorizar($request->user(), 'responsables', $accion);
        if ($request->exists('estudiantes')) {
            $politica->autorizar($request->user(), 'estudiante_responsable', 'C');
        }
        if ($request->exists('usuario')) {
            $politica->autorizar($request->user(), 'usuarios', 'C');
        }
    }

    private function obtener(int $responsable): array
    {
        $datos = DB::table('responsables')->where('id', $responsable)->first();
        abort_if($datos === null, 404);
        $rol = app(ResourcePolicy::class)->rol(request()->user());

        return [
            'responsable' => $datos,
            'estudiantes' => DB::table('estudiante_responsable')
                ->join('estudiantes', 'estudiantes.id', '=', 'estudiante_responsable.id_estudiante')
                ->where('estudiante_responsable.id_responsable', $responsable)
                ->select('estudiantes.id', 'estudiantes.nombres', 'estudiantes.apellidos', 'estudiantes.codigo_nie', 'estudiantes.activo',
                    'estudiante_responsable.es_contacto_principal')
                ->orderBy('estudiantes.apellidos')
                ->get(),
            'usuario' => in_array($rol, ['administrador', 'secretaria'], true) ? CuentasUsuario::resumen($datos->id_usuario) : null,
        ];
    }

    private function guardarRelacionados(int $responsable, array $data): void
    {
        if (array_key_exists('usuario', $data)) {
            if (DB::table('responsables')->where('id', $responsable)->value('id_usuario') !== null) {
                throw ValidationException::withMessages(['usuario' => 'El responsable ya tiene un usuario asociado.']);
            }
            $persona = $data['responsable'];
            $idUsuario = CuentasUsuario::crear(['encargado', 'responsable'], $data['usuario'], $persona['nombres'], $persona['apellidos']);
            DB::table('responsables')->where('id', $responsable)->update(['id_usuario' => $idUsuario]);
        }

        if (! array_key_exists('estudiantes', $data)) {
            return;
        }

        $vinculos = DB::table('estudiante_responsable')->where('id_responsable', $responsable);
        $actuales = (clone $vinculos)->pluck('id_estudiante')->all();
        $nuevos = array_map(fn ($e) => (int) $e['id'], $data['estudiantes']);
        $quitados = array_diff($actuales, $nuevos);
        if ($quitados !== []) {
            app(ResourcePolicy::class)->autorizar(request()->user(), 'estudiante_responsable', 'D');
            (clone $vinculos)->whereIn('id_estudiante', $quitados)->delete();
        }

        foreach ($data['estudiantes'] as $estudiante) {
            $principal = (bool) ($estudiante['es_contacto_principal'] ?? false);
            if ($principal) {
                // Un estudiante solo puede tener un contacto principal.
                DB::table('estudiante_responsable')
                    ->where('id_estudiante', $estudiante['id'])
                    ->where('id_responsable', '!=', $responsable)
                    ->update(['es_contacto_principal' => false]);
            }
            DB::table('estudiante_responsable')->updateOrInsert(
                ['id_estudiante' => $estudiante['id'], 'id_responsable' => $responsable],
                ['es_contacto_principal' => $principal]
            );
        }
    }

    private function validar(Request $request, ?int $responsable = null): array
    {
        $data = $request->validate(CuentasUsuario::reglas() + [
            'nombres' => ['required', 'string', 'max:30'],
            'apellidos' => ['required', 'string', 'max:30'],
            'dui' => ['required', 'string', Formatos::DUI],
            'telefono' => ['nullable', 'string', Formatos::TELEFONO],
            'correo' => ['nullable', 'email', 'max:50', Rule::unique('responsables', 'correo')->ignore($responsable)],
            'parentesco' => ['nullable', 'string', 'max:20'],
            'activo' => ['required', 'boolean'],
            'estudiantes' => ['sometimes', 'array'],
            'estudiantes.*.id' => ['required', 'integer', 'distinct', 'exists:estudiantes,id'],
            'estudiantes.*.es_contacto_principal' => ['nullable', 'boolean'],
        ], Formatos::mensajes(['dui' => 'dui', 'telefono' => 'telefono']));

        return ['responsable' => collect($data)->except(['estudiantes', 'usuario'])->all()]
            + collect($data)->only(['estudiantes', 'usuario'])->all();
    }
}
