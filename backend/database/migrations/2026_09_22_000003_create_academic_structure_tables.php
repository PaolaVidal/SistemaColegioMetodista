<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_grado')->constrained('grados')->restrictOnDelete();
            $table->foreignId('id_ciclo')->constrained('ciclos')->restrictOnDelete();
            $table->char('nombre', 1);
            $table->integer('capacidad')->nullable();
            $table->timestamps();
            $table->unique(['id_grado', 'id_ciclo', 'nombre']);
            $table->index('id_grado');
            $table->index('id_ciclo');
        });

        Schema::create('matriculas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('estudiantes')->restrictOnDelete();
            $table->foreignId('id_ciclo')->constrained('ciclos')->restrictOnDelete();
            $table->foreignId('id_seccion')->constrained('secciones')->restrictOnDelete();
            $table->timestamp('fecha_matricula')->useCurrent();
            $table->boolean('estado')->default(true);
            $table->timestamps();
            $table->unique(['id_estudiante', 'id_ciclo']);
            $table->index('id_estudiante');
            $table->index('id_ciclo');
            $table->index('id_seccion');
        });

        Schema::create('asignaciones_cursos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_ciclo')->constrained('ciclos')->restrictOnDelete();
            $table->foreignId('id_seccion')->constrained('secciones')->restrictOnDelete();
            $table->foreignId('id_asignatura')->constrained('asignaturas')->restrictOnDelete();
            $table->foreignId('id_docente')->constrained('docente')->restrictOnDelete();
            $table->timestamps();
            $table->unique(['id_ciclo', 'id_seccion', 'id_asignatura']);
            $table->index('id_ciclo');
            $table->index('id_seccion');
            $table->index('id_asignatura');
            $table->index('id_docente');
        });

        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_asignacion_curso')->constrained('asignaciones_cursos')->cascadeOnDelete();
            $table->string('dia_semana', 20);
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->index('id_asignacion_curso');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios');
        Schema::dropIfExists('asignaciones_cursos');
        Schema::dropIfExists('matriculas');
        Schema::dropIfExists('secciones');
    }
};
