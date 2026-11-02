<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;

class ResponsableController extends CrudController
{
    protected string $tabla = 'responsables';
}
