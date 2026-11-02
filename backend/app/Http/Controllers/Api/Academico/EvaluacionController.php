<?php

namespace App\Http\Controllers\Api\Academico;

use App\Http\Controllers\Api\Support\CrudController;
use App\Services\RendimientoNotificacionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EvaluacionController extends CrudController
{
    protected string $tabla = 'evaluaciones';

    protected function reglasAdicionales(): array
    {
        return [
            'ponderacion' => ['gt:0', 'lte:100'],
            'periodo' => ['min:1', 'max:12'],
        ];
    }

    protected function validarNegocio(array $datos, ?object $actual): void
    {
        $asignacion = $datos['id_asignacion_curso'] ?? $actual?->id_asignacion_curso;
        $periodo = $datos['periodo'] ?? $actual?->periodo;
        $ponderacion = $datos['ponderacion'] ?? $actual?->ponderacion;
        if (!$asignacion || !$periodo || !$ponderacion) return;

        DB::table('asignaciones_cursos')->where('id', $asignacion)->lockForUpdate()->first();
        $consulta = DB::table('evaluaciones')
            ->where('id_asignacion_curso', $asignacion)
            ->where('periodo', $periodo);
        if ($actual) $consulta->where('id', '<>', $actual->id);
        if ((float) $consulta->sum('ponderacion') + (float) $ponderacion > 100) {
            throw ValidationException::withMessages(['ponderacion' => 'La ponderación acumulada del período supera 100.']);
        }
    }

    protected function despuesDeGuardar(?object $anterior, ?object $nuevo): void
    {
        if (!$anterior || !$nuevo || (
            $anterior->ponderacion == $nuevo->ponderacion
            && $anterior->periodo == $nuevo->periodo
            && $anterior->id_asignacion_curso == $nuevo->id_asignacion_curso
        )) {
            return;
        }

        $service = app(RendimientoNotificacionService::class);
        $combinaciones = [];
        foreach ([$anterior, $nuevo] as $evaluacion) {
            $combinaciones[$evaluacion->id_asignacion_curso . ':' . $evaluacion->periodo] =
                [$evaluacion->id_asignacion_curso, $evaluacion->periodo];
        }

        foreach ($combinaciones as [$asignacionId, $periodo]) {
            $asignacion = DB::table('asignaciones_cursos')->where('id', $asignacionId)
                ->first(['id_ciclo', 'id_seccion']);
            if (!$asignacion) {
                continue;
            }

            $matriculas = DB::table('matriculas')
                ->where('id_ciclo', $asignacion->id_ciclo)
                ->where('id_seccion', $asignacion->id_seccion)
                ->pluck('id');
            foreach ($matriculas as $matriculaId) {
                $service->evaluar($matriculaId, $asignacionId, $periodo);
            }
        }
    }
}
