<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Api\Support\CrudController;
use App\Services\CuentasCobroService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

// Descuentos y becas por estudiante y arancel. Afectan las cuentas aún no pagadas.
class DescuentoAlumnoController extends CrudController
{
    protected string $tabla = 'descuentos_alumnos';

    // Se puede enviar el porcentaje o el monto final; el otro se calcula a partir del arancel.
    public function store(Request $request)
    {
        $this->completarMontos($request, null);

        return parent::store($request);
    }

    public function update(Request $request, int $registro)
    {
        $this->completarMontos($request, DB::table('descuentos_alumnos')->where('id', $registro)->first());

        return parent::update($request, $registro);
    }

    protected function reglasAdicionales(): array
    {
        return [
            'porcentaje_descuento' => ['min:0', 'max:100'],
            'monto_fijo_ajustado' => ['min:0'],
        ];
    }

    protected function mensajesValidacion(): array
    {
        return [
            'porcentaje_descuento.max' => 'El porcentaje de descuento no puede ser mayor que 100.',
            'porcentaje_descuento.min' => 'El porcentaje de descuento no puede ser negativo.',
            'motivo.required' => 'Indique el motivo del descuento.',
        ];
    }

    protected function validarNegocio(array $datos, ?object $actual): void
    {
        $estudiante = $datos['id_estudiante'] ?? $actual?->id_estudiante;
        $arancel = $datos['id_arancel'] ?? $actual?->id_arancel;
        $repetido = DB::table('descuentos_alumnos')->where('id_estudiante', $estudiante)->where('id_arancel', $arancel)
            ->when($actual, fn ($q) => $q->where('id', '!=', $actual->id))->exists();
        if ($repetido) {
            throw ValidationException::withMessages(['id_arancel' => 'El estudiante ya tiene un descuento para ese arancel; edítelo en lugar de crear otro.']);
        }
    }

    protected function despuesDeGuardar(?object $anterior, ?object $nuevo): void
    {
        $servicio = app(CuentasCobroService::class);
        foreach ([$anterior, $nuevo] as $descuento) {
            if ($descuento) {
                $servicio->aplicarDescuento((int) $descuento->id_estudiante, (int) $descuento->id_arancel);
            }
        }
    }

    private function completarMontos(Request $request, ?object $actual): void
    {
        $idArancel = $request->input('id_arancel', $actual?->id_arancel);
        $estandar = (float) DB::table('aranceles_base')->where('id', $idArancel)->value('monto_estandar');
        if ($estandar <= 0) {
            return;
        }
        if ($request->filled('monto_fijo_ajustado')) {
            $monto = (float) $request->input('monto_fijo_ajustado');
            if ($monto > $estandar) {
                throw ValidationException::withMessages(['monto_fijo_ajustado' => 'El monto con descuento no puede ser mayor que el monto del arancel.']);
            }
            $request->merge(['porcentaje_descuento' => round((1 - $monto / $estandar) * 100, 2)]);
        } elseif ($request->filled('porcentaje_descuento')) {
            $porcentaje = min(100, max(0, (float) $request->input('porcentaje_descuento')));
            $request->merge(['monto_fijo_ajustado' => round($estandar * (1 - $porcentaje / 100), 2)]);
        }
    }
}
