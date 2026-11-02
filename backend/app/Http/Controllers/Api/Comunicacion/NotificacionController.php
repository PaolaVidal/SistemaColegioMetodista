<?php

namespace App\Http\Controllers\Api\Comunicacion;

use App\Http\Controllers\Api\Support\CrudController;

class NotificacionController extends CrudController
{
    protected string $tabla = 'notificaciones';

    protected function reglasAdicionales(): array
    {
        return ['estado_envio' => ['in:pendiente,enviado,fallido']];
    }
}
