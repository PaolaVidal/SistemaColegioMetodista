import { AlertTriangle } from 'lucide-react';
import Drawer from '../../../components/ui/Drawer';
import Pill from '../../../components/ui/Pill';
import { iniciales, nombreCompleto } from '../../../utils/formato';
import {
  ESTADOS_ASISTENCIA, MINIMO_AUSENCIAS_RECURRENTES, colorPorcentaje, fechaConDia, porcentajeAsistencia,
} from './estados';

export default function HistorialAsistenciaDrawer({ estudiante, registros, onClose }) {
  const contar = (estado) => registros.filter((r) => r.estado === estado).length;
  const ausencias = contar('Ausente');
  const porcentaje = porcentajeAsistencia(registros);
  const ubicacion = registros[0] ? `${registros[0].grado} — Sección ${registros[0].seccion} · ` : '';

  const porAsignatura = Object.entries(
    registros.reduce((acc, r) => ({ ...acc, [r.asignatura]: [...(acc[r.asignatura] || []), r] }), {}),
  )
    .map(([asignatura, lista]) => ({
      asignatura,
      ausencias: lista.filter((r) => r.estado === 'Ausente').length,
      porcentaje: porcentajeAsistencia(lista),
    }))
    .sort((a, b) => a.porcentaje - b.porcentaje);

  const recientes = [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 25);

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
        {ausencias >= MINIMO_AUSENCIAS_RECURRENTES && (
          <div className="flex items-start gap-2 rounded-lg border border-[#EF444440] bg-[#EF444415] p-3 text-xs text-[#EF4444]">
            <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
            <span>{`Este estudiante registra ${ausencias} ausencias en el período: inasistencia recurrente detectada.`}</span>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {[
            ['Presentes', contar('Presente'), '#10B981'],
            ['Ausentes', ausencias, '#EF4444'],
            ['Tardanzas', contar('Tardanza'), '#F59E0B'],
            ['% Asist.', porcentaje === null ? '—' : `${porcentaje}%`, colorPorcentaje(porcentaje)],
          ].map(([etiqueta, valor, color]) => (
            <div key={etiqueta} className="rounded-xl border border-line bg-card p-3 text-center">
              <p className="font-display text-xl font-bold" style={{ color }}>{valor}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{etiqueta}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="border-b border-line px-4 py-3">
            <p className="font-display text-xs font-semibold text-white">Asistencia por asignatura</p>
          </div>
          <div className="divide-y divide-line">
            {porAsignatura.map((a) => {
              const color = colorPorcentaje(a.porcentaje);
              return (
                <div key={a.asignatura} className="px-4 py-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs text-gray-300">{a.asignatura}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      {a.ausencias > 0 && <span className="text-[#EF4444]">{`${a.ausencias} ausencias`}</span>}
                      <span className="font-semibold" style={{ color }}>{`${a.porcentaje}%`}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-line">
                    <div className="h-1.5 rounded-full" style={{ width: `${a.porcentaje}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="border-b border-line px-4 py-3">
            <p className="font-display text-xs font-semibold text-white">Registros recientes</p>
          </div>
          <div className="max-h-72 divide-y divide-line overflow-y-auto">
            {recientes.map((r) => {
              const { color, icono } = ESTADOS_ASISTENCIA[r.estado];
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-24 flex-shrink-0 font-mono text-[10px] text-gray-500">{fechaConDia(r.fecha)}</span>
                  <span className="flex-1 truncate text-xs text-gray-400">{r.asignatura}</span>
                  <Pill color={color} icono={icono}>{r.estado}</Pill>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
