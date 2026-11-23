<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Policies\Api\ResourcePolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AsistenciaController extends Controller
{
    public function index(Request $request, int $asignacion)
    {
        $politica = app(ResourcePolicy::class);
        $politica->autorizar($request->user(), 'asistencias', 'R');
        abort_unless($politica->asignacionVisible($request->user(), $asignacion), 404);
        $fecha = $request->validate(['fecha' => ['required', 'date']])['fecha'];
        $datos = $this->obtenerAsignacion($asignacion);

        return response()->json([
            'asignacion' => $datos,
            'fecha' => $fecha,
            'estudiantes' => $this->listadoAsistencia($datos, $fecha),
        ]);
    }

    public function registrar(Request $request, int $asignacion, string $fecha)
    {
        $politica = app(ResourcePolicy::class);
        $politica->autorizar($request->user(), 'asistencias', 'U');
        abort_unless($politica->asignacionVisible($request->user(), $asignacion), 404);
        $data = $request->validate([
            'asistencias' => ['required', 'array', 'min:1'],
            'asistencias.*.id_matricula' => ['required', 'integer', 'distinct', 'exists:matriculas,id'],
            'asistencias.*.estado' => ['required', Rule::in(['Presente', 'Ausente', 'Tardanza', 'Justificado'])],
        ]);

        validator(['fecha' => $fecha], ['fecha' => ['date_format:Y-m-d']])->validate();

        DB::transaction(function () use ($asignacion, $fecha, $data) {
            $datos = $this->obtenerAsignacion($asignacion, true);
            $matriculas = collect($data['asistencias'])->pluck('id_matricula')->all();
            $matriculasValidas = DB::table('matriculas')
                ->whereIn('id', $matriculas)
                ->where('id_ciclo', $datos->id_ciclo)
                ->where('id_seccion', $datos->id_seccion)
                ->where('estado', true)
                ->pluck('id')
                ->all();

            if (count($matriculas) !== count($matriculasValidas)) {
                throw ValidationException::withMessages([
                    'asistencias' => 'Todas las matrículas deben estar activas y pertenecer a la sección y ciclo de la asignación.',
                ]);
            }

            foreach ($data['asistencias'] as $asistencia) {
                DB::table('asistencias')->updateOrInsert(
                    [
                        'id_matricula' => $asistencia['id_matricula'],
                        'id_asignacion_curso' => $asignacion,
                        'fecha' => $fecha,
                    ],
                    ['estado' => $asistencia['estado']]
                );
            }
        });

        $datos = $this->obtenerAsignacion($asignacion);

        return response()->json([
            'asignacion' => $datos,
            'fecha' => $fecha,
            'estudiantes' => $this->listadoAsistencia($datos, $fecha),
        ]);
    }

    public function historialEstudiante(Request $request, int $estudiante)
    {
        $politica = app(ResourcePolicy::class);
        $politica->autorizar($request->user(), 'asistencias', 'R');
        abort_unless($politica->visible($request->user(), 'estudiantes', $estudiante), 404);
        abort_if(DB::table('estudiantes')->where('id', $estudiante)->doesntExist(), 404);
        $consulta = DB::table('asistencias')
            ->join('matriculas', 'asistencias.id_matricula', '=', 'matriculas.id')
            ->join('asignaciones_cursos', 'asistencias.id_asignacion_curso', '=', 'asignaciones_cursos.id')
            ->join('asignaturas', 'asignaciones_cursos.id_asignatura', '=', 'asignaturas.id')
            ->where('matriculas.id_estudiante', $estudiante)
            ->whereIn('asistencias.id', $politica->consulta($request->user(), 'asistencias')->select('asistencias.id'))
            ->select('asistencias.*', 'asignaturas.nombre as asignatura', 'asignaturas.codigo as codigo_asignatura');

        if ($request->filled('fecha_inicio')) {
            $consulta->whereDate('asistencias.fecha', '>=', $request->date('fecha_inicio'));
        }

        if ($request->filled('fecha_fin')) {
            $consulta->whereDate('asistencias.fecha', '<=', $request->date('fecha_fin'));
        }

        return response()->json($consulta->orderByDesc('asistencias.fecha')->paginate(30));
    }

    private function obtenerAsignacion(int $asignacion, bool $bloquear = false): object
    {
        $consulta = DB::table('asignaciones_cursos')->where('id', $asignacion);
        if ($bloquear) {
            $consulta->lockForUpdate();
        }

        $datos = $consulta->first();
        abort_if($datos === null, 404);

        return $datos;
    }

    private function listadoAsistencia(object $asignacion, string $fecha)
    {
        return DB::table('matriculas')
            ->join('estudiantes', 'matriculas.id_estudiante', '=', 'estudiantes.id')
            ->leftJoin('asistencias', function ($join) use ($asignacion, $fecha) {
                $join->on('matriculas.id', '=', 'asistencias.id_matricula')
                    ->where('asistencias.id_asignacion_curso', '=', $asignacion->id)
                    ->where('asistencias.fecha', '=', $fecha);
            })
            ->where('matriculas.id_ciclo', $asignacion->id_ciclo)
            ->where('matriculas.id_seccion', $asignacion->id_seccion)
            ->where('matriculas.estado', true)
            ->whereIn('matriculas.id', app(ResourcePolicy::class)->consulta(request()->user(), 'matriculas')->select('matriculas.id'))
            ->select('matriculas.id as id_matricula', 'estudiantes.codigo_nie', 'estudiantes.nombres', 'estudiantes.apellidos', 'asistencias.estado')
            ->orderBy('estudiantes.apellidos')
            ->orderBy('estudiantes.nombres')
            ->get();
    }
}
