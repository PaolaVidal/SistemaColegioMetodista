<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FormatosYLoginTest extends TestCase
{
    use DatabaseTransactions;

    public function test_login_acepta_correo_o_nombre_de_usuario(): void
    {
        $this->crearAdministrador();

        $this->postJson('/api/auth/login', ['correo' => 'Admin-Formatos@colegiometodista.test', 'contrasena' => 'password123'])->assertOk();
        $this->postJson('/api/auth/login', ['identificador' => 'ADMIN-FORMATOS', 'contrasena' => 'password123'])->assertOk();
        $this->postJson('/api/auth/login', ['identificador' => 'admin-formatos', 'contrasena' => 'incorrecta'])->assertUnauthorized();
    }

    public function test_dui_y_telefono_exigen_guion_y_el_usuario_no_se_repite(): void
    {
        Sanctum::actingAs($this->crearAdministrador());

        $docente = ['nombres' => 'Ana', 'apellidos' => 'Prueba', 'dui' => '012345678', 'telefono' => '71234567', 'activo' => true];
        $this->postJson('/api/docentes', $docente)->assertUnprocessable()->assertJsonValidationErrors(['dui', 'telefono']);
        $this->postJson('/api/docentes', ['dui' => '01234567-8', 'telefono' => '7123-4567'] + $docente)->assertCreated();

        $this->postJson('/api/usuarios', [
            'id_rol' => DB::table('roles')->value('id'), 'nombre_usuario' => 'Admin-Formatos',
            'correo' => 'otro-formatos@colegiometodista.test', 'contrasena' => 'password123',
        ])->assertUnprocessable()->assertJsonValidationErrors('nombre_usuario');
    }

    private function crearAdministrador(): Usuario
    {
        $rol = DB::table('roles')->where('nombre', 'Administrador')->value('id')
            ?? DB::table('roles')->insertGetId(['nombre' => 'Administrador']);

        return Usuario::create([
            'id_rol' => $rol,
            'nombre_usuario' => 'admin-formatos',
            'correo' => 'admin-formatos@colegiometodista.test',
            'contrasena' => Hash::make('password123'),
            'activo' => true,
        ]);
    }
}
