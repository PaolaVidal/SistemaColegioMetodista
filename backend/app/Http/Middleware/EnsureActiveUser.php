<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class EnsureActiveUser
{
    public function handle(Request $request, Closure $next)
    {
        $usuario = $request->user();
        $sesion = $request->hasSession() && !($usuario?->currentAccessToken() instanceof PersonalAccessToken);
        if (!$usuario?->activo || ($sesion && (int) $request->session()->get('version_sesion', -1) !== (int) $usuario->version_sesion)) {
            if ($sesion) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
            abort($usuario?->activo ? 401 : 403, 'La cuenta o sesión ya no está habilitada.');
        }

        return $next($request);
    }
}
