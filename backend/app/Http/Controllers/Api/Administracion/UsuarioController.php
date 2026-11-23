<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UsuarioController extends CrudController
{
    protected string $tabla = 'usuarios';

    // El nombre de usuario también sirve para iniciar sesión, por eso no puede repetirse.
    protected function validarNegocio(array $datos, ?object $actual): void
    {
        if (! isset($datos['nombre_usuario'])) {
            return;
        }
        $repetido = DB::table('usuarios')
            ->whereRaw('lower(nombre_usuario) = ?', [mb_strtolower(trim($datos['nombre_usuario']))])
            ->when($actual, fn ($q) => $q->where('id', '!=', $actual->id))
            ->exists();
        if ($repetido) {
            throw ValidationException::withMessages(['nombre_usuario' => 'Ese nombre de usuario ya está en uso.']);
        }
    }

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
