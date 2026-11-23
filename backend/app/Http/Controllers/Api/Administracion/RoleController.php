<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;

class RoleController extends CrudController
{
    protected string $tabla = 'roles';
}
