<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CorreoEstudianteUsuarioTest extends TestCase
{
    use DatabaseTransactions;

    public function test_correo_vacio_queda_nulo_y_la_cuenta_exige_y_comparte_el_correo(): void
    {
        $this->actuarComoAdministrador();
        DB::table('roles')->where('nombre', 'Estudiante')->exists() || DB::table('roles')->insert(['nombre' => 'Estudiante']);

        $sinCorreo = $this->postJson('/api/expedientes', $this->expediente('PRBC000001', null))->assertCreated();
        $this->assertNull($sinCorreo->json('estudiante.correo'));

        $this->postJson('/api/expedientes', $this->expediente('PRBC000002', null) + ['usuario' => ['contrasena' => 'Abc12345']])
            ->assertUnprocessable()->assertJsonValidationErrors('correo');

        $conCuenta = $this->postJson('/api/expedientes', $this->expediente('PRBC000003', 'hijo.prueba@colegiometodista.test')
            + ['usuario' => ['contrasena' => 'Abc12345']])->assertCreated();
        $this->assertSame('hijo.prueba@colegiometodista.test', $conCuenta->json('usuario.correo'));
        $id = $conCuenta->json('estudiante.id');
        $idUsuario = $conCuenta->json('usuario.id');

        // Cambiar el correo del estudiante cambia el de su cuenta…
        $this->putJson("/api/expedientes/{$id}", $this->expediente('PRBC000003', 'nuevo.prueba@colegiometodista.test'))->assertOk();
        $this->assertSame('nuevo.prueba@colegiometodista.test', DB::table('usuarios')->where('id', $idUsuario)->value('correo'));

        // …y cambiar el de la cuenta cambia el del estudiante.
        $this->patchJson("/api/usuarios/{$idUsuario}", ['correo' => 'otro.prueba@colegiometodista.test'])->assertOk();
        $this->assertSame('otro.prueba@colegiometodista.test', DB::table('estudiantes')->where('id', $id)->value('correo'));

        // Con cuenta, el correo ya no puede quedar vacío.
        $this->putJson("/api/expedientes/{$id}", $this->expediente('PRBC000003', null))
            ->assertUnprocessable()->assertJsonValidationErrors('correo');
    }

    private function expediente(string $nie, ?string $correo): array
    {
        return ['codigo_nie' => $nie, 'nombres' => 'Hijo', 'apellidos' => 'Prueba', 'correo' => $correo, 'activo' => true];
    }

    private function actuarComoAdministrador(): void
    {
        $rol = DB::table('roles')->where('nombre', 'Administrador')->value('id')
            ?? DB::table('roles')->insertGetId(['nombre' => 'Administrador']);
        Sanctum::actingAs(Usuario::create([
            'id_rol' => $rol,
            'nombre_usuario' => 'admin-prueba-correo',
            'correo' => 'admin-prueba-correo@colegiometodista.test',
            'contrasena' => Hash::make('password123'),
            'activo' => true,
        ]));
    }
}
