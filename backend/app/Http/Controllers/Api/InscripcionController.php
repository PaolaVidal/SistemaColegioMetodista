<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Policies\Api\ResourcePolicy;
use App\Services\CuentasCobroService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

// Matrícula completa: registra la matrícula, los descuentos elegidos y las cuentas por cobrar
// de los aranceles seleccionados, todo en una sola transacción.
class InscripcionController extends Controller
{
    public function store(Request $request, CuentasCobroService $cobros)
    {
        $politica = app(ResourcePolicy::class);
        $politica->autorizar($request->user(), 'matriculas', 'C');
        if ($request->filled('aranceles')) {
            $politica->autorizar($request->user(), 'cuentas_por_cobrar', 'C');
        }
        if (collect($request->input('aranceles', []))->contains(fn ($a) => array_key_exists('descuento', (array) $a))) {
            $politica->autorizar($request->user(), 'descuentos_alumnos', 'C');
        }

        $datos = $request->validate([
            'id_estudiante' => ['required', 'integer', 'exists:estudiantes,id'],
            'id_ciclo' => ['required', 'integer', 'exists:ciclos,id'],
            'id_seccion' => ['required', 'integer', 'exists:secciones,id'],
            'aranceles' => ['sometimes', 'array'],
            'aranceles.*.id' => ['required', 'integer', 'distinct', 'exists:aranceles_base,id'],
            'aranceles.*.descuento' => ['nullable', 'array'],
            'aranceles.*.descuento.porcentaje_descuento' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'aranceles.*.descuento.monto_fijo_ajustado' => ['nullable', 'numeric', 'min:0'],
            'aranceles.*.descuento.motivo' => ['required_with:aranceles.*.descuento', 'string', 'max:255'],
        ], [
            'aranceles.*.descuento.motivo.required_with' => 'Indique el motivo de cada descuento.',
            'aranceles.*.descuento.porcentaje_descuento.max' => 'El porcentaje de descuento no puede ser mayor que 100.',
        ]);

        $resultado = DB::transaction(function () use ($datos, $request, $cobros) {
            $this->validarMatricula($datos);
            $idMatricula = DB::table('matriculas')->insertGetId([
                'id_estudiante' => $datos['id_estudiante'],
                'id_ciclo' => $datos['id_ciclo'],
                'id_seccion' => $datos['id_seccion'],
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $cuentas = [];
            foreach ($request->input('aranceles', []) as $elegido) {
                $arancel = DB::table('aranceles_base')->where('id', $elegido['id'])->first();
                if ((int) $arancel->id_ciclo !== (int) $datos['id_ciclo']) {
                    throw ValidationException::withMessages(['aranceles' => "El arancel {$arancel->nombre_concepto} no pertenece al ciclo de la matrícula."]);
                }
                if (array_key_exists('descuento', $elegido)) {
                    $this->guardarDescuento((int) $datos['id_estudiante'], $arancel, $elegido['descuento']);
                }
                $cuentas = array_merge($cuentas, $cobros->generar((int) $datos['id_estudiante'], $arancel));
            }

            return ['id' => $idMatricula, 'cuentas' => $cuentas];
        });

        return response()->json([
            'matricula' => DB::table('matriculas')->where('id', $resultado['id'])->first(),
            'cuentas' => DB::table('cuentas_por_cobrar')->whereIn('id', $resultado['cuentas'])->orderBy('fecha_vencimiento')->get(),
        ], 201);
    }

    private function validarMatricula(array $datos): void
    {
        $seccion = DB::table('secciones')->where('id', $datos['id_seccion'])->lockForUpdate()->first();
        if ((int) $seccion->id_ciclo !== (int) $datos['id_ciclo']) {
            throw ValidationException::withMessages(['id_seccion' => 'La sección no pertenece al ciclo indicado.']);
        }
        if (DB::table('matriculas')->where('id_estudiante', $datos['id_estudiante'])->where('id_ciclo', $datos['id_ciclo'])->exists()) {
            throw ValidationException::withMessages(['id_ciclo' => 'El estudiante ya tiene matrícula en ese ciclo.']);
        }
        $ocupados = DB::table('matriculas')->where('id_seccion', $seccion->id)->where('estado', true)->count();
        if ($seccion->capacidad !== null && $ocupados >= $seccion->capacidad) {
            throw ValidationException::withMessages(['id_seccion' => 'La sección ya no tiene cupos disponibles.']);
        }
    }

    // descuento null elimina el existente; un objeto lo crea o actualiza.
    private function guardarDescuento(int $estudiante, object $arancel, ?array $descuento): void
    {
        $clave = ['id_estudiante' => $estudiante, 'id_arancel' => $arancel->id];
        if ($descuento === null) {
            DB::table('descuentos_alumnos')->where($clave)->delete();

            return;
        }
        $estandar = (float) $arancel->monto_estandar;
        if (isset($descuento['monto_fijo_ajustado'])) {
            $monto = round((float) $descuento['monto_fijo_ajustado'], 2);
            if ($monto > $estandar) {
                throw ValidationException::withMessages(['aranceles' => "El monto con descuento de {$arancel->nombre_concepto} supera el monto del arancel."]);
            }
            $porcentaje = $estandar > 0 ? round((1 - $monto / $estandar) * 100, 2) : 0;
        } else {
            $porcentaje = round((float) ($descuento['porcentaje_descuento'] ?? 0), 2);
            $monto = round($estandar * (1 - $porcentaje / 100), 2);
        }
        $valores = [
            'porcentaje_descuento' => $porcentaje,
            'monto_fijo_ajustado' => $monto,
            'motivo' => trim($descuento['motivo']),
            'updated_at' => now(),
        ];
        if (DB::table('descuentos_alumnos')->where($clave)->exists()) {
            DB::table('descuentos_alumnos')->where($clave)->update($valores);
        } else {
            DB::table('descuentos_alumnos')->insert($clave + $valores + ['created_at' => now()]);
        }
    }
}
