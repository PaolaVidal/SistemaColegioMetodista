<?php

namespace App\Services;

use App\Jobs\EnviarNotificacionCorreo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class MoraNotificacionService
{
    public function evaluar(int $cuentaId): int
    {
        return DB::transaction(function () use ($cuentaId): int {
            $cuenta = DB::table('cuentas_por_cobrar as c')
                ->join('estudiantes as e', 'e.id', '=', 'c.id_estudiante')
                ->where('c.id', $cuentaId)
                ->lockForUpdate()
                ->first(['c.id', 'c.id_estudiante', 'c.concepto', 'c.fecha_vencimiento',
                    'c.saldo_pendiente', 'c.estado', 'e.nombres', 'e.apellidos']);

            $hoy = Carbon::today('America/El_Salvador');
            if (! $cuenta || (float) $cuenta->saldo_pendiente <= 0
                || $cuenta->fecha_vencimiento >= $hoy->toDateString()) {
                return 0;
            }

            if ($cuenta->estado !== 'vencido') {
                DB::table('cuentas_por_cobrar')->where('id', $cuentaId)
                    ->update(['estado' => 'vencido', 'updated_at' => now()]);
            }

            DB::table('alertas_mora')->insertOrIgnore([
                'id_cuenta_cobrar' => $cuentaId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $estado = DB::table('alertas_mora')->where('id_cuenta_cobrar', $cuentaId)
                ->lockForUpdate()->first();
            if ($estado->ultimo_aviso
                && Carbon::parse($estado->ultimo_aviso)->addDays(7)->greaterThan($hoy)) {
                return 0;
            }

            $destinatarios = DB::table('estudiante_responsable as er')
                ->join('responsables as r', 'r.id', '=', 'er.id_responsable')
                ->join('usuarios as u', 'u.id', '=', 'r.id_usuario')
                ->where('er.id_estudiante', $cuenta->id_estudiante)
                ->where('r.activo', true)->where('u.activo', true)
                ->select('u.id', 'u.correo')->distinct()->get();
            if ($destinatarios->isEmpty()) {
                return 0;
            }

            $asunto = 'Aviso de pago vencido - '.$cuenta->nombres.' '.$cuenta->apellidos;
            $contenido = "La cuenta de {$cuenta->nombres} {$cuenta->apellidos} por {$cuenta->concepto} "
                ."venció el {$cuenta->fecha_vencimiento}.\n"
                .'Saldo pendiente: $'.number_format((float) $cuenta->saldo_pendiente, 2).".\n"
                .'Por favor, consulte el estado de cuenta con Secretaría.';

            foreach ($destinatarios as $destinatario) {
                $notificacionId = DB::table('notificaciones')->insertGetId([
                    'id_usuario_destino' => $destinatario->id,
                    'tipo' => 'mora',
                    'canal' => 'correo',
                    'asunto' => $asunto,
                    'contenido' => $contenido,
                    'estado_envio' => 'pendiente',
                    'created_at' => now(),
                ]);
                if (config('services.n8n.overdue_webhook_url')) {
                    EnviarNotificacionCorreo::dispatch($notificacionId, $destinatario->correo, 'mora')
                        ->afterCommit();
                }
            }

            DB::table('alertas_mora')->where('id', $estado->id)
                ->update(['ultimo_aviso' => $hoy->toDateString(), 'updated_at' => now()]);

            return $destinatarios->count();
        });
    }
}
