<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// El monto con descuento debe calcularse sobre el monto de su propio arancel.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            UPDATE descuentos_alumnos d
            SET monto_fijo_ajustado = round(a.monto_estandar * (1 - d.porcentaje_descuento / 100), 2), updated_at = now()
            FROM aranceles_base a
            WHERE a.id = d.id_arancel
              AND d.monto_fijo_ajustado > a.monto_estandar
        ');
    }

    public function down(): void {}
};
