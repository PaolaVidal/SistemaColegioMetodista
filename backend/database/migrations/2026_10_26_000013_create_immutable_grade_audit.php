<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE auditoria ALTER COLUMN id_usuario DROP NOT NULL');
        Schema::table('auditoria', function (Blueprint $table) {
            $table->string('origen', 20)->default('legado');
            $table->string('usuario_bd')->nullable();
        });

        DB::unprepared(<<<'SQL'
            CREATE FUNCTION registrar_auditoria_calificaciones() RETURNS trigger LANGUAGE plpgsql AS $$
            DECLARE
                actor bigint := NULLIF(current_setting('app.usuario_id', true), '')::bigint;
                fuente text := COALESCE(NULLIF(current_setting('app.origen', true), ''), 'sql');
                anterior jsonb;
                nuevo jsonb;
                registro bigint;
                operacion text;
            BEGIN
                IF TG_OP = 'UPDATE' AND NEW IS NOT DISTINCT FROM OLD THEN
                    RETURN NEW;
                END IF;

                IF TG_OP <> 'INSERT' THEN anterior := to_jsonb(OLD); END IF;
                IF TG_OP <> 'DELETE' THEN nuevo := to_jsonb(NEW); END IF;
                registro := COALESCE(NEW.id, OLD.id);
                operacion := CASE TG_OP WHEN 'INSERT' THEN 'Crear' WHEN 'UPDATE' THEN 'Actualizar' ELSE 'Eliminar' END;

                INSERT INTO public.auditoria
                    (id_usuario, id_registro, accion, nombre_tabla, valor_anterior, valor_nuevo, fecha_creacion, origen, usuario_bd)
                VALUES
                    (actor, registro, operacion, 'calificaciones', anterior, nuevo, clock_timestamp(), fuente, session_user);

                RETURN COALESCE(NEW, OLD);
            END;
            $$;

            CREATE TRIGGER calificaciones_registrar_auditoria
            AFTER INSERT OR UPDATE OR DELETE ON calificaciones
            FOR EACH ROW EXECUTE FUNCTION registrar_auditoria_calificaciones();

            CREATE FUNCTION impedir_cambios_bitacora() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                RAISE EXCEPTION 'La bitácora es inmutable: no se permite actualizar, eliminar ni truncar registros.' USING ERRCODE = '42501';
            END;
            $$;
            CREATE TRIGGER auditoria_inmutable
            BEFORE UPDATE OR DELETE OR TRUNCATE ON auditoria
            FOR EACH STATEMENT EXECUTE FUNCTION impedir_cambios_bitacora();

            CREATE FUNCTION validar_escritura_bitacora() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                IF pg_trigger_depth() < 2 THEN
                    RAISE EXCEPTION 'La bitácora solo admite registros automáticos del sistema.' USING ERRCODE = '42501';
                END IF;
                RETURN NEW;
            END;
            $$;
            CREATE TRIGGER auditoria_escritura_automatica
            BEFORE INSERT ON auditoria
            FOR EACH ROW EXECUTE FUNCTION validar_escritura_bitacora();

            CREATE FUNCTION impedir_truncado_calificaciones() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                RAISE EXCEPTION 'Use DELETE para conservar la auditoría de cada calificación.' USING ERRCODE = '42501';
            END;
            $$;
            CREATE TRIGGER calificaciones_no_truncar
            BEFORE TRUNCATE ON calificaciones
            FOR EACH STATEMENT EXECUTE FUNCTION impedir_truncado_calificaciones();
            SQL);
    }

    public function down(): void
    {
        // No borrar entradas para forzar la antigua restricción NOT NULL.
        if (DB::table('auditoria')->whereNull('id_usuario')->exists()) {
            throw new RuntimeException('La auditoría contiene operaciones SQL sin usuario de aplicación; conserve el historial antes de revertir esta migración.');
        }
        DB::unprepared(<<<'SQL'
            DROP TRIGGER IF EXISTS calificaciones_no_truncar ON calificaciones;
            DROP TRIGGER IF EXISTS calificaciones_registrar_auditoria ON calificaciones;
            DROP TRIGGER IF EXISTS auditoria_inmutable ON auditoria;
            DROP TRIGGER IF EXISTS auditoria_escritura_automatica ON auditoria;
            DROP FUNCTION IF EXISTS impedir_truncado_calificaciones();
            DROP FUNCTION IF EXISTS registrar_auditoria_calificaciones();
            DROP FUNCTION IF EXISTS impedir_cambios_bitacora();
            DROP FUNCTION IF EXISTS validar_escritura_bitacora();
            ALTER TABLE auditoria ALTER COLUMN id_usuario SET NOT NULL;
            SQL);
        Schema::table('auditoria', fn (Blueprint $table) => $table->dropColumn(['origen', 'usuario_bd']));
    }
};
