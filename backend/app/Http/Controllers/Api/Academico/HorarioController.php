<?php

namespace App\Http\Controllers\Api\Academico;

use App\Http\Controllers\Api\Support\CrudController;
use Illuminate\Validation\ValidationException;

class HorarioController extends CrudController
{
    protected string $tabla = 'horarios';

    protected function validarNegocio(array $datos, ?object $actual): void
    {
        $inicio = $datos['hora_inicio'] ?? $actual?->hora_inicio;
        $fin = $datos['hora_fin'] ?? $actual?->hora_fin;
        if ($inicio && $fin && strtotime($inicio) >= strtotime($fin)) {
            throw ValidationException::withMessages(['hora_fin' => 'La hora final debe ser posterior a la inicial.']);
        }
    }
}
