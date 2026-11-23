<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// El correo del estudiante y el de su cuenta de usuario son el mismo dato: se mantienen iguales en ambos sentidos.
return new class extends Migration
{
    public function up(): void
    {
        // Alinea los datos existentes: el correo de la cuenta es el que ya se usa para iniciar sesión.
        DB::statement('
            UPDATE estudiantes e SET correo = u.correo, updated_at = now()
            FROM usuarios u
            WHERE u.id = e.id_usuario
              AND e.correo IS DISTINCT FROM u.correo
              AND NOT EXISTS (SELECT 1 FROM estudiantes o WHERE o.correo = u.correo AND o.id <> e.id)
        ');

        DB::unprepared('
            -- Antes de guardar: sin correo propio, el estudiante con cuenta toma el correo de su cuenta.
            CREATE OR REPLACE FUNCTION completar_correo_estudiante() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                IF NEW.id_usuario IS NOT NULL AND NEW.correo IS NULL THEN
                    NEW.correo := (SELECT correo FROM usuarios WHERE id = NEW.id_usuario);
                END IF;
                RETURN NEW;
            END;
            $$;

            CREATE TRIGGER estudiantes_completar_correo
            BEFORE INSERT OR UPDATE OF correo, id_usuario ON estudiantes
            FOR EACH ROW EXECUTE FUNCTION completar_correo_estudiante();

            -- Después de guardar: la cuenta adopta el correo del estudiante.
            CREATE OR REPLACE FUNCTION sincronizar_correo_desde_estudiante() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                IF NEW.id_usuario IS NOT NULL AND NEW.correo IS NOT NULL THEN
                    UPDATE usuarios SET correo = NEW.correo, updated_at = now()
                    WHERE id = NEW.id_usuario AND correo IS DISTINCT FROM NEW.correo;
                END IF;
                RETURN NEW;
            END;
            $$;

            CREATE TRIGGER estudiantes_sincronizar_correo
            AFTER INSERT OR UPDATE OF correo, id_usuario ON estudiantes
            FOR EACH ROW EXECUTE FUNCTION sincronizar_correo_desde_estudiante();

            -- Y al revés: cambiar el correo de la cuenta cambia el del estudiante.
            CREATE OR REPLACE FUNCTION sincronizar_correo_desde_usuario() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                UPDATE estudiantes SET correo = NEW.correo, updated_at = now()
                WHERE id_usuario = NEW.id AND correo IS DISTINCT FROM NEW.correo;
                RETURN NEW;
            END;
            $$;

            CREATE TRIGGER usuarios_sincronizar_correo_estudiante
            AFTER UPDATE OF correo ON usuarios
            FOR EACH ROW EXECUTE FUNCTION sincronizar_correo_desde_usuario();
        ');
    }

    public function down(): void
    {
        DB::unprepared('
            DROP TRIGGER IF EXISTS estudiantes_completar_correo ON estudiantes;
            DROP FUNCTION IF EXISTS completar_correo_estudiante();
            DROP TRIGGER IF EXISTS estudiantes_sincronizar_correo ON estudiantes;
            DROP FUNCTION IF EXISTS sincronizar_correo_desde_estudiante();
            DROP TRIGGER IF EXISTS usuarios_sincronizar_correo_estudiante ON usuarios;
            DROP FUNCTION IF EXISTS sincronizar_correo_desde_usuario();
        ');
    }
};
