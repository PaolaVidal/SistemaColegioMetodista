<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;

class EstudianteResponsableController extends CrudController
{
    protected string $tabla = 'estudiante_responsable';
}
