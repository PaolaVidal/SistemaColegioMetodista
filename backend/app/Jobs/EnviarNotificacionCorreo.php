<?php

namespace App\Jobs;

use App\Services\NotificacionCorreoService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class EnviarNotificacionCorreo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 20;

    public function __construct(public int $notificacionId, public string $correo, public string $tipo)
    {
        $this->onQueue('correos');
    }

    public function backoff(): array
    {
        return [10, 60];
    }

    public function handle(NotificacionCorreoService $servicio): void
    {
        $url = match ($this->tipo) {
            'pago_registrado' => config('services.n8n.payment_webhook_url'),
            'bajo_rendimiento' => config('services.n8n.academic_webhook_url'),
            'mora' => config('services.n8n.overdue_webhook_url'),
            default => null,
        };

        if (!$url) {
            throw new \RuntimeException("No hay webhook configurado para {$this->tipo}.");
        }

        $servicio->enviar($this->notificacionId, $this->correo, $url);
    }

    public function failed(Throwable $exception): void
    {
        DB::table('notificaciones')->where('id', $this->notificacionId)
            ->where('estado_envio', '<>', 'enviado')
            ->update(['estado_envio' => 'fallido']);
        Log::error('Falló el envío de notificación después de agotar los intentos.', [
            'notificacion_id' => $this->notificacionId,
            'tipo' => $this->tipo,
            'error' => $exception->getMessage(),
        ]);
    }
}
