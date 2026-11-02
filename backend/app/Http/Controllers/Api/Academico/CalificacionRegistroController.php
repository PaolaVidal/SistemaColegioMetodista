<?php

namespace App\Http\Controllers\Api\Academico;

use App\Http\Controllers\Api\Support\CrudController;
use App\Services\RendimientoNotificacionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CalificacionRegistroController extends CrudController
{
    protected string $tabla = 'calificaciones';

    protected function reglasAdicionales(): array
    {
        return ['nota' => ['between:0,10']];
    }

    protected function validarNegocio(array $datos, ?object $actual): void
    {
        $evaluacion = $datos['id_evaluacion'] ?? $actual?->id_evaluacion;
        $matricula = $datos['id_matricula'] ?? $actual?->id_matricula;
        if (! $evaluacion || ! $matricula) {
            return;
        }

        $coincide = DB::table('evaluaciones')
            ->join('asignaciones_cursos', 'evaluaciones.id_asignacion_curso', '=', 'asignaciones_cursos.id')
            ->join('matriculas', function ($join) use ($matricula) {
                $join->on('matriculas.id_ciclo', '=', 'asignaciones_cursos.id_ciclo')
                    ->on('matriculas.id_seccion', '=', 'asignaciones_cursos.id_seccion')
                    ->where('matriculas.id', $matricula);
            })
            ->where('evaluaciones.id', $evaluacion)->exists();
        if (! $coincide) {
            throw ValidationException::withMessages(['id_matricula' => 'La matrícula no pertenece al grupo evaluado.']);
        }
    }

    protected function despuesDeGuardar(?object $anterior, ?object $nuevo): void
    {
        $service = app(RendimientoNotificacionService::class);
        $combinaciones = [];

        foreach ([$anterior, $nuevo] as $calificacion) {
            if ($calificacion) {
                $combinaciones[$calificacion->id_evaluacion.':'.$calificacion->id_matricula] =
                    [$calificacion->id_evaluacion, $calificacion->id_matricula];
            }
        }

        foreach ($combinaciones as [$evaluacionId, $matriculaId]) {
            $service->evaluarDesdeEvaluacion($evaluacionId, $matriculaId);
        }
    }
}
