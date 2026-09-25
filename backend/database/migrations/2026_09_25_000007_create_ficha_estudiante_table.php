<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ficha_estudiante', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')
                ->unique()
                ->constrained('estudiantes')
                ->cascadeOnDelete();

            $table->date('fecha_nacimiento');
            $table->char('sexo', 1);
            $table->string('nacionalidad', 30)->nullable();
            $table->string('tipo_sangre', 10)->nullable();

            $table->boolean('repite_grado')->nullable();
            $table->smallInteger('anio_grado_anterior')->nullable();

            $table->boolean('padece_enfermedad')->nullable();
            $table->text('tipo_enfermedad')->nullable();
            $table->boolean('toma_medicamento')->nullable();
            $table->text('nombre_medicamento')->nullable();
            $table->boolean('posee_discapacidad')->nullable();
            $table->text('tipo_discapacidad')->nullable();
            $table->boolean('alergico_medicamento')->nullable();
            $table->text('nombre_medicamento_alergico')->nullable();
            $table->boolean('vacunado_covid')->nullable();
            $table->text('alimento_alergico')->nullable();

            $table->string('residencia_estudiante', 50)->nullable();
            $table->string('municipio', 50)->nullable();
            $table->string('departamento', 50)->nullable();
            $table->string('canton', 50)->nullable();
            $table->string('caserio', 50)->nullable();
            $table->text('zona')->nullable();

            $table->char('sexo_responsable', 1)->nullable();
            $table->date('fecha_nacimiento_responsable')->nullable();
            $table->boolean('vive_con_estudiante')->nullable();
            $table->string('estado_familiar', 25)->nullable();

            $table->boolean('certificado')->nullable();
            $table->boolean('boleta_calificaciones')->nullable();
            $table->boolean('fotocopia_dui')->nullable();
            $table->text('numero_partida_nacimiento')->nullable();
            $table->text('folio_partida_nacimiento')->nullable();
            $table->text('tomo_partida_nacimiento')->nullable();
            $table->text('libro_partida_nacimiento')->nullable();
            $table->boolean('carta_pastoral')->nullable();
            $table->text('nombre_iglesia_asiste')->nullable();

            $table->string('nombre_madre', 60)->nullable();
            $table->string('dui_madre', 10)->nullable();
            $table->text('profesion_madre')->nullable();
            $table->string('telefono_madre', 8)->nullable();
            $table->text('direccion_madre')->nullable();
            $table->date('fecha_nacimiento_madre')->nullable();
            $table->text('lugar_trabajo_madre')->nullable();

            $table->string('nombre_padre', 60)->nullable();
            $table->string('dui_padre', 10)->nullable();
            $table->text('profesion_padre')->nullable();
            $table->string('telefono_padre', 8)->nullable();
            $table->text('direccion_padre')->nullable();
            $table->date('fecha_nacimiento_padre')->nullable();
            $table->text('lugar_trabajo_padre')->nullable();

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });

        DB::statement("
            ALTER TABLE ficha_estudiante
            ADD CONSTRAINT chk_ficha_sexo CHECK (sexo IN ('M', 'F')),
            ADD CONSTRAINT chk_ficha_sexo_responsable
                CHECK (sexo_responsable IS NULL OR sexo_responsable IN ('M', 'F'))
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('ficha_estudiante');
    }
};
