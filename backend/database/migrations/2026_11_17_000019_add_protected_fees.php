<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Matrícula y Mensualidad son aranceles base del sistema: no se pueden eliminar.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE aranceles_base ADD COLUMN protegido boolean NOT NULL DEFAULT false');
        DB::statement("UPDATE aranceles_base SET protegido = true WHERE nombre_concepto ILIKE 'matr_cula' OR nombre_concepto ILIKE 'mensualidad'");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE aranceles_base DROP COLUMN IF EXISTS protegido');
    }
};
