<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiResourcesTest extends TestCase
{
    use DatabaseTransactions;

    public function test_each_domain_resource_can_be_listed(): void
    {
        $usuario = $this->crearUsuario();
        Sanctum::actingAs($usuario);

        foreach ($this->recursos() as $recurso) {
            $this->getJson("/api/{$recurso}")->assertOk();
        }
    }

    public function test_token_login_and_grado_crud(): void
    {
        $this->crearUsuario();

        $token = $this->postJson('/api/auth/login', [
            'correo' => 'api-prueba@colegiometodista.test',
            'contrasena' => 'contrasena-prueba',
        ])->assertOk()->json('token');

        $respuesta = $this->withToken($token)->postJson('/api/grados', ['nombre' => 'Prueba API']);
        $respuesta->assertCreated()->assertJsonPath('nombre', 'Prueba API');
        $id = $respuesta->json('id');

        $this->getJson("/api/grados/{$id}")->assertOk();
        $this->patchJson("/api/grados/{$id}", ['nombre' => 'Prueba nueva'])
            ->assertOk()->assertJsonPath('nombre', 'Prueba nueva');
        $this->deleteJson("/api/grados/{$id}")->assertNoContent();
        $this->getJson("/api/grados/{$id}")->assertNotFound();
    }

    public function test_usuario_crud_hashes_and_hides_password(): void
    {
        $usuario = $this->crearUsuario();
        Sanctum::actingAs($usuario);

        $respuesta = $this->postJson('/api/usuarios', [
            'id_rol' => $usuario->id_rol,
            'nombre_usuario' => 'segundo-api',
            'correo' => 'segundo-api@colegiometodista.test',
            'contrasena' => 'clave-segura-prueba',
            'activo' => true,
        ]);
        $respuesta->assertCreated()->assertJsonMissingPath('contrasena');
        $id = $respuesta->json('id');
        $this->assertTrue(Hash::check('clave-segura-prueba', DB::table('usuarios')->find($id)->contrasena));
        $this->getJson("/api/usuarios/{$id}")->assertOk()->assertJsonMissingPath('contrasena');
    }

    private function crearUsuario(): Usuario
    {
        $rol = DB::table('roles')->where('nombre', 'Administrador')->value('id')
            ?? DB::table('roles')->insertGetId(['nombre' => 'Administrador']);

        return Usuario::create([
            'id_rol' => $rol,
            'nombre_usuario' => 'api-prueba',
            'correo' => 'api-prueba@colegiometodista.test',
            'contrasena' => Hash::make('contrasena-prueba'),
            'activo' => true,
        ]);
    }

    private function recursos(): array
    {
        return [
            'roles', 'grados', 'ciclos', 'asignaturas', 'usuarios', 'docentes',
            'estudiantes', 'responsables', 'relaciones-estudiante-responsable',
            'fichas-estudiantes', 'demeritos', 'documentos-estudiantes',
            'documentos-docentes', 'auditoria', 'secciones', 'matriculas',
            'asignaciones-cursos', 'horarios', 'evaluaciones', 'calificaciones',
            'asistencias', 'tareas', 'aranceles-base', 'cuentas-por-cobrar',
            'pagos', 'descuentos-alumnos', 'anuncios', 'notificaciones',
        ];
    }
}
