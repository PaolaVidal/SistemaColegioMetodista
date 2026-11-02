<?php

namespace App\Http\Controllers\Api\Academico;

use App\Http\Controllers\Api\Support\CrudController;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AsignacionCursoController extends CrudController
{
    protected string $tabla = 'asignaciones_cursos';

    protected function validarNegocio(array $datos, ?object $actual): void
    {
        $ciclo = $datos['id_ciclo'] ?? $actual?->id_ciclo;
        $seccion = $datos['id_seccion'] ?? $actual?->id_seccion;
        if ($ciclo && $seccion && !DB::table('secciones')->where('id', $seccion)->where('id_ciclo', $ciclo)->exists()) {
            throw ValidationException::withMessages(['id_seccion' => 'La sección no pertenece al ciclo indicado.']);
        }
    }
}
