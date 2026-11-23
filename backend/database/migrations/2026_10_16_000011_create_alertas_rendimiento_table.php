<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertas_rendimiento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_matricula')->constrained('matriculas')->cascadeOnDelete();
            $table->foreignId('id_asignacion_curso')->constrained('asignaciones_cursos')->cascadeOnDelete();
            $table->smallInteger('periodo');
            $table->decimal('ultimo_promedio', 4, 2)->nullable();
            $table->boolean('en_riesgo')->default(false);
            $table->timestamps();
            $table->unique(['id_matricula', 'id_asignacion_curso', 'periodo'], 'alertas_rendimiento_unico');
        });

        // Establece el estado inicial sin enviar avisos por calificaciones anteriores.
        DB::statement(<<<'SQL'
            INSERT INTO alertas_rendimiento
                (id_matricula, id_asignacion_curso, periodo, ultimo_promedio, en_riesgo, created_at, updated_at)
            SELECT c.id_matricula, e.id_asignacion_curso, e.periodo,
                ROUND(SUM(c.nota * e.ponderacion) / SUM(e.ponderacion), 2) AS promedio,
                ROUND(SUM(c.nota * e.ponderacion) / SUM(e.ponderacion), 2) < 5,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM calificaciones c
            JOIN evaluaciones e ON e.id = c.id_evaluacion
            JOIN asignaciones_cursos a ON a.id = e.id_asignacion_curso
            JOIN matriculas m ON m.id = c.id_matricula
                AND m.id_ciclo = a.id_ciclo AND m.id_seccion = a.id_seccion
            GROUP BY c.id_matricula, e.id_asignacion_curso, e.periodo
            SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('alertas_rendimiento');
    }
};
