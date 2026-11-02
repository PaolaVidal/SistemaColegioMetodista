<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ContextoAuditoriaService
{
    public function establecer(int $usuarioId): void
    {
        // SET LOCAL evita trasladar la identidad a otra transacción de la conexión.
        DB::select("SELECT set_config('app.usuario_id', ?, true), set_config('app.origen', 'api', true)", [(string) $usuarioId]);
    }
}
