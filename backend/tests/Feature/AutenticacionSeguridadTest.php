<?php

namespace Tests\Feature;

use App\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AutenticacionSeguridadTest extends SeguridadTestCase
{
    public function test_tokens_expire_are_hashed_and_logout_revokes_them(): void
    {
        $usuario = $this->usuario();
        $login = $this->postJson('/api/auth/login', ['correo' => $usuario->correo, 'contrasena' => 'password123'])
            ->assertOk()->assertJsonPath('token_type', 'Bearer')->assertJsonStructure(['expires_at'])
            ->assertJsonMissingPath('usuario.contrasena');
        $token = $login->json('token');
        $guardado = PersonalAccessToken::findToken($token);
        $this->assertNotEquals($token, $guardado->token);
        $this->assertNotNull($guardado->expires_at);
        $this->conToken('GET', '/api/auth/me', $token)->assertOk();
        $this->conToken('POST', '/api/auth/logout', $token)->assertNoContent();
        $this->conToken('GET', '/api/auth/me', $token)->assertUnauthorized();

        $otro = $usuario->createToken('prueba', ['*'], now()->addMinutes(480))->plainTextToken;
        $this->travel(481)->minutes();
        $this->conToken('GET', '/api/auth/me', $otro)->assertUnauthorized();
        $this->travelBack();
        $this->app['auth']->forgetGuards();
        $this->withToken('invalido')->get('/api/ciclos')->assertUnauthorized()->assertHeader('Content-Type', 'application/json');
    }

    public function test_password_role_and_active_changes_revoke_access_even_through_sql(): void
    {
        $usuario = $this->usuario();
        $rol = $this->usuario('Docente')->id_rol;
        foreach ([['contrasena' => Hash::make('otra-clave')], ['id_rol' => $rol], ['activo' => false]] as $cambio) {
            $token = $usuario->createToken('prueba')->plainTextToken;
            $version = $usuario->fresh()->version_sesion;
            DB::table('usuarios')->where('id', $usuario->id)->update($cambio);
            $this->assertNull(PersonalAccessToken::findToken($token));
            $this->assertSame($version + 1, $usuario->fresh()->version_sesion);
            $this->conToken('GET', '/api/auth/me', $token)->assertUnauthorized();
        }
        $this->postJson('/api/auth/login', ['correo' => $usuario->correo, 'contrasena' => 'otra-clave'])->assertUnauthorized();
    }

    public function test_login_attempts_are_limited(): void
    {
        $usuario = $this->usuario();
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', ['correo' => $usuario->correo, 'contrasena' => 'incorrecta'])->assertUnauthorized();
        }
        $this->postJson('/api/auth/login', ['correo' => $usuario->correo, 'contrasena' => 'password123'])->assertStatus(429);
    }

    public function test_cookie_session_requires_csrf_rotates_id_and_can_be_closed(): void
    {
        $this->app->bind(VerifyCsrfToken::class, CsrfEstricto::class);
        $usuario = $this->usuario();
        $this->withHeader('Origin', 'http://localhost:5173');
        $datos = ['correo' => $usuario->correo, 'contrasena' => 'password123'];
        $this->postJson('/api/auth/sesion', $datos)->assertStatus(419);
        $this->withSession(['_token' => 'csrf-prueba']);
        $anterior = session()->getId();
        $this->withHeader('X-CSRF-TOKEN', 'csrf-prueba')->postJson('/api/auth/sesion', $datos)
            ->assertOk()->assertJsonMissingPath('token');
        $this->assertNotSame($anterior, session()->getId());
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/auth/me')->assertOk();
        $this->withHeader('X-CSRF-TOKEN', session()->token())->postJson('/api/auth/logout')->assertNoContent();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_cookie_session_is_rejected_after_security_version_changes(): void
    {
        $usuario = $this->usuario();
        $this->withSession(['_token' => 'csrf-version']);
        $this->withHeader('X-CSRF-TOKEN', 'csrf-version')->withHeader('Origin', 'http://localhost:5173')->postJson('/api/auth/sesion', [
            'correo' => $usuario->correo, 'contrasena' => 'password123',
        ])->assertOk();
        DB::table('usuarios')->where('id', $usuario->id)->update(['activo' => false]);
        DB::table('usuarios')->where('id', $usuario->id)->update(['activo' => true]);
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }
}

class CsrfEstricto extends VerifyCsrfToken
{
    protected function runningUnitTests()
    {
        return false;
    }
}
