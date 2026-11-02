<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends CrudController
{
    protected string $tabla = 'usuarios';

    protected function preparar(array $datos): array
    {
        if (isset($datos['contrasena'])) {
            $datos['contrasena'] = Hash::make($datos['contrasena']);
        }

        return $datos;
    }

    protected function presentar(object $registro): object
    {
        unset($registro->contrasena, $registro->token_recuperacion, $registro->version_sesion);

        return $registro;
    }
}
