<?php

namespace App\Console\Commands;

use App\Services\MoraNotificacionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RevisarMora extends Command
{
    protected $signature = 'mora:revisar';

    protected $description = 'Detecta cuentas vencidas y programa avisos a sus responsables';

    public function handle(MoraNotificacionService $servicio): int
    {
        $avisos = 0;
        DB::table('cuentas_por_cobrar')
            ->where('fecha_vencimiento', '<', now('America/El_Salvador')->toDateString())
            ->where('saldo_pendiente', '>', 0)
            ->chunkById(100, function ($cuentas) use ($servicio, &$avisos) {
                foreach ($cuentas as $cuenta) {
                    $avisos += $servicio->evaluar($cuenta->id);
                }
            });

        $this->info("Avisos de mora programados: {$avisos}");

        return self::SUCCESS;
    }
}
