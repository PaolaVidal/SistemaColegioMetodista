<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
                'usuario' => $usuario,
                'token' => $usuario->createToken('api', ['*'], $expira)->plainTextToken,
                'token_type' => 'Bearer',
                'expires_at' => $expira->toIso8601String(),
            ]);
        });
    }

    public function sesion(Request $request)
    {
        if (!$request->hasSession() || !$request->attributes->get('sanctum')) {
            throw ValidationException::withMessages(['sesion' => 'Inicie la sesión desde el frontend autorizado, con cookies y protección CSRF.']);
        }

        return DB::transaction(function () use ($request) {
            $usuario = $this->validarCredenciales($request);
            Auth::guard('web')->login($usuario);
            $request->session()->regenerate();
            $request->session()->put('version_sesion', $usuario->version_sesion);
            $request->session()->put('password_hash_web', $usuario->getAuthPassword());

            return response()->json(['usuario' => $usuario]);
        });
    }

    private function validarCredenciales(Request $request): Usuario
    {
        $datos = $request->validate([
            'correo' => ['required', 'email'],
            'contrasena' => ['required', 'string'],
        ]);
        $usuario = Usuario::where('correo', $datos['correo'])->lockForUpdate()->first();
        abort_unless($usuario && $usuario->activo && Hash::check($datos['contrasena'], $usuario->contrasena), 401, 'Credenciales inválidas.');
        $usuario->update(['ultimo_login' => now()]);

        return $usuario;
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
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
