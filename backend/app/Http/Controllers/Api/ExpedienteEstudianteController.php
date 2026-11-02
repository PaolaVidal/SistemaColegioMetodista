<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Policies\Api\ResourcePolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ExpedienteEstudianteController extends Controller
{
    public function index(Request $request)
    {
        $consulta = app(ResourcePolicy::class)->consulta($request->user(), 'estudiantes')
            ->orderBy('apellidos')->orderBy('nombres');

        if ($request->filled('buscar')) {
            $termino = '%' . $request->string('buscar')->trim() . '%';
            $consulta->where(function ($query) use ($termino) {
                $query->where('nombres', 'ilike', $termino)
                    ->orWhere('apellidos', 'ilike', $termino)
                    ->orWhere('codigo_nie', 'ilike', $termino);
            });
        }

        if ($request->has('activo')) {
            $consulta->where('activo', $request->boolean('activo'));
        }

        return response()->json($consulta->paginate(20));
    }

    public function store(Request $request)
    {
        app(ResourcePolicy::class)->autorizar($request->user(), 'estudiantes', 'C');
        if ($request->exists('ficha')) app(ResourcePolicy::class)->autorizar($request->user(), 'ficha_estudiante', 'C');
        if ($request->exists('responsables')) {
            app(ResourcePolicy::class)->autorizar($request->user(), 'responsables', 'C');
            app(ResourcePolicy::class)->autorizar($request->user(), 'estudiante_responsable', 'C');
        }
        $data = $this->validar($request);

        $id = DB::transaction(function () use ($data) {
            $estudiante = $data['estudiante'];
            $estudiante['created_at'] = now();
            $estudiante['updated_at'] = now();
            $id = DB::table('estudiantes')->insertGetId($estudiante);
            $this->guardarDatosComplementarios($id, $data);

            return $id;
        });

        return response()->json($this->obtenerExpediente($id), 201);
    }

    public function show(int $estudiante)
    {
        $politica = app(ResourcePolicy::class);
        abort_unless($politica->visible(request()->user(), 'estudiantes', $estudiante), 404);
        return response()->json($this->obtenerExpediente($estudiante));
    }

    public function update(Request $request, int $estudiante)
    {
        $politica = app(ResourcePolicy::class);
        $politica->autorizar($request->user(), 'estudiantes', 'U');
        abort_unless($politica->visible($request->user(), 'estudiantes', $estudiante), 404);
        if ($request->exists('ficha')) $politica->autorizar($request->user(), 'ficha_estudiante', 'U');
        if ($request->exists('responsables')) {
            $politica->autorizar($request->user(), 'responsables', 'U');
            $politica->autorizar($request->user(), 'estudiante_responsable', 'U');
        }
        abort_if(DB::table('estudiantes')->where('id', $estudiante)->doesntExist(), 404);
        $data = $this->validar($request, $estudiante);

        DB::transaction(function () use ($estudiante, $data) {
            $datosEstudiante = $data['estudiante'];
            $datosEstudiante['updated_at'] = now();
            DB::table('estudiantes')->where('id', $estudiante)->update($datosEstudiante);
            $this->guardarDatosComplementarios($estudiante, $data);
        });

        return response()->json($this->obtenerExpediente($estudiante));
    }

    private function obtenerExpediente(int $estudiante): array
    {
        $datosEstudiante = DB::table('estudiantes')->where('id', $estudiante)->first();
        abort_if($datosEstudiante === null, 404);

        $politica = app(ResourcePolicy::class);
        $usuario = request()->user();
        $puedeVerResponsables = $politica->rol($usuario) !== 'docente';

        return [
            'estudiante' => $datosEstudiante,
            'ficha' => $politica->consulta($usuario, 'ficha_estudiante')->where('id_estudiante', $estudiante)->first(),
            'responsables' => $puedeVerResponsables ? $politica->consulta($usuario, 'responsables')
                ->join('estudiante_responsable', 'responsables.id', '=', 'estudiante_responsable.id_responsable')
                ->where('estudiante_responsable.id_estudiante', $estudiante)
                ->select('responsables.*', 'estudiante_responsable.es_contacto_principal')
                ->orderByDesc('estudiante_responsable.es_contacto_principal')
                ->get() : collect(),
            'matriculas' => $politica->consulta($usuario, 'matriculas')
                ->join('ciclos', 'matriculas.id_ciclo', '=', 'ciclos.id')
                ->join('secciones', 'matriculas.id_seccion', '=', 'secciones.id')
                ->join('grados', 'secciones.id_grado', '=', 'grados.id')
                ->where('matriculas.id_estudiante', $estudiante)
                ->select('matriculas.*', 'ciclos.fecha_inicio', 'ciclos.fecha_fin', 'grados.nombre as grado', 'secciones.nombre as seccion')
                ->orderByDesc('ciclos.fecha_inicio')
                ->get(),
        ];
    }

    private function guardarDatosComplementarios(int $estudiante, array $data): void
    {
        if (array_key_exists('ficha', $data)) {
            DB::table('ficha_estudiante')->updateOrInsert(
                ['id_estudiante' => $estudiante],
                array_merge($data['ficha'], ['updated_at' => now()])
            );
        }

        if (!array_key_exists('responsables', $data)) {
            return;
        }

        $idsResponsables = [];
        foreach ($data['responsables'] as $responsable) {
            if (isset($responsable['id'])) {
                abort_if(DB::table('responsables')->where('id', $responsable['id'])->doesntExist(), 404);
                $idResponsable = $responsable['id'];
            } else {
                $datosResponsable = $responsable;
                unset($datosResponsable['es_contacto_principal']);
                $datosResponsable['created_at'] = now();
                $datosResponsable['updated_at'] = now();
                $idResponsable = DB::table('responsables')->insertGetId($datosResponsable);
            }

            $idsResponsables[] = $idResponsable;
            DB::table('estudiante_responsable')->updateOrInsert(
                ['id_estudiante' => $estudiante, 'id_responsable' => $idResponsable],
                ['es_contacto_principal' => $responsable['es_contacto_principal'] ?? false]
            );
        }

        $relaciones = DB::table('estudiante_responsable')->where('id_estudiante', $estudiante);
        if (app(ResourcePolicy::class)->rol(request()->user()) === 'secretaria') {
            $existentes = (clone $relaciones)->pluck('id_responsable')->all();
            abort_if(array_diff($existentes, $idsResponsables) !== [], 403, 'Secretaría no puede eliminar vínculos de responsables.');
        } elseif ($idsResponsables === []) {
            $relaciones->delete();
        } else {
            $relaciones->whereNotIn('id_responsable', $idsResponsables)->delete();
        }
    }

    private function validar(Request $request, ?int $estudiante = null): array
    {
        $data = $request->validate([
            'codigo_nie' => ['required', 'string', 'max:10', Rule::unique('estudiantes', 'codigo_nie')->ignore($estudiante)],
            'nombres' => ['required', 'string', 'max:30'],
            'apellidos' => ['required', 'string', 'max:30'],
            'correo' => ['nullable', 'email', 'max:50', Rule::unique('estudiantes', 'correo')->ignore($estudiante)],
            'activo' => ['required', 'boolean'],
            'ficha' => ['sometimes', 'array'],
            'ficha.fecha_nacimiento' => ['required_with:ficha', 'date'],
            'ficha.sexo' => ['required_with:ficha', Rule::in(['M', 'F'])],
            'ficha.nacionalidad' => ['nullable', 'string', 'max:30'],
            'ficha.tipo_sangre' => ['nullable', 'string', 'max:10'],
            'ficha.repite_grado' => ['nullable', 'boolean'],
            'ficha.anio_grado_anterior' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'ficha.padece_enfermedad' => ['nullable', 'boolean'],
            'ficha.tipo_enfermedad' => ['nullable', 'string'],
            'ficha.toma_medicamento' => ['nullable', 'boolean'],
            'ficha.nombre_medicamento' => ['nullable', 'string'],
            'ficha.posee_discapacidad' => ['nullable', 'boolean'],
            'ficha.tipo_discapacidad' => ['nullable', 'string'],
            'ficha.alergico_medicamento' => ['nullable', 'boolean'],
            'ficha.nombre_medicamento_alergico' => ['nullable', 'string'],
            'ficha.vacunado_covid' => ['nullable', 'boolean'],
            'ficha.alimento_alergico' => ['nullable', 'string'],
            'ficha.residencia_estudiante' => ['nullable', 'string', 'max:50'],
            'ficha.municipio' => ['nullable', 'string', 'max:50'],
            'ficha.departamento' => ['nullable', 'string', 'max:50'],
            'ficha.canton' => ['nullable', 'string', 'max:50'],
            'ficha.caserio' => ['nullable', 'string', 'max:50'],
            'ficha.zona' => ['nullable', 'string'],
            'ficha.sexo_responsable' => ['nullable', Rule::in(['M', 'F'])],
            'ficha.fecha_nacimiento_responsable' => ['nullable', 'date'],
            'ficha.vive_con_estudiante' => ['nullable', 'boolean'],
            'ficha.estado_familiar' => ['nullable', 'string', 'max:25'],
            'ficha.certificado' => ['nullable', 'boolean'],
            'ficha.boleta_calificaciones' => ['nullable', 'boolean'],
            'ficha.fotocopia_dui' => ['nullable', 'boolean'],
            'ficha.numero_partida_nacimiento' => ['nullable', 'string'],
            'ficha.folio_partida_nacimiento' => ['nullable', 'string'],
            'ficha.tomo_partida_nacimiento' => ['nullable', 'string'],
            'ficha.libro_partida_nacimiento' => ['nullable', 'string'],
            'ficha.carta_pastoral' => ['nullable', 'boolean'],
            'ficha.nombre_iglesia_asiste' => ['nullable', 'string'],
            'ficha.nombre_madre' => ['nullable', 'string', 'max:60'],
            'ficha.dui_madre' => ['nullable', 'string', 'max:10'],
            'ficha.profesion_madre' => ['nullable', 'string'],
            'ficha.telefono_madre' => ['nullable', 'string', 'max:8'],
            'ficha.direccion_madre' => ['nullable', 'string'],
            'ficha.fecha_nacimiento_madre' => ['nullable', 'date'],
            'ficha.lugar_trabajo_madre' => ['nullable', 'string'],
            'ficha.nombre_padre' => ['nullable', 'string', 'max:60'],
            'ficha.dui_padre' => ['nullable', 'string', 'max:10'],
            'ficha.profesion_padre' => ['nullable', 'string'],
            'ficha.telefono_padre' => ['nullable', 'string', 'max:8'],
            'ficha.direccion_padre' => ['nullable', 'string'],
            'ficha.fecha_nacimiento_padre' => ['nullable', 'date'],
            'ficha.lugar_trabajo_padre' => ['nullable', 'string'],
            'responsables' => ['sometimes', 'array'],
            'responsables.*.id' => ['nullable', 'integer', 'exists:responsables,id'],
            'responsables.*.nombres' => ['required_without:responsables.*.id', 'string', 'max:30'],
            'responsables.*.apellidos' => ['required_without:responsables.*.id', 'string', 'max:30'],
            'responsables.*.dui' => ['required_without:responsables.*.id', 'string', 'max:10'],
            'responsables.*.telefono' => ['nullable', 'string', 'max:30'],
            'responsables.*.correo' => ['nullable', 'email', 'max:50', 'unique:responsables,correo'],
            'responsables.*.parentesco' => ['nullable', 'string', 'max:20'],
            'responsables.*.activo' => ['nullable', 'boolean'],
            'responsables.*.es_contacto_principal' => ['nullable', 'boolean'],
        ]);

        $data = ['estudiante' => collect($data)->except(['ficha', 'responsables'])->all()]
            + collect($data)->only(['ficha', 'responsables'])->all();
        if (isset($data['responsables']) && collect($data['responsables'])->where('es_contacto_principal', true)->count() > 1) {
            throw ValidationException::withMessages([
                'responsables' => 'Solo puede haber un responsable como contacto principal.',
            ]);
        }

        return $data;
    }
}
