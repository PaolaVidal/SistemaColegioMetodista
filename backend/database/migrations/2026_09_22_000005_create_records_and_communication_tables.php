<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demeritos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('estudiantes')->restrictOnDelete();
            $table->foreignId('registrado_por')->constrained('usuarios')->restrictOnDelete();
            $table->text('motivo');
            $table->boolean('estado')->default(true);
            $table->timestamps();
            $table->index('id_estudiante');
            $table->index('registrado_por');
        });

        Schema::create('documentos_estudiantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('estudiantes')->cascadeOnDelete();
            $table->foreignId('subido_por')->constrained('usuarios')->restrictOnDelete();
            $table->string('tipo_documento', 30);
            $table->text('nombre_archivo');
            $table->text('ruta_archivo');
            $table->timestamp('fecha_subida')->useCurrent();
            $table->index('id_estudiante');
            $table->index('subido_por');
        });

        Schema::create('anuncios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('autor_id')->constrained('usuarios')->restrictOnDelete();
            $table->string('titulo', 150);
            $table->text('contenido');
            $table->timestamp('fecha_publicacion')->useCurrent();
            $table->index('autor_id');
        });

        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario_destino')->constrained('usuarios')->restrictOnDelete();
            $table->string('tipo', 30);
            $table->string('canal', 20);
            $table->string('asunto', 150);
            $table->text('contenido')->nullable();
            $table->date('fecha_envio')->nullable();
            $table->enum('estado_envio', ['pendiente', 'enviado', 'fallido'])->default('pendiente');
            $table->timestamp('created_at')->useCurrent();
            $table->index('id_usuario_destino');
            $table->index('estado_envio');
        });

        Schema::create('auditoria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuarios')->restrictOnDelete();
            $table->unsignedBigInteger('id_registro');
            $table->enum('accion', ['Crear', 'Actualizar', 'Eliminar']);
            $table->string('nombre_tabla', 30);
            $table->jsonb('valor_anterior')->nullable();
            $table->jsonb('valor_nuevo')->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->index('id_usuario');
            $table->index('nombre_tabla');
            $table->index(['nombre_tabla', 'id_registro']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditoria');
        Schema::dropIfExists('notificaciones');
        Schema::dropIfExists('anuncios');
        Schema::dropIfExists('documentos_estudiantes');
        Schema::dropIfExists('demeritos');
    }
};
