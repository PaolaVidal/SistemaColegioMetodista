<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// El nombre del grado admite hasta 30 caracteres (antes 15).
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE grados ALTER COLUMN nombre TYPE varchar(30)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE grados ALTER COLUMN nombre TYPE varchar(15)');
    }
};
