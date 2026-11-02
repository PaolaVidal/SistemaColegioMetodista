<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Api\Support\CrudController;
use App\Services\PagoNotificacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PagoController extends CrudController
{
    protected string $tabla = 'pagos';

    public function store(Request $request)
    {
        $request->merge([
            'registrado_por' => $request->user()->id,
            'fecha_pago' => $request->input('fecha_pago', now()->toDateString()),
        ]);

        return parent::store($request);
    }

    protected function reglasAdicionales(): array
    {
        return ['monto_pago' => ['gt:0']];
    }

    protected function validarNegocio(array $datos, ?object $actual): void
    {
        $cuentaId = $datos['id_cuenta_cobrar'] ?? $actual?->id_cuenta_cobrar;
        $monto = $datos['monto_pago'] ?? $actual?->monto_pago;
        if (!$cuentaId || !$monto) return;

        $cuenta = DB::table('cuentas_por_cobrar')->where('id', $cuentaId)->lockForUpdate()->first();
        if (!$cuenta) return;
        $otrosPagos = DB::table('pagos')->where('id_cuenta_cobrar', $cuentaId);
        if ($actual) $otrosPagos->where('id', '<>', $actual->id);
        $disponible = round((float) $cuenta->monto_original + (float) $cuenta->monto_mora - (float) $otrosPagos->sum('monto_pago'), 2);
        if ((float) $monto > $disponible) {
            throw ValidationException::withMessages(['monto_pago' => 'El pago supera el saldo disponible.']);
        }
    }

    protected function despuesDeGuardar(?object $anterior, ?object $nuevo): void
    {
        foreach (array_unique(array_filter([$anterior?->id_cuenta_cobrar, $nuevo?->id_cuenta_cobrar])) as $cuentaId) {
            $cuenta = DB::table('cuentas_por_cobrar')->where('id', $cuentaId)->lockForUpdate()->first();
            if (!$cuenta) continue;
            $abonado = (float) DB::table('pagos')->where('id_cuenta_cobrar', $cuentaId)->sum('monto_pago');
            $saldo = max(0, round((float) $cuenta->monto_original + (float) $cuenta->monto_mora - $abonado, 2));
            $estado = $saldo <= 0 ? 'pagado' : ($cuenta->fecha_vencimiento < now()->toDateString() ? 'vencido' : 'pendiente');
            DB::table('cuentas_por_cobrar')->where('id', $cuentaId)->update([
                'saldo_pendiente' => $saldo,
                'estado' => $estado,
                'updated_at' => now(),
            ]);
        }

        if ($anterior === null && $nuevo !== null) {
            app(PagoNotificacionService::class)->registrar($nuevo->id);
        }
    }
}
