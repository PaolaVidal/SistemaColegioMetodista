<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Support\CuentasUsuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ResponsablesCuentasTest extends TestCase
{
    use DatabaseTransactions;

    public function test_nombre_de_usuario_usa_anio_inicial_y_primer_apellido_con_correlativo(): void
    {
        $this->actuarComoAdministrador();
        $anio = now()->year;

        $this->assertSame("{$anio}wrivas", CuentasUsuario::sugerirNombre('Wilber Anibal', 'Rivas Carranza'));
        $this->assertSame("{$anio}jdelacruz", CuentasUsuario::sugerirNombre('José', 'De la Cruz Peña'));
        $this->assertSame("{$anio}mnunez", CuentasUsuario::sugerirNombre('María', 'Núñez'));

        $this->crearCuenta("{$anio}wrivas");
        $this->assertSame("{$anio}wrivas1", CuentasUsuario::sugerirNombre('Wilber', 'Rivas'));
        $this->crearCuenta("{$anio}wrivas1");
        $this->assertSame("{$anio}wrivas2", CuentasUsuario::sugerirNombre('Walter', 'Rivas'));

        $this->getJson('/api/cuentas/sugerir-nombre?nombres=Wilber&apellidos=Rivas')
            ->assertOk()->assertJsonPath('nombre_usuario', "{$anio}wrivas2");
    }

    public function test_responsable_se_crea_con_varios_estudiantes_y_cuenta(): void
    {
        $this->actuarComoAdministrador();
        DB::table('roles')->where('nombre', 'Encargado')->exists() || DB::table('roles')->insert(['nombre' => 'Encargado']);
        $hijos = [$this->crearEstudiante('PRB0000001'), $this->crearEstudiante('PRB0000002')];

        $respuesta = $this->postJson('/api/familias', [
            'nombres' => 'Rosa Elena',
            'apellidos' => 'Martínez López',
            'dui' => '01234567-8',
            'parentesco' => 'Madre',
            'activo' => true,
            'estudiantes' => [
                ['id' => $hijos[0], 'es_contacto_principal' => true],
                ['id' => $hijos[1], 'es_contacto_principal' => false],
            ],
            'usuario' => ['correo' => 'rosa.prueba@colegiometodista.test', 'contrasena' => 'password123'],
        ])->assertCreated();

        $this->assertCount(2, $respuesta->json('estudiantes'));
        $this->assertSame(now()->year.'rmartinez', $respuesta->json('usuario.nombre_usuario'));
        $id = $respuesta->json('responsable.id');

        // Al editar se pueden quitar estudiantes; el DUI se valida.
        $this->putJson("/api/familias/{$id}", [
            'nombres' => 'Rosa Elena', 'apellidos' => 'Martínez López', 'dui' => '01234567-8', 'activo' => true,
            'estudiantes' => [['id' => $hijos[1], 'es_contacto_principal' => true]],
        ])->assertOk()->assertJsonCount(1, 'estudiantes');
        $this->putJson("/api/familias/{$id}", [
            'nombres' => 'Rosa', 'apellidos' => 'Martínez', 'dui' => '123', 'activo' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors('dui');
    }

    private function actuarComoAdministrador(): void
    {
        $rol = DB::table('roles')->where('nombre', 'Administrador')->value('id')
            ?? DB::table('roles')->insertGetId(['nombre' => 'Administrador']);
        Sanctum::actingAs(Usuario::create([
            'id_rol' => $rol,
            'nombre_usuario' => 'admin-prueba-cuentas',
            'correo' => 'admin-prueba-cuentas@colegiometodista.test',
            'contrasena' => Hash::make('password123'),
            'activo' => true,
        ]));
    }

    private function crearCuenta(string $nombre): void
    {
        DB::table('usuarios')->insert([
            'id_rol' => DB::table('roles')->value('id'),
            'nombre_usuario' => $nombre,
            'correo' => "{$nombre}@colegiometodista.test",
            'contrasena' => Hash::make('password123'),
            'activo' => true,
        ]);
    }

    private function crearEstudiante(string $nie): int
    {
        return DB::table('estudiantes')->insertGetId([
            'codigo_nie' => $nie, 'nombres' => 'Hijo', 'apellidos' => 'Prueba', 'activo' => true,
        ]);
    }
}
