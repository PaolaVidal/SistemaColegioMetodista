<?php

namespace App\Http\Controllers\Api\Administracion;

use App\Http\Controllers\Api\Support\CrudController;
use Illuminate\Http\Request;

class AuditoriaController extends CrudController
{
    protected string $tabla = 'auditoria';

    public function store(Request $request)
    {
        abort(405, 'La auditoría se registra automáticamente.');
    }

    public function update(Request $request, int $registro)
    {
        abort(405, 'La auditoría es inmutable.');
    }

    public function destroy(int $registro)
    {
        abort(405, 'La auditoría es inmutable.');
    }

    protected function presentar(object $registro): object
    {
        foreach (['valor_anterior', 'valor_nuevo'] as $campo) {
            if (is_string($registro->$campo)) {
                $registro->$campo = json_decode($registro->$campo, true, 512, JSON_THROW_ON_ERROR);
            }
        }

        return $registro;
    }
}
