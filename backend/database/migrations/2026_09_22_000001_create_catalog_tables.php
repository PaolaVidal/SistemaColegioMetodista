<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 25)->unique();
        });

        Schema::create('grados', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 15)->unique();
        });

        Schema::create('ciclos', function (Blueprint $table) {
            $table->id();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('activo')->default(true);
        });

        Schema::create('asignaturas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 20);
            $table->text('descripcion')->nullable();
            $table->string('codigo', 20)->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaturas');
        Schema::dropIfExists('ciclos');
        Schema::dropIfExists('grados');
        Schema::dropIfExists('roles');
    }
};
