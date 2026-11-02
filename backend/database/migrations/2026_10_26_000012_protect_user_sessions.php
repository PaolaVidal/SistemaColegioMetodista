<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->unsignedInteger('version_sesion')->default(1);
        });
        DB::unprepared(<<<'SQL'
            CREATE FUNCTION proteger_accesos_usuario() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                IF NEW.contrasena IS DISTINCT FROM OLD.contrasena
                   OR NEW.activo IS DISTINCT FROM OLD.activo
                   OR NEW.id_rol IS DISTINCT FROM OLD.id_rol THEN
                    NEW.version_sesion := OLD.version_sesion + 1;
                    DELETE FROM personal_access_tokens
                    WHERE tokenable_type = 'App\Models\Usuario' AND tokenable_id = OLD.id;
                ELSE
                    NEW.version_sesion := OLD.version_sesion;
                END IF;
                RETURN NEW;
            END;
            $$;
            CREATE TRIGGER usuarios_proteger_accesos BEFORE UPDATE ON usuarios
            FOR EACH ROW EXECUTE FUNCTION proteger_accesos_usuario();
            SQL);
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS usuarios_proteger_accesos ON usuarios; DROP FUNCTION IF EXISTS proteger_accesos_usuario();');
        Schema::table('usuarios', fn (Blueprint $table) => $table->dropColumn('version_sesion'));
    }
};
