<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

// Reglas de cobro: generación de cuentas por arancel, descuentos y saldos.
class CuentasCobroService
{
    private const MESES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
        'septiembre', 'octubre', 'noviembre', 'diciembre'];

    public function hoy(): Carbon
    {
        return Carbon::today('America/El_Salvador');
    }

    // Monto que paga el estudiante por el arancel: el ajustado por su descuento o el estándar.
    public function montoParaEstudiante(object $arancel, int $estudiante): float
    {
        $descuento = DB::table('descuentos_alumnos')
            ->where('id_estudiante', $estudiante)->where('id_arancel', $arancel->id)->first();

        return round((float) ($descuento ? $descuento->monto_fijo_ajustado : $arancel->monto_estandar), 2);
    }

    // Cuotas a cobrar: una para aranceles únicos; una por mes restante del ciclo para los mensuales.
    // Si el ciclo está en curso se cobra desde el mes actual, y una cuota cuyo día de vencimiento ya
    // pasó vence el día de la matrícula (no nace vencida). Si no, se cobra desde el inicio del ciclo.
    public function cuotas(object $arancel, object $ciclo): array
    {
        $hoy = $this->hoy();
        $inicio = Carbon::parse($ciclo->fecha_inicio)->startOfMonth();
        $fin = Carbon::parse($ciclo->fecha_fin);
        $enCurso = $hoy->betweenIncluded(Carbon::parse($ciclo->fecha_inicio), $fin);
        $desde = $enCurso ? $hoy->copy()->startOfMonth() : $inicio;
        $anio = Carbon::parse($ciclo->fecha_inicio)->year;
        $vencimiento = function (Carbon $mes) use ($arancel, $enCurso, $hoy): string {
            $vence = $this->diaDelMes($mes, (int) $arancel->dia_vencimiento_mes);

            return ($enCurso && $vence->lessThan($hoy) ? $hoy : $vence)->toDateString();
        };

        if ($arancel->tipo_cobro !== 'mensual') {
            return [['concepto' => "{$arancel->nombre_concepto} {$anio}", 'vence' => $vencimiento($desde)]];
        }

        $cuotas = [];
        for ($mes = $desde->copy(); $mes->lessThanOrEqualTo($fin); $mes->addMonthNoOverflow()) {
            $cuotas[] = [
                'concepto' => "{$arancel->nombre_concepto} de ".self::MESES[$mes->month]." {$mes->year}",
                'vence' => $vencimiento($mes),
            ];
        }

        return $cuotas;
    }

    // Crea las cuentas por cobrar del arancel para el estudiante (sin duplicar conceptos ya emitidos).
    public function generar(int $estudiante, object $arancel): array
    {
        $ciclo = DB::table('ciclos')->where('id', $arancel->id_ciclo)->first();
        $monto = $this->montoParaEstudiante($arancel, $estudiante);
        $hoy = $this->hoy()->toDateString();
        $ids = [];
        foreach ($this->cuotas($arancel, $ciclo) as $cuota) {
            $existe = DB::table('cuentas_por_cobrar')->where('id_estudiante', $estudiante)
                ->where('id_arancel', $arancel->id)->where('concepto', $cuota['concepto'])->exists();
            if ($existe) {
                continue;
            }
            $ids[] = DB::table('cuentas_por_cobrar')->insertGetId([
                'id_estudiante' => $estudiante,
                'id_arancel' => $arancel->id,
                'concepto' => $cuota['concepto'],
                'monto_original' => $monto,
                'monto_mora' => 0,
                'saldo_pendiente' => $monto,
                'fecha_emision' => $hoy,
                'fecha_vencimiento' => $cuota['vence'],
                'estado' => $cuota['vence'] < $hoy ? 'vencido' : 'pendiente',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $ids;
    }

    // Aplica el monto vigente (con o sin descuento) a las cuentas aún no pagadas del estudiante para ese arancel.
    public function aplicarDescuento(int $estudiante, int $idArancel): void
    {
        $arancel = DB::table('aranceles_base')->where('id', $idArancel)->first();
        if (! $arancel) {
            return;
        }
        $monto = $this->montoParaEstudiante($arancel, $estudiante);
        $cuentas = DB::table('cuentas_por_cobrar')->where('id_estudiante', $estudiante)
            ->where('id_arancel', $idArancel)->where('estado', '!=', 'pagado')->lockForUpdate()->pluck('id');
        foreach ($cuentas as $id) {
            DB::table('cuentas_por_cobrar')->where('id', $id)->update(['monto_original' => $monto]);
            $this->recalcularSaldo($id);
        }
    }

    // Saldo = monto + mora - abonos; el estado se deduce del saldo y del vencimiento.
    public function recalcularSaldo(int $cuentaId): void
    {
        $cuenta = DB::table('cuentas_por_cobrar')->where('id', $cuentaId)->lockForUpdate()->first();
        if (! $cuenta) {
            return;
        }
        $abonado = (float) DB::table('pagos')->where('id_cuenta_cobrar', $cuentaId)->sum('monto_pago');
        $saldo = max(0, round((float) $cuenta->monto_original + (float) $cuenta->monto_mora - $abonado, 2));
        $estado = $saldo <= 0 ? 'pagado' : ($cuenta->fecha_vencimiento < $this->hoy()->toDateString() ? 'vencido' : 'pendiente');
        DB::table('cuentas_por_cobrar')->where('id', $cuentaId)->update([
            'saldo_pendiente' => $saldo,
            'estado' => $estado,
            'updated_at' => now(),
        ]);
    }

    // Al vencer una cuenta se le suma una sola vez el recargo por mora de su arancel.
    public function aplicarMora(int $cuentaId): void
    {
        $cuenta = DB::table('cuentas_por_cobrar as c')->join('aranceles_base as a', 'a.id', '=', 'c.id_arancel')
            ->where('c.id', $cuentaId)->first(['c.monto_mora', 'a.recargo_mora']);
        if ($cuenta && (float) $cuenta->monto_mora <= 0 && (float) $cuenta->recargo_mora > 0) {
            DB::table('cuentas_por_cobrar')->where('id', $cuentaId)->update(['monto_mora' => $cuenta->recargo_mora]);
            $this->recalcularSaldo($cuentaId);
        }
    }

    // Número de comprobante: REC-AAAAMMDD-0001, correlativo por día.
    public function siguienteComprobante(?Carbon $fecha = null): string
    {
        $prefijo = 'REC-'.($fecha ?? $this->hoy())->format('Ymd').'-';
        DB::select('SELECT pg_advisory_xact_lock(hashtext(?))', [$prefijo]);
        $ultimo = DB::table('pagos')->where('numero_comprobante', 'like', $prefijo.'%')
            ->selectRaw('max(substring(numero_comprobante from '.(strlen($prefijo) + 1).')::int) as n')
            ->value('n');

        return $prefijo.str_pad((string) ((int) $ultimo + 1), 4, '0', STR_PAD_LEFT);
    }

    private function diaDelMes(Carbon $mes, int $dia): Carbon
    {
        return $mes->copy()->startOfMonth()->day(min($dia, $mes->daysInMonth));
    }
}
