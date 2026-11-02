<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('roles')->insertOrIgnore(['nombre' => 'Secretaría']);
    }

    public function down(): void
    {
        // Se conserva el rol para no invalidar usuarios existentes.
    }
};
