<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Api\Support\CrudController;

class DescuentoAlumnoController extends CrudController
{
    protected string $tabla = 'descuentos_alumnos';
}
