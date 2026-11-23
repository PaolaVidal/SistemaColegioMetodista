<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Services\CuentasCobroService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ArancelesDescuentosTest extends TestCase
{
    use DatabaseTransactions;

    private int $ciclo;

    private int $seccion;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-03-05 10:00:00', 'America/El_Salvador'));
        $rol = DB::table('roles')->where('nombre', 'Administrador')->value('id') ?? DB::table('roles')->insertGetId(['nombre' => 'Administrador']);
        Sanctum::actingAs(Usuario::create([
            'id_rol' => $rol, 'nombre_usuario' => 'admin-aranceles', 'correo' => 'admin-aranceles@colegiometodista.test',
            'contrasena' => Hash::make('password123'), 'activo' => true,
        ]));
        $this->ciclo = DB::table('ciclos')->insertGetId(['fecha_inicio' => '2026-01-15', 'fecha_fin' => '2026-11-30', 'activo' => false]);
        $grado = DB::table('grados')->insertGetId(['nombre' => 'Grado prueba aranceles']);
        $this->seccion = DB::table('secciones')->insertGetId(['id_grado' => $grado, 'id_ciclo' => $this->ciclo, 'nombre' => 'Z', 'capacidad' => 30]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_matricula_genera_cuotas_con_descuento_y_el_descuento_afecta_las_pendientes(): void
    {
        $mensualidad = $this->arancel('Mensualidad', 100, 'mensual');
        $matricula = $this->arancel('Matrícula', 150, 'unico');
        $estudiante = $this->estudiante('ARA0000001');

        $respuesta = $this->postJson('/api/inscripciones', [
            'id_estudiante' => $estudiante, 'id_ciclo' => $this->ciclo, 'id_seccion' => $this->seccion,
            'aranceles' => [
                ['id' => $mensualidad, 'descuento' => ['porcentaje_descuento' => 25, 'motivo' => 'Beca académica']],
                ['id' => $matricula],
            ],
        ])->assertCreated();

        // Marzo a noviembre: 9 mensualidades con 25 % de descuento + 1 matrícula sin descuento.
        $cuentas = collect($respuesta->json('cuentas'));
        $this->assertCount(10, $cuentas);
        $this->assertSame(9, $cuentas->where('id_arancel', $mensualidad)->count());
        $this->assertEquals(75, $cuentas->firstWhere('id_arancel', $mensualidad)['monto_original']);
        $this->assertEquals(150, $cuentas->firstWhere('id_arancel', $matricula)['monto_original']);
        $this->assertSame('Mensualidad de marzo 2026', $cuentas->firstWhere('id_arancel', $mensualidad)['concepto']);

        // Cambiar el descuento a un monto fijo ajusta las cuotas pendientes.
        $descuento = DB::table('descuentos_alumnos')->where('id_estudiante', $estudiante)->value('id');
        $this->patchJson("/api/descuentos-alumnos/{$descuento}", ['monto_fijo_ajustado' => 50])
            ->assertOk()->assertJsonPath('porcentaje_descuento', '50.00');
        $this->assertEquals(50, DB::table('cuentas_por_cobrar')->where('id_arancel', $mensualidad)->max('saldo_pendiente'));

        // Al eliminarlo vuelven al monto estándar.
        $this->deleteJson("/api/descuentos-alumnos/{$descuento}")->assertNoContent();
        $this->assertEquals(100, DB::table('cuentas_por_cobrar')->where('id_arancel', $mensualidad)->min('saldo_pendiente'));

        // No se puede matricular dos veces en el mismo ciclo.
        $this->postJson('/api/inscripciones', [
            'id_estudiante' => $estudiante, 'id_ciclo' => $this->ciclo, 'id_seccion' => $this->seccion,
        ])->assertUnprocessable()->assertJsonValidationErrors('id_ciclo');
    }

    public function test_comprobante_automatico_correlativo_y_mora(): void
    {
        $arancel = $this->arancel('Materiales', 40, 'unico', 5);
        $estudiante = $this->estudiante('ARA0000002');
        $cuentas = app(CuentasCobroService::class)->generar($estudiante, DB::table('aranceles_base')->find($arancel));

        $primero = $this->postJson('/api/pagos', [
            'id_cuenta_cobrar' => $cuentas[0], 'concepto' => 'Abono', 'monto_pago' => 10, 'numero_comprobante' => 'MANUAL-1',
        ])->assertCreated();
        $segundo = $this->postJson('/api/pagos', ['id_cuenta_cobrar' => $cuentas[0], 'concepto' => 'Abono', 'monto_pago' => 10])->assertCreated();

        $this->assertMatchesRegularExpression('/^REC-20260305-\d{4}$/', $primero->json('numero_comprobante'));
        $this->assertSame(
            (int) substr($primero->json('numero_comprobante'), -4) + 1,
            (int) substr($segundo->json('numero_comprobante'), -4),
        );

        // Al vencer se suma una sola vez el recargo por mora del arancel.
        DB::table('cuentas_por_cobrar')->where('id', $cuentas[0])->update(['fecha_vencimiento' => '2026-03-01']);
        app(CuentasCobroService::class)->aplicarMora($cuentas[0]);
        app(CuentasCobroService::class)->aplicarMora($cuentas[0]);
        $cuenta = DB::table('cuentas_por_cobrar')->find($cuentas[0]);
        $this->assertEquals(5, $cuenta->monto_mora);
        $this->assertEquals(25, $cuenta->saldo_pendiente);
    }

    public function test_aranceles_base_protegidos_y_eliminacion_con_pagos_requiere_confirmacion(): void
    {
        $base = $this->arancel('Mensualidad', 85, 'mensual');
        DB::table('aranceles_base')->where('id', $base)->update(['protegido' => true]);
        $this->deleteJson("/api/aranceles-base/{$base}")->assertUnprocessable();
        $this->patchJson("/api/aranceles-base/{$base}", ['protegido' => false])->assertUnprocessable();

        $extra = $this->arancel('Uniforme', 30, 'unico');
        $estudiante = $this->estudiante('ARA0000003');
        $cuenta = app(CuentasCobroService::class)->generar($estudiante, DB::table('aranceles_base')->find($extra))[0];
        $this->postJson('/api/descuentos-alumnos', [
            'id_estudiante' => $estudiante, 'id_arancel' => $extra, 'porcentaje_descuento' => 10, 'motivo' => 'Beca',
        ])->assertCreated();
        $this->postJson('/api/pagos', ['id_cuenta_cobrar' => $cuenta, 'concepto' => 'Abono', 'monto_pago' => 5])->assertCreated();

        $this->deleteJson("/api/aranceles-base/{$extra}")->assertStatus(409)->assertJsonPath('pagos', 1);
        $this->deleteJson("/api/aranceles-base/{$extra}?confirmar_pagos=1")->assertNoContent();
        $this->assertDatabaseMissing('aranceles_base', ['id' => $extra]);
        $this->assertDatabaseMissing('cuentas_por_cobrar', ['id' => $cuenta]);
    }

    private function arancel(string $concepto, float $monto, string $tipo, float $mora = 10): int
    {
        return DB::table('aranceles_base')->insertGetId([
            'id_ciclo' => $this->ciclo, 'nombre_concepto' => $concepto, 'monto_estandar' => $monto,
            'dia_vencimiento_mes' => 10, 'recargo_mora' => $mora, 'tipo_cobro' => $tipo,
        ]);
    }

    private function estudiante(string $nie): int
    {
        return DB::table('estudiantes')->insertGetId(['codigo_nie' => $nie, 'nombres' => 'Alumno', 'apellidos' => 'Aranceles', 'activo' => true]);
    }
}
