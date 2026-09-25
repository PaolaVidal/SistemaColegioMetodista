<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_asignacion_curso')->constrained('asignaciones_cursos')->restrictOnDelete();
            $table->string('nombre', 60);
            $table->decimal('ponderacion', 5, 2);
            $table->smallInteger('periodo');
            $table->index('id_asignacion_curso');
        });

        Schema::create('calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_evaluacion')->constrained('evaluaciones')->restrictOnDelete();
            $table->foreignId('id_matricula')->constrained('matriculas')->restrictOnDelete();
            $table->decimal('nota', 4, 2);
            $table->unique(['id_evaluacion', 'id_matricula']);
            $table->index('id_evaluacion');
            $table->index('id_matricula');
        });

        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_matricula')->constrained('matriculas')->restrictOnDelete();
            $table->foreignId('id_asignacion_curso')->constrained('asignaciones_cursos')->restrictOnDelete();
            $table->date('fecha');
            $table->enum('estado', ['Presente', 'Ausente', 'Tardanza', 'Justificado']);
            $table->unique(['id_matricula', 'id_asignacion_curso', 'fecha']);
            $table->index('id_matricula');
            $table->index('id_asignacion_curso');
            $table->index('fecha');
        });

        Schema::create('tareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_asignacion_curso')->constrained('asignaciones_cursos')->cascadeOnDelete();
            $table->string('titulo', 150);
            $table->text('descripcion')->nullable();
            $table->timestamp('fecha_entrega');
            $table->timestamp('fecha_publicacion')->useCurrent();
            $table->enum('estado', ['borrador', 'publicada', 'finalizada'])->default('borrador');
            $table->index('id_asignacion_curso');
        });

        Schema::create('aranceles_base', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_ciclo')->constrained('ciclos')->restrictOnDelete();
            $table->string('nombre_concepto', 30);
            $table->decimal('monto_estandar', 10, 2);
            $table->unsignedTinyInteger('dia_vencimiento_mes');
            $table->decimal('recargo_mora', 10, 2)->nullable();
            $table->timestamps();
            $table->index('id_ciclo');
        });

        Schema::create('cuentas_por_cobrar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('estudiantes')->restrictOnDelete();
            $table->foreignId('id_arancel')->constrained('aranceles_base')->restrictOnDelete();
            $table->string('concepto', 150);
            $table->decimal('monto_original', 10, 2);
            $table->decimal('monto_mora', 10, 2)->nullable();
            $table->decimal('saldo_pendiente', 10, 2);
            $table->date('fecha_emision');
            $table->date('fecha_vencimiento');
            $table->enum('estado', ['pendiente', 'pagado', 'vencido'])->default('pendiente');
            $table->timestamps();
            $table->index('id_estudiante');
            $table->index('id_arancel');
            $table->index('estado');
        });

        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_cuenta_cobrar')->constrained('cuentas_por_cobrar')->restrictOnDelete();
            $table->foreignId('registrado_por')->constrained('usuarios')->restrictOnDelete();
            $table->string('concepto', 150);
            $table->decimal('monto_pago', 10, 2);
            $table->date('fecha_pago')->useCurrent();
            $table->text('numero_comprobante');
            $table->index('id_cuenta_cobrar');
            $table->index('registrado_por');
        });

        Schema::create('descuentos_alumnos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('estudiantes')->restrictOnDelete();
            $table->foreignId('id_arancel')->constrained('aranceles_base')->restrictOnDelete();
            $table->decimal('porcentaje_descuento', 10, 2);
            $table->decimal('monto_fijo_ajustado', 10, 2);
            $table->text('motivo');
            $table->timestamps();
            $table->index('id_estudiante');
            $table->index('id_arancel');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('descuentos_alumnos');
        Schema::dropIfExists('pagos');
        Schema::dropIfExists('cuentas_por_cobrar');
        Schema::dropIfExists('aranceles_base');
        Schema::dropIfExists('tareas');
        Schema::dropIfExists('asistencias');
        Schema::dropIfExists('calificaciones');
        Schema::dropIfExists('evaluaciones');
    }
};
