<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class NotificacionCorreoService
{
    public function enviar(int $notificacionId, string $correo, string $url): void
    {
        $notificacion = DB::table('notificaciones')->where('id', $notificacionId)->first();
        if (! $notificacion || $notificacion->estado_envio === 'enviado') {
            return;
        }

        try {
            Http::connectTimeout(2)->timeout(10)->acceptJson()->post($url, [
                'notificacion_id' => $notificacionId,
                'correo' => $correo,
                'asunto' => $notificacion->asunto,
                'contenido' => $notificacion->contenido,
            ])->throw();
            DB::table('notificaciones')->where('id', $notificacionId)->update([
                'estado_envio' => 'enviado',
                'fecha_envio' => now()->toDateString(),
            ]);
        } catch (Throwable $exception) {
            Log::warning('No se pudo enviar la notificación por correo a n8n; se reintentará.', [
                'notificacion_id' => $notificacionId,
                'error' => $exception->getMessage(),
            ]);
            throw $exception;
        }
    }
}
