<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Api\Support\CrudController;
use App\Services\MoraNotificacionService;

class CuentaPorCobrarController extends CrudController
{
    protected string $tabla = 'cuentas_por_cobrar';

    protected function reglasAdicionales(): array
    {
        return [
            'monto_original' => ['min:0'],
            'monto_mora' => ['min:0'],
            'saldo_pendiente' => ['min:0'],
            'estado' => ['in:pendiente,pagado,vencido'],
        ];
    }

    protected function despuesDeGuardar(?object $anterior, ?object $nuevo): void
    {
        if ($nuevo) {
            app(MoraNotificacionService::class)->evaluar($nuevo->id);
        }
    }
}
