<?php

namespace App\Services;

use App\Jobs\EnviarNotificacionCorreo;
use Illuminate\Support\Facades\DB;

class RendimientoNotificacionService
{
    public function evaluarDesdeEvaluacion(int $evaluacionId, int $matriculaId): void
    {
        $evaluacion = DB::table('evaluaciones')->where('id', $evaluacionId)
            ->first(['id_asignacion_curso', 'periodo']);

        if ($evaluacion) {
            $this->evaluar($matriculaId, $evaluacion->id_asignacion_curso, $evaluacion->periodo);
        }
    }

    public function evaluar(int $matriculaId, int $asignacionId, int $periodo): void
    {
        DB::table('alertas_rendimiento')->insertOrIgnore([
            'id_matricula' => $matriculaId,
            'id_asignacion_curso' => $asignacionId,
            'periodo' => $periodo,
            'en_riesgo' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $estado = DB::table('alertas_rendimiento')
            ->where('id_matricula', $matriculaId)
            ->where('id_asignacion_curso', $asignacionId)
            ->where('periodo', $periodo)
            ->lockForUpdate()
            ->first();

        $promedio = DB::table('calificaciones as c')
            ->join('evaluaciones as e', 'e.id', '=', 'c.id_evaluacion')
            ->where('c.id_matricula', $matriculaId)
            ->where('e.id_asignacion_curso', $asignacionId)
            ->where('e.periodo', $periodo)
            ->selectRaw('ROUND(SUM(c.nota * e.ponderacion) / SUM(e.ponderacion), 2) AS promedio')
            ->value('promedio');

        $enRiesgo = $promedio !== null && (float) $promedio < 5;
        $antesEnRiesgo = (bool) $estado->en_riesgo;
        DB::table('alertas_rendimiento')->where('id', $estado->id)->update([
            'ultimo_promedio' => $promedio,
            'en_riesgo' => $enRiesgo,
            'updated_at' => now(),
        ]);

        if ($enRiesgo && !$antesEnRiesgo) {
            $this->registrarAvisos($matriculaId, $asignacionId, $periodo, (float) $promedio);
        }
    }

    private function registrarAvisos(int $matriculaId, int $asignacionId, int $periodo, float $promedio): void
    {
        $datos = DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.id_estudiante')
            ->join('asignaciones_cursos as a', function ($join) use ($asignacionId) {
                $join->on('a.id_ciclo', '=', 'm.id_ciclo')
                    ->on('a.id_seccion', '=', 'm.id_seccion')
                    ->where('a.id', $asignacionId);
            })
            ->join('asignaturas as s', 's.id', '=', 'a.id_asignatura')
            ->where('m.id', $matriculaId)
            ->first(['e.id as estudiante_id', 'e.id_usuario', 'e.nombres', 'e.apellidos', 's.nombre as asignatura']);

        if (!$datos) {
            return;
        }

        $destinatarios = DB::table('estudiante_responsable as er')
            ->join('responsables as r', 'r.id', '=', 'er.id_responsable')
            ->join('usuarios as u', 'u.id', '=', 'r.id_usuario')
            ->where('er.id_estudiante', $datos->estudiante_id)
            ->where('r.activo', true)
            ->where('u.activo', true)
            ->select('u.id', 'u.correo')
            ->get();

        if ($datos->id_usuario) {
            $estudiante = DB::table('usuarios')->where('id', $datos->id_usuario)
                ->where('activo', true)->first(['id', 'correo']);
            if ($estudiante) {
                $destinatarios->push($estudiante);
            }
        }

        $asunto = "Alerta de rendimiento - {$datos->asignatura}";
        $contenido = "El promedio de {$datos->nombres} {$datos->apellidos} en "
            . "{$datos->asignatura}, período {$periodo}, bajó a "
            . number_format($promedio, 2) . "/10. "
            . 'Por favor, consulte las calificaciones y dé seguimiento con el docente.';

        foreach ($destinatarios->unique('id') as $destinatario) {
            $notificacionId = DB::table('notificaciones')->insertGetId([
                'id_usuario_destino' => $destinatario->id,
                'tipo' => 'bajo_rendimiento',
                'canal' => 'correo',
                'asunto' => $asunto,
                'contenido' => $contenido,
                'estado_envio' => 'pendiente',
                'created_at' => now(),
            ]);

            if (config('services.n8n.academic_webhook_url')) {
                EnviarNotificacionCorreo::dispatch($notificacionId, $destinatario->correo, 'bajo_rendimiento')
                    ->afterCommit();
            }
        }
    }
}
