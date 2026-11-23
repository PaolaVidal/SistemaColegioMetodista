import { AlertTriangle } from 'lucide-react';
import Drawer from '../../../components/ui/Drawer';
import { iniciales, nombreCompleto } from '../../../utils/formato';
import {
  NOTA_MINIMA, PERIODOS, colorNota, formatoNota, nivelNota, promedio,
} from '../../../utils/notas';

// Boleta resumida del estudiante: promedio ponderado por asignatura y período.
export default function HistorialNotasDrawer({
  estudiante, promedios, registros, onClose,
}) {
  const asignaturas = [...new Set(promedios.map((p) => p.asignatura))].sort();
  const periodos = Object.keys(PERIODOS).map(Number).filter((p) => promedios.some((x) => x.periodo === p));
  const general = promedio(promedios.map((p) => p.promedio));
  const enRiesgo = promedios.filter((p) => p.promedio < NOTA_MINIMA);
  const ubicacion = registros[0] ? `${registros[0].grado} — Sección ${registros[0].seccion} · ` : '';
  const recientes = [...registros].sort((a, b) => b.id - a.id).slice(0, 20);

  return (
    <Drawer
      titulo={nombreCompleto(estudiante)}
      subtitulo={`${ubicacion}${estudiante.codigo_nie}`}
      onClose={onClose}
      encabezado={(
        <div className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white">
          {iniciales(estudiante.nombres, estudiante.apellidos)}
        </div>
      )}
    >
      <div className="space-y-4 p-5">
        {enRiesgo.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-[#EF444440] bg-[#EF444415] p-3 text-xs text-[#EF4444]">
            <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
            <span>{`Bajo rendimiento en ${enRiesgo.length} asignatura(s) y período(s): promedio menor que ${NOTA_MINIMA}.`}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-line bg-card p-3 text-center">
            <p className="font-display text-2xl font-bold" style={{ color: colorNota(general) }}>{formatoNota(general)}</p>
            <p className="text-[10px] text-gray-500">Promedio general</p>
          </div>
          <div className="rounded-xl border border-line bg-card p-3 text-center">
            <p className="font-display text-2xl font-bold text-white">{asignaturas.length}</p>
            <p className="text-[10px] text-gray-500">Asignaturas</p>
          </div>
          <div className="rounded-xl border border-line bg-card p-3 text-center">
            <p className="font-display text-sm font-bold" style={{ color: colorNota(general) }}>
              {general === null ? '—' : nivelNota(general).etiqueta}
            </p>
            <p className="text-[10px] text-gray-500">Situación</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="border-b border-line px-4 py-3">
            <p className="font-display text-xs font-semibold text-white">Promedio por asignatura y período</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-2 text-left font-semibold text-gray-400">Asignatura</th>
                {periodos.map((p) => <th key={p} className="px-3 py-2 text-center font-semibold text-gray-400">{`T${p}`}</th>)}
                <th className="px-3 py-2 text-center font-semibold text-gray-400">Final</th>
              </tr>
            </thead>
            <tbody>
              {asignaturas.map((a) => {
                const fila = periodos.map((p) => promedios
                  .find((x) => x.asignatura === a && x.periodo === p)?.promedio ?? null);
                const final = promedio(fila.filter((v) => v !== null));
                return (
                  <tr key={a} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-2 text-gray-300">{a}</td>
                    {fila.map((v, i) => (
                      <td key={periodos[i]} className="px-3 py-2 text-center font-display font-semibold" style={{ color: colorNota(v) }}>
                        {formatoNota(v)}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-display font-bold" style={{ color: colorNota(final) }}>{formatoNota(final)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="border-b border-line px-4 py-3">
            <p className="font-display text-xs font-semibold text-white">Últimas calificaciones</p>
          </div>
          <div className="max-h-64 divide-y divide-line overflow-y-auto">
            {recientes.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                <span className="w-10 flex-shrink-0 font-mono text-[10px] text-gray-500">{`T${r.periodo}`}</span>
                <span className="flex-1 truncate text-gray-400">{`${r.asignatura} · ${r.evaluacion}`}</span>
                <span className="font-display font-bold" style={{ color: colorNota(r.nota) }}>{formatoNota(r.nota)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
