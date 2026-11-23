<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// DUI con formato 00000000-0, teléfonos con formato 0000-0000 y nombre de usuario único (se usa para iniciar sesión).
return new class extends Migration
{
    private const TELEFONOS_CORTOS = [['docente', 'telefono'], ['ficha_estudiante', 'telefono_madre'], ['ficha_estudiante', 'telefono_padre']];

    private const TELEFONOS = [['docente', 'telefono'], ['responsables', 'telefono'], ['ficha_estudiante', 'telefono_madre'], ['ficha_estudiante', 'telefono_padre']];

    private const DUIS = [['docente', 'dui'], ['responsables', 'dui'], ['ficha_estudiante', 'dui_madre'], ['ficha_estudiante', 'dui_padre']];

    public function up(): void
    {
        foreach (self::TELEFONOS_CORTOS as [$tabla, $columna]) {
            DB::statement("ALTER TABLE {$tabla} ALTER COLUMN {$columna} TYPE varchar(9)");
        }
        foreach (self::TELEFONOS as [$tabla, $columna]) {
            DB::statement("UPDATE {$tabla} SET {$columna} = substr({$columna}, 1, 4) || '-' || substr({$columna}, 5) WHERE {$columna} ~ '^[0-9]{8}$'");
        }
        foreach (self::DUIS as [$tabla, $columna]) {
            DB::statement("UPDATE {$tabla} SET {$columna} = substr({$columna}, 1, 8) || '-' || substr({$columna}, 9) WHERE {$columna} ~ '^[0-9]{9}$'");
        }

        DB::statement('CREATE UNIQUE INDEX usuarios_nombre_usuario_unico ON usuarios (lower(nombre_usuario))');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS usuarios_nombre_usuario_unico');
        foreach (self::TELEFONOS as [$tabla, $columna]) {
            DB::statement("UPDATE {$tabla} SET {$columna} = replace({$columna}, '-', '') WHERE {$columna} ~ '^[0-9]{4}-[0-9]{4}$'");
        }
        foreach (self::TELEFONOS_CORTOS as [$tabla, $columna]) {
            DB::statement("ALTER TABLE {$tabla} ALTER COLUMN {$columna} TYPE varchar(8)");
        }
    }
};
