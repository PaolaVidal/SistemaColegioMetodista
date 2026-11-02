<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Api\Support\CrudController;

class ArancelBaseController extends CrudController
{
    protected string $tabla = 'aranceles_base';
}
