<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Api\Support\CrudController;
use App\Services\CuentasCobroService;
use App\Services\PagoNotificacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PagoController extends CrudController
{
    protected string $tabla = 'pagos';

    private const COMPROBANTE_AUTOMATICO = '__automatico__';

    public function store(Request $request)
    {
        // El comprobante se numera solo (REC-AAAAMMDD-0001); se ignora uno enviado a mano.
        $request->merge([
            'registrado_por' => $request->user()->id,
            'fecha_pago' => $request->input('fecha_pago', now()->toDateString()),
            'numero_comprobante' => self::COMPROBANTE_AUTOMATICO,
        ]);

        return parent::store($request);
    }

    protected function preparar(array $datos): array
    {
        if (($datos['numero_comprobante'] ?? null) === self::COMPROBANTE_AUTOMATICO) {
            $datos['numero_comprobante'] = app(CuentasCobroService::class)->siguienteComprobante();
        }

        return $datos;
    }

    protected function reglasAdicionales(): array
    {
        return ['monto_pago' => ['gt:0']];
    }

    protected function validarNegocio(array $datos, ?object $actual): void
    {
        $cuentaId = $datos['id_cuenta_cobrar'] ?? $actual?->id_cuenta_cobrar;
        $monto = $datos['monto_pago'] ?? $actual?->monto_pago;
        if (! $cuentaId || ! $monto) {
            return;
        }

        $cuenta = DB::table('cuentas_por_cobrar')->where('id', $cuentaId)->lockForUpdate()->first();
        if (! $cuenta) {
            return;
        }
        $otrosPagos = DB::table('pagos')->where('id_cuenta_cobrar', $cuentaId);
        if ($actual) {
            $otrosPagos->where('id', '<>', $actual->id);
        }
        $disponible = round((float) $cuenta->monto_original + (float) $cuenta->monto_mora - (float) $otrosPagos->sum('monto_pago'), 2);
        if ((float) $monto > $disponible) {
            throw ValidationException::withMessages(['monto_pago' => 'El pago supera el saldo disponible.']);
        }
    }

    protected function despuesDeGuardar(?object $anterior, ?object $nuevo): void
    {
        foreach (array_unique(array_filter([$anterior?->id_cuenta_cobrar, $nuevo?->id_cuenta_cobrar])) as $cuentaId) {
            app(CuentasCobroService::class)->recalcularSaldo((int) $cuentaId);
        }

        if ($anterior === null && $nuevo !== null) {
            app(PagoNotificacionService::class)->registrar($nuevo->id);
        }
    }
}
