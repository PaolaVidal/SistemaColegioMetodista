<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Support\CrudController;
use Illuminate\Validation\ValidationException;

class CicloController extends CrudController
{
    protected string $tabla = 'ciclos';

    protected function validarNegocio(array $datos, ?object $actual): void
    {
        $inicio = $datos['fecha_inicio'] ?? $actual?->fecha_inicio;
        $fin = $datos['fecha_fin'] ?? $actual?->fecha_fin;
        if ($inicio && $fin && strtotime($inicio) >= strtotime($fin)) {
            throw ValidationException::withMessages(['fecha_fin' => 'La fecha de fin debe ser posterior al inicio.']);
        }
    }
}
