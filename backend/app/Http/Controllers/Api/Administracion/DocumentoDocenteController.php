<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;

class DocumentoDocenteController extends CrudController
{
    protected string $tabla = 'documentos_docentes';
}
