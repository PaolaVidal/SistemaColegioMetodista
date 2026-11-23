<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

abstract class SeguridadTestCase extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        if (! str_ends_with(DB::connection()->getDatabaseName(), 'SeguridadTest')) {
            throw new \RuntimeException('Estas pruebas requieren una base aislada con sufijo SeguridadTest.');
        }
        Http::preventStrayRequests();
        config(['services.n8n.academic_webhook_url' => null, 'services.n8n.payment_webhook_url' => null]);
    }

    protected function usuario(string $rol = 'Administrador'): Usuario
    {
        $rolId = DB::table('roles')->where('nombre', $rol)->value('id')
            ?? DB::table('roles')->insertGetId(['nombre' => $rol]);
        $nombre = 'seg-'.uniqid();

        return Usuario::create([
            'id_rol' => $rolId, 'nombre_usuario' => $nombre,
            'correo' => $nombre.'@colegio.test', 'activo' => true,
            'contrasena' => Hash::make('password123'),
        ])->fresh();
    }

    protected function conToken(string $method, string $uri, string $token, array $data = [])
    {
        $this->app['auth']->forgetGuards();

        return $this->withToken($token)->json($method, $uri, $data);
    }

    protected function grupo(?Usuario $docente = null, ?Usuario $estudiante = null): array
    {
        $docente ??= $this->usuario('Docente');
        $estudiante ??= $this->usuario('Estudiante');
        $ciclo = DB::table('ciclos')->insertGetId(['fecha_inicio' => '2026-01-01', 'fecha_fin' => '2026-11-30', 'activo' => true]);
        $grado = DB::table('grados')->insertGetId(['nombre' => 'Seg'.$docente->id]);
        $seccion = DB::table('secciones')->insertGetId(['id_grado' => $grado, 'id_ciclo' => $ciclo, 'nombre' => 'A']);
        $alumno = DB::table('estudiantes')->insertGetId(['id_usuario' => $estudiante->id, 'codigo_nie' => (string) $estudiante->id, 'nombres' => 'Alumno', 'apellidos' => 'Prueba']);
        $matricula = DB::table('matriculas')->insertGetId(['id_estudiante' => $alumno, 'id_ciclo' => $ciclo, 'id_seccion' => $seccion]);
        $profesor = DB::table('docente')->insertGetId(['id_usuario' => $docente->id, 'dui' => (string) $docente->id, 'nombres' => 'Docente', 'apellidos' => 'Prueba', 'telefono' => '70000000']);
        $materia = DB::table('asignaturas')->insertGetId(['nombre' => 'Prueba', 'codigo' => 'S'.$docente->id]);
        $asignacion = DB::table('asignaciones_cursos')->insertGetId(['id_ciclo' => $ciclo, 'id_seccion' => $seccion, 'id_docente' => $profesor, 'id_asignatura' => $materia]);
        $evaluacion = DB::table('evaluaciones')->insertGetId(['id_asignacion_curso' => $asignacion, 'nombre' => 'Examen', 'ponderacion' => 100, 'periodo' => 1]);

        return compact('docente', 'estudiante', 'alumno', 'matricula', 'evaluacion', 'asignacion');
    }
}
