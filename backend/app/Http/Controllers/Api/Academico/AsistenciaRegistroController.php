<?php

namespace App\Http\Controllers\Api\Academico;

use App\Http\Controllers\Api\Support\CrudController;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AsistenciaRegistroController extends CrudController
{
    protected string $tabla = 'asistencias';

    protected function reglasAdicionales(): array
    {
        return ['estado' => ['in:Presente,Ausente,Tardanza,Justificado']];
    }

    protected function validarNegocio(array $datos, ?object $actual): void
    {
        $asignacion = $datos['id_asignacion_curso'] ?? $actual?->id_asignacion_curso;
        $matricula = $datos['id_matricula'] ?? $actual?->id_matricula;
        if (! $asignacion || ! $matricula) {
            return;
        }

        $coincide = DB::table('asignaciones_cursos')
            ->join('matriculas', function ($join) use ($matricula) {
                $join->on('matriculas.id_ciclo', '=', 'asignaciones_cursos.id_ciclo')
                    ->on('matriculas.id_seccion', '=', 'asignaciones_cursos.id_seccion')
                    ->where('matriculas.id', $matricula)
                    ->where('matriculas.estado', true);
            })
            ->where('asignaciones_cursos.id', $asignacion)->exists();
        if (! $coincide) {
            throw ValidationException::withMessages(['id_matricula' => 'La matrícula no está activa en el grupo indicado.']);
        }
    }
}
