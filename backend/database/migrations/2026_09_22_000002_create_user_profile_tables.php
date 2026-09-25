<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_rol')->constrained('roles')->restrictOnDelete();
            $table->string('nombre_usuario', 50);
            $table->string('correo', 50)->unique();
            $table->string('contrasena', 255);
            $table->string('token_recuperacion', 255)->nullable();
            $table->timestamp('ultimo_login')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->index('id_rol');
        });

        Schema::create('docente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('dui', 10)->unique();
            $table->text('nombres');
            $table->text('apellidos');
            $table->string('telefono', 8);
            $table->string('numero_isss', 15)->nullable()->unique();
            $table->string('afp', 15)->nullable()->unique();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->index('id_usuario');
        });

        Schema::create('estudiantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('codigo_nie', 10)->unique();
            $table->string('nombres', 30);
            $table->string('apellidos', 30);
            $table->string('correo', 50)->nullable()->unique();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->index('id_usuario');
        });

        Schema::create('responsables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('nombres', 30);
            $table->string('apellidos', 30);
            $table->string('dui', 10);
            $table->string('telefono', 30)->nullable();
            $table->string('correo', 50)->nullable()->unique();
            $table->string('parentesco', 20)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->index('id_usuario');
        });

        Schema::create('estudiante_responsable', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('estudiantes')->cascadeOnDelete();
            $table->foreignId('id_responsable')->constrained('responsables')->cascadeOnDelete();
            $table->boolean('es_contacto_principal')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['id_estudiante', 'id_responsable']);
            $table->index('id_estudiante');
            $table->index('id_responsable');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estudiante_responsable');
        Schema::dropIfExists('responsables');
        Schema::dropIfExists('estudiantes');
        Schema::dropIfExists('docente');
        Schema::dropIfExists('usuarios');
    }
};
