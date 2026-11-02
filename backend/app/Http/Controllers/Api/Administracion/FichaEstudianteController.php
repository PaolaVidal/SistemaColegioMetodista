<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;

class FichaEstudianteController extends CrudController
{
    protected string $tabla = 'ficha_estudiante';

    protected function reglasAdicionales(): array
    {
        return [
            'sexo' => ['in:M,F'],
            'sexo_responsable' => ['in:M,F'],
        ];
    }
}
