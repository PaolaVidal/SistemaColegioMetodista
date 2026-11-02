<?php

namespace App\Http\Controllers\Api\Academico;

use App\Http\Controllers\Api\Support\CrudController;

class TareaController extends CrudController
{
    protected string $tabla = 'tareas';

    protected function reglasAdicionales(): array
    {
        return ['estado' => ['in:borrador,publicada,finalizada']];
    }
}
