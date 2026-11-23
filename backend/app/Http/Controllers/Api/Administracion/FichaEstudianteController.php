<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;
use App\Support\Formatos;

class FichaEstudianteController extends CrudController
{
    protected string $tabla = 'ficha_estudiante';

    protected function reglasAdicionales(): array
    {
        return [
            'sexo' => ['in:M,F'],
            'sexo_responsable' => ['in:M,F'],
            'dui_madre' => [Formatos::DUI],
            'dui_padre' => [Formatos::DUI],
            'telefono_madre' => [Formatos::TELEFONO],
            'telefono_padre' => [Formatos::TELEFONO],
        ];
    }

    protected function mensajesValidacion(): array
    {
        return Formatos::mensajes(['dui_madre' => 'dui', 'dui_padre' => 'dui', 'telefono_madre' => 'telefono', 'telefono_padre' => 'telefono']);
    }
}
