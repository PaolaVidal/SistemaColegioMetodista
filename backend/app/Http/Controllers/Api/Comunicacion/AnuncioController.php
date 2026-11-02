<?php

namespace App\Http\Controllers\Api\Comunicacion;

use App\Http\Controllers\Api\Support\CrudController;

class AnuncioController extends CrudController
{
    protected string $tabla = 'anuncios';
}
