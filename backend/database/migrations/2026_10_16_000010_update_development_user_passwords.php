<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('usuarios')->orderBy('id')->chunkById(100, function ($usuarios): void {
            foreach ($usuarios as $usuario) {
                DB::table('usuarios')->where('id', $usuario->id)->update([
                    'contrasena' => Hash::make('password123'),
                    'updated_at' => now(),
                ]);
            }
        });
    }

    public function down(): void
    {
        // Las contraseñas anteriores no pueden recuperarse desde sus hashes.
    }
};
