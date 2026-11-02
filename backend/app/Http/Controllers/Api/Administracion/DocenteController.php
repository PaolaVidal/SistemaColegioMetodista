<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;

class DocenteController extends CrudController
{
    protected string $tabla = 'docente';
}
