<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Api\Support\CrudController;
use App\Policies\Api\ResourcePolicy;
use Illuminate\Support\Facades\DB;

class ArancelBaseController extends CrudController
{
    protected string $tabla = 'aranceles_base';

    protected function reglasAdicionales(): array
    {
        return [
            'monto_estandar' => ['min:0'],
            'recargo_mora' => ['min:0'],
            'dia_vencimiento_mes' => ['min:1', 'max:31'],
            'tipo_cobro' => ['in:unico,mensual'],
            // Solo el sistema decide qué aranceles son base (Matrícula y Mensualidad).
            'protegido' => ['prohibited'],
        ];
    }

    // Elimina el arancel con sus descuentos y cuentas. Si hay pagos registrados se exige
    // confirmación explícita (?confirmar_pagos=1) porque también se eliminarán.
    public function destroy(int $registro)
    {
        app(ResourcePolicy::class)->autorizar(request()->user(), $this->tabla, 'D');
        $arancel = DB::table('aranceles_base')->where('id', $registro)->first();
        abort_if($arancel === null, 404, 'Registro no encontrado.');
        abort_if($arancel->protegido, 422, "El arancel {$arancel->nombre_concepto} es un arancel base del sistema y no se puede eliminar.");

        $cuentas = DB::table('cuentas_por_cobrar')->where('id_arancel', $registro)->pluck('id');
        $pagos = DB::table('pagos')->whereIn('id_cuenta_cobrar', $cuentas)->count();
        if ($pagos > 0 && ! request()->boolean('confirmar_pagos')) {
            return response()->json([
                'message' => "El arancel tiene {$pagos} pago(s) registrado(s). Confirme para eliminarlos junto con el arancel.",
                'pagos' => $pagos,
                'cuentas' => $cuentas->count(),
            ], 409);
        }

        DB::transaction(function () use ($registro, $cuentas) {
            DB::table('pagos')->whereIn('id_cuenta_cobrar', $cuentas)->delete();
            DB::table('cuentas_por_cobrar')->whereIn('id', $cuentas)->delete();
            DB::table('descuentos_alumnos')->where('id_arancel', $registro)->delete();
            DB::table('aranceles_base')->where('id', $registro)->delete();
        });

        return response()->noContent();
    }

    protected function mensajesValidacion(): array
    {
        return [
            'dia_vencimiento_mes.min' => 'El día de vencimiento debe estar entre 1 y 31.',
            'dia_vencimiento_mes.max' => 'El día de vencimiento debe estar entre 1 y 31.',
            'tipo_cobro.in' => 'El tipo de cobro debe ser único o mensual.',
        ];
    }

    // Si cambia el monto estándar, los descuentos se recalculan con su mismo porcentaje.
    // Las cuentas ya emitidas conservan el monto con el que se generaron.
    protected function despuesDeGuardar(?object $anterior, ?object $nuevo): void
    {
        if ($anterior && $nuevo && (float) $anterior->monto_estandar !== (float) $nuevo->monto_estandar) {
            DB::table('descuentos_alumnos')->where('id_arancel', $nuevo->id)->update([
                'monto_fijo_ajustado' => DB::raw('round('.(float) $nuevo->monto_estandar.' * (1 - porcentaje_descuento / 100), 2)'),
                'updated_at' => now(),
            ]);
        }
    }
}
