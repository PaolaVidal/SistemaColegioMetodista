<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Policies\Api\ResourcePolicy;
use App\Services\RendimientoNotificacionService;
use App\Services\ContextoAuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CalificacionController extends Controller
{
    public function index(int $asignacion)
    {
        $politica = app(ResourcePolicy::class);
        $politica->autorizar(request()->user(), 'evaluaciones', 'R');
        abort_unless($politica->asignacionVisible(request()->user(), $asignacion), 404);
        $this->obtenerAsignacion($asignacion);

        $evaluaciones = $politica->consulta(request()->user(), 'evaluaciones')
            ->where('id_asignacion_curso', $asignacion)->orderBy('periodo')->orderBy('id')->get();
        if (in_array($politica->rol(request()->user()), ['estudiante', 'responsable'], true)) {
            $evaluaciones->transform(function ($evaluacion) {
                unset($evaluacion->ponderacion);
                return $evaluacion;
            });
        }

        return response()->json($evaluaciones);
    }

    public function show(int $evaluacion)
    {
        $politica = app(ResourcePolicy::class);
        $politica->autorizar(request()->user(), 'calificaciones', 'R');
        abort_unless($politica->visible(request()->user(), 'evaluaciones', $evaluacion), 404);
        $datos = $this->obtenerEvaluacion($evaluacion);
        if (in_array($politica->rol(request()->user()), ['estudiante', 'responsable'], true)) {
            unset($datos->ponderacion);
        }

        return response()->json([
            'evaluacion' => $datos,
            'calificaciones' => $this->listadoCalificaciones($datos),
        ]);
    }

    public function registrar(Request $request, int $evaluacion)
    {
        app(ResourcePolicy::class)->autorizar($request->user(), 'calificaciones', 'U');
        abort_unless(app(ResourcePolicy::class)->visible($request->user(), 'evaluaciones', $evaluacion), 404);
        $data = $request->validate([
            'calificaciones' => ['required', 'array', 'min:1'],
            'calificaciones.*.id_matricula' => ['required', 'integer', 'distinct', 'exists:matriculas,id'],
            'calificaciones.*.nota' => ['required', 'numeric', 'between:0,10'],
        ]);

        DB::transaction(function () use ($evaluacion, $data) {
            app(ContextoAuditoriaService::class)->establecer(request()->user()->id);
            $datos = $this->obtenerEvaluacion($evaluacion, true);
            $matriculas = collect($data['calificaciones'])->pluck('id_matricula')->all();
            $matriculasValidas = DB::table('matriculas')
                ->whereIn('id', $matriculas)
                ->where('id_ciclo', $datos->id_ciclo)
                ->where('id_seccion', $datos->id_seccion)
                ->pluck('id')
                ->all();

            if (count($matriculas) !== count($matriculasValidas)) {
                throw ValidationException::withMessages([
                    'calificaciones' => 'Todas las matrículas deben pertenecer a la sección y ciclo de la evaluación.',
                ]);
            }

            foreach ($data['calificaciones'] as $calificacion) {
                DB::table('calificaciones')->updateOrInsert(
                    ['id_evaluacion' => $evaluacion, 'id_matricula' => $calificacion['id_matricula']],
                    ['nota' => $calificacion['nota']]
                );
            }

            $service = app(RendimientoNotificacionService::class);
            foreach ($matriculas as $matriculaId) {
                $service->evaluarDesdeEvaluacion($evaluacion, $matriculaId);
            }
        });

        return $this->show($evaluacion);
    }

    private function obtenerAsignacion(int $asignacion): object
    {
        $datos = DB::table('asignaciones_cursos')->where('id', $asignacion)->first();
        abort_if($datos === null, 404);

        return $datos;
    }

    private function obtenerEvaluacion(int $evaluacion, bool $bloquear = false): object
    {
        $consulta = DB::table('evaluaciones')
            ->join('asignaciones_cursos', 'evaluaciones.id_asignacion_curso', '=', 'asignaciones_cursos.id')
            ->where('evaluaciones.id', $evaluacion)
            ->select('evaluaciones.*', 'asignaciones_cursos.id_ciclo', 'asignaciones_cursos.id_seccion');

        if ($bloquear) {
            $consulta->lockForUpdate();
        }

        $datos = $consulta->first();
        abort_if($datos === null, 404);

        return $datos;
    }

    private function listadoCalificaciones(object $evaluacion)
    {
        return DB::table('matriculas')
            ->join('estudiantes', 'matriculas.id_estudiante', '=', 'estudiantes.id')
            ->leftJoin('calificaciones', function ($join) use ($evaluacion) {
                $join->on('matriculas.id', '=', 'calificaciones.id_matricula')
                    ->where('calificaciones.id_evaluacion', '=', $evaluacion->id);
            })
            ->where('matriculas.id_ciclo', $evaluacion->id_ciclo)
            ->where('matriculas.id_seccion', $evaluacion->id_seccion)
            ->where('matriculas.estado', true)
            ->whereIn('matriculas.id', app(ResourcePolicy::class)->consulta(request()->user(), 'matriculas')->select('matriculas.id'))
            ->select('matriculas.id as id_matricula', 'estudiantes.codigo_nie', 'estudiantes.nombres', 'estudiantes.apellidos', 'calificaciones.nota')
            ->orderBy('estudiantes.apellidos')
            ->orderBy('estudiantes.nombres')
            ->get();
    }
}
