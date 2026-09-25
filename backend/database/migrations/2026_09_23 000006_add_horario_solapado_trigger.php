<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Esta migración debe correr DESPUÉS de la que crea las tablas
     * asignaciones_cursos y horarios.
     *
     * Regla que se fuerza a nivel de base de datos: dentro de un mismo
     * ciclo, un mismo docente (id_docente, obtenido vía
     * horarios -> asignaciones_cursos) no puede tener dos horarios el
     * mismo día cuyo rango de horas se traslape. Se compara también
     * id_ciclo a propósito: que un docente tenga, por ejemplo, "Lunes
     * 07:30-08:20" tanto en el ciclo 2025 como en el 2026 NO es un
     * conflicto real (son años lectivos distintos), así que el trigger
     * solo compara horarios dentro del mismo ciclo.
     *
     * Se implementa con un trigger porque id_docente e id_ciclo no
     * viven en la tabla horarios, por lo que un CHECK o UNIQUE simple
     * no alcanza para expresar esta regla.
     */
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE OR REPLACE FUNCTION fn_check_horario_solapado()
            RETURNS TRIGGER AS $BODY$
            DECLARE
                v_docente_id BIGINT;
                v_ciclo_id BIGINT;
                v_conflictos INT;
            BEGIN
                SELECT id_docente, id_ciclo INTO v_docente_id, v_ciclo_id
                FROM asignaciones_cursos
                WHERE id = NEW.id_asignacion_curso;

                SELECT COUNT(*) INTO v_conflictos
                FROM horarios h
                JOIN asignaciones_cursos ac ON ac.id = h.id_asignacion_curso
                WHERE ac.id_docente = v_docente_id
                  AND ac.id_ciclo = v_ciclo_id
                  AND h.dia_semana = NEW.dia_semana
                  AND h.id IS DISTINCT FROM NEW.id
                  AND h.hora_inicio < NEW.hora_fin
                  AND NEW.hora_inicio < h.hora_fin;

                IF v_conflictos > 0 THEN
                    RAISE EXCEPTION
                        'El docente % ya tiene una clase que se traslapa en el ciclo % el % de % a %',
                        v_docente_id, v_ciclo_id, NEW.dia_semana, NEW.hora_inicio, NEW.hora_fin;
                END IF;

                RETURN NEW;
            END;
            $BODY$ LANGUAGE plpgsql;
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER trg_check_horario_solapado
            BEFORE INSERT OR UPDATE ON horarios
            FOR EACH ROW EXECUTE FUNCTION fn_check_horario_solapado();
        SQL);
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS trg_check_horario_solapado ON horarios;');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_check_horario_solapado();');
    }
};