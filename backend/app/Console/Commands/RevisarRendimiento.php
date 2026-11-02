<?php

namespace App\Console\Commands;

use App\Services\RendimientoNotificacionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RevisarRendimiento extends Command
{
    protected $signature = 'rendimiento:revisar';

    protected $description = 'Recalcula promedios modificados, incluso si las notas se editaron directamente en PostgreSQL';

    public function handle(RendimientoNotificacionService $servicio): int
    {
        $promedios = DB::table('calificaciones as c')
            ->join('evaluaciones as e', 'e.id', '=', 'c.id_evaluacion')
            ->selectRaw('c.id_matricula, e.id_asignacion_curso, e.periodo, ROUND(SUM(c.nota * e.ponderacion) / SUM(e.ponderacion), 2) AS promedio')
            ->groupBy('c.id_matricula', 'e.id_asignacion_curso', 'e.periodo')
            ->get()
            ->keyBy(fn ($fila) => $this->clave($fila));

        $estados = DB::table('alertas_rendimiento')->get()
            ->keyBy(fn ($fila) => $this->clave($fila));

        $pendientes = collect();
        foreach ($promedios as $clave => $fila) {
            $estado = $estados->get($clave);
            if (!$estado || $estado->ultimo_promedio === null
                || abs((float) $estado->ultimo_promedio - (float) $fila->promedio) >= 0.005
                || (bool) $estado->en_riesgo !== ((float) $fila->promedio < 5)) {
                $pendientes->push($fila);
            }
        }

        foreach ($estados as $clave => $estado) {
            if (!$promedios->has($clave) && ($estado->ultimo_promedio !== null || $estado->en_riesgo)) {
                $pendientes->push($estado);
            }
        }

        foreach ($pendientes as $fila) {
            DB::transaction(fn () => $servicio->evaluar(
                (int) $fila->id_matricula,
                (int) $fila->id_asignacion_curso,
                (int) $fila->periodo
            ));
        }

        $this->info("Promedios revisados: {$pendientes->count()}");

        return self::SUCCESS;
    }

    private function clave(object $fila): string
    {
        return "{$fila->id_matricula}:{$fila->id_asignacion_curso}:{$fila->periodo}";
    }
}
