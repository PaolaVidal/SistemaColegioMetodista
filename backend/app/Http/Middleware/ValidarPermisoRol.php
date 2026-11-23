<?php

namespace App\Http\Middleware;

use App\Policies\Api\ResourcePolicy;
use Closure;
use Illuminate\Http\Request;

class ValidarPermisoRol
{
    public function handle(Request $request, Closure $next, string $recurso)
    {
        $accion = match ($request->method()) {
            'GET', 'HEAD' => 'R',
            'POST' => 'C',
            'PUT', 'PATCH' => 'U',
            'DELETE' => 'D',
            default => '',
        };

        abort_if($accion === '', 403, 'Operación no autorizada.');
        app(ResourcePolicy::class)->autorizar($request->user(), $recurso, $accion);

        return $next($request);
    }
}
