<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;
use App\Support\Formatos;

class ResponsableController extends CrudController
{
    protected string $tabla = 'responsables';

    protected function reglasAdicionales(): array
    {
        return [
            'dui' => [Formatos::DUI],
            'telefono' => [Formatos::TELEFONO],
        ];
    }

    protected function mensajesValidacion(): array
    {
        return Formatos::mensajes(['dui' => 'dui', 'telefono' => 'telefono']);
    }
}
