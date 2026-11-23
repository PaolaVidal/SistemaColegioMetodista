<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Policies\Api\ResourcePolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $usuario = $this->validarCredenciales($request);
            $expira = now()->addMinutes(config('sanctum.expiration'));

            return response()->json([
                'usuario' => $this->presentarUsuario($usuario),
                'token' => $usuario->createToken('api', ['*'], $expira)->plainTextToken,
                'token_type' => 'Bearer',
                'expires_at' => $expira->toIso8601String(),
            ]);
        });
    }

    public function sesion(Request $request)
    {
        if (! $request->hasSession() || ! $request->attributes->get('sanctum')) {
            throw ValidationException::withMessages(['sesion' => 'Inicie la sesión desde el frontend autorizado, con cookies y protección CSRF.']);
        }

        return DB::transaction(function () use ($request) {
            $usuario = $this->validarCredenciales($request);
            Auth::guard('web')->login($usuario);
            $request->session()->regenerate();
            $request->session()->put('version_sesion', $usuario->version_sesion);
            $request->session()->put('password_hash_web', $usuario->getAuthPassword());

            return response()->json(['usuario' => $this->presentarUsuario($usuario)]);
        });
    }

    private function validarCredenciales(Request $request): Usuario
    {
        // Se puede iniciar sesión con el correo o con el nombre de usuario (campo "correo" o "identificador").
        $datos = $request->validate([
            'identificador' => ['required_without:correo', 'nullable', 'string', 'max:100'],
            'correo' => ['required_without:identificador', 'nullable', 'string', 'max:100'],
            'contrasena' => ['required', 'string'],
        ], [
            'identificador.required_without' => 'Ingrese su correo o nombre de usuario.',
            'correo.required_without' => 'Ingrese su correo o nombre de usuario.',
        ]);
        $identificador = mb_strtolower(trim((string) ($datos['identificador'] ?? $datos['correo'])));
        $columna = str_contains($identificador, '@') ? 'correo' : 'nombre_usuario';
        $usuario = Usuario::whereRaw("lower({$columna}) = ?", [$identificador])->lockForUpdate()->first();
        abort_unless($usuario && $usuario->activo && Hash::check($datos['contrasena'], $usuario->contrasena), 401, 'Credenciales inválidas.');
        $usuario->update(['ultimo_login' => now()]);

        return $usuario;
    }

    private function presentarUsuario(Usuario $usuario): array
    {
        return $usuario->toArray() + ['rol' => app(ResourcePolicy::class)->rol($usuario)];
    }

    public function me(Request $request)
    {
        return response()->json($this->presentarUsuario($request->user()));
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }
        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }
}
