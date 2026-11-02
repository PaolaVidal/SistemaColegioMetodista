<?php

namespace App\Services;

use App\Jobs\EnviarNotificacionCorreo;
use Illuminate\Support\Facades\DB;

class PagoNotificacionService
{
    public function registrar(int $pagoId): void
    {
        $pago = DB::table('pagos')
            ->join('cuentas_por_cobrar', 'cuentas_por_cobrar.id', '=', 'pagos.id_cuenta_cobrar')
            ->join('estudiantes', 'estudiantes.id', '=', 'cuentas_por_cobrar.id_estudiante')
            ->where('pagos.id', $pagoId)
            ->select('pagos.*', 'cuentas_por_cobrar.saldo_pendiente',
                'estudiantes.id as estudiante_id', 'estudiantes.nombres', 'estudiantes.apellidos')
            ->first();

        if (! $pago) {
            return;
        }

        $destinatarios = DB::table('estudiante_responsable')
            ->join('responsables', 'responsables.id', '=', 'estudiante_responsable.id_responsable')
            ->join('usuarios', 'usuarios.id', '=', 'responsables.id_usuario')
            ->where('estudiante_responsable.id_estudiante', $pago->estudiante_id)
            ->where('responsables.activo', true)
            ->where('usuarios.activo', true)
            ->select('usuarios.id', 'usuarios.correo')
            ->distinct()
            ->get();

        foreach ($destinatarios as $destinatario) {
            $asunto = 'Pago registrado - '.$pago->nombres.' '.$pago->apellidos;
            $contenido = 'Se registró un pago de $'.number_format((float) $pago->monto_pago, 2)
                ." para {$pago->nombres} {$pago->apellidos}.\n"
                ."Concepto: {$pago->concepto}.\n"
                ."Comprobante: {$pago->numero_comprobante}.\n"
                .'Saldo pendiente: $'.number_format((float) $pago->saldo_pendiente, 2).'.';

            $notificacionId = DB::table('notificaciones')->insertGetId([
                'id_usuario_destino' => $destinatario->id,
                'tipo' => 'pago_registrado',
                'canal' => 'correo',
                'asunto' => $asunto,
                'contenido' => $contenido,
                'estado_envio' => 'pendiente',
                'created_at' => now(),
            ]);

            if (config('services.n8n.payment_webhook_url')) {
                EnviarNotificacionCorreo::dispatch($notificacionId, $destinatario->correo, 'pago_registrado')
                    ->afterCommit();
            }
        }
    }
}
