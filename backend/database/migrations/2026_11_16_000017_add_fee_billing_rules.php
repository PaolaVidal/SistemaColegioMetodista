<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Reglas de cobro: tipo de arancel (único o mensual), un descuento por estudiante y arancel,
// porcentaje entre 0 y 100 y comprobantes de pago irrepetibles.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE aranceles_base ADD COLUMN tipo_cobro varchar(10) NOT NULL DEFAULT 'unico'");
        DB::statement("ALTER TABLE aranceles_base ADD CONSTRAINT chk_aranceles_tipo_cobro CHECK (tipo_cobro IN ('unico', 'mensual'))");
        DB::statement("UPDATE aranceles_base SET tipo_cobro = 'mensual' WHERE nombre_concepto ILIKE 'mensualidad%'");
        DB::statement('ALTER TABLE aranceles_base ADD CONSTRAINT chk_aranceles_dia CHECK (dia_vencimiento_mes BETWEEN 1 AND 31)');

        // Conserva el descuento más reciente si hubiera repetidos.
        DB::statement('
            DELETE FROM descuentos_alumnos d USING descuentos_alumnos o
            WHERE d.id_estudiante = o.id_estudiante AND d.id_arancel = o.id_arancel AND d.id < o.id
        ');
        DB::statement('CREATE UNIQUE INDEX descuentos_alumnos_estudiante_arancel_unico ON descuentos_alumnos (id_estudiante, id_arancel)');
        DB::statement('ALTER TABLE descuentos_alumnos ADD CONSTRAINT chk_descuento_porcentaje CHECK (porcentaje_descuento BETWEEN 0 AND 100)');
        DB::statement('ALTER TABLE descuentos_alumnos ADD CONSTRAINT chk_descuento_monto CHECK (monto_fijo_ajustado >= 0)');

        DB::statement('CREATE UNIQUE INDEX pagos_numero_comprobante_unico ON pagos (numero_comprobante)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS pagos_numero_comprobante_unico');
        DB::statement('ALTER TABLE descuentos_alumnos DROP CONSTRAINT IF EXISTS chk_descuento_monto');
        DB::statement('ALTER TABLE descuentos_alumnos DROP CONSTRAINT IF EXISTS chk_descuento_porcentaje');
        DB::statement('DROP INDEX IF EXISTS descuentos_alumnos_estudiante_arancel_unico');
        DB::statement('ALTER TABLE aranceles_base DROP CONSTRAINT IF EXISTS chk_aranceles_dia');
        DB::statement('ALTER TABLE aranceles_base DROP CONSTRAINT IF EXISTS chk_aranceles_tipo_cobro');
        DB::statement('ALTER TABLE aranceles_base DROP COLUMN IF EXISTS tipo_cobro');
    }
};
