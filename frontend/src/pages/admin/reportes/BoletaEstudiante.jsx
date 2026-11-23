import { GraduationCap } from 'lucide-react';
import { nombreCompleto } from '../../../utils/formato';
import {
  PERIODOS, colorNota, formatoNota, nivelNota,
} from '../../../utils/notas';

// Boleta de notas imprimible de un estudiante: una hoja por estudiante.
export default function BoletaEstudiante({ boleta, generado }) {
  const {
    estudiante, grado, seccion, ciclo, periodos, filas, general,
  } = boleta;
  return (
    <section className="boleta rounded-2xl border border-line bg-base p-8">
      <header className="flex items-start justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-brand-gradient flex h-11 w-11 items-center justify-center rounded-xl">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display text-base font-bold text-white">Colegio Metodista</p>
            <p className="text-[11px] text-gray-500">Boleta de calificaciones</p>
          </div>
        </div>
        <div className="text-right text-[11px] text-gray-400">
          <p className="font-display text-sm font-semibold text-white">{ciclo}</p>
          <p>{`Emitida el ${generado}`}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-5 text-xs sm:grid-cols-4">
        {[
          ['Estudiante', nombreCompleto(estudiante)],
          ['NIE', estudiante?.codigo_nie],
          ['Grado', grado],
          ['Sección', seccion],
        ].map(([etiqueta, valor]) => (
          <div key={etiqueta} className={etiqueta === 'Estudiante' ? 'col-span-2 sm:col-span-1' : ''}>
            <p className="text-[10px] tracking-wider text-gray-500 uppercase">{etiqueta}</p>
            <p className="font-semibold text-white">{valor || '—'}</p>
          </div>
        ))}
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-line">
            <th className="border border-line px-3 py-2 text-left text-[10px] tracking-wider text-gray-400 uppercase">Asignatura</th>
            {periodos.map((p) => (
              <th key={p} className="border border-line px-3 py-2 text-center text-[10px] tracking-wider text-gray-400 uppercase">{PERIODOS[p]}</th>
            ))}
            <th className="border border-line px-3 py-2 text-center text-[10px] tracking-wider text-gray-400 uppercase">Promedio</th>
            <th className="border border-line px-3 py-2 text-center text-[10px] tracking-wider text-gray-400 uppercase">Desempeño</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.asignatura}>
              <td className="border border-line px-3 py-2 text-gray-200">{f.asignatura}</td>
              {periodos.map((p) => (
                <td key={p} className="border border-line px-3 py-2 text-center text-gray-300">{formatoNota(f.notas[p] ?? null)}</td>
              ))}
              <td className="border border-line px-3 py-2 text-center font-bold" style={{ color: colorNota(f.final) }}>{formatoNota(f.final)}</td>
              <td className="border border-line px-3 py-2 text-center text-gray-300">{f.final === null ? '—' : nivelNota(f.final).etiqueta}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-card">
            <td className="border border-line px-3 py-2 font-semibold text-white" colSpan={periodos.length + 1}>Promedio general</td>
            <td className="border border-line px-3 py-2 text-center font-bold" style={{ color: colorNota(general) }}>{formatoNota(general)}</td>
            <td className="border border-line px-3 py-2 text-center font-semibold text-white">{general === null ? '—' : nivelNota(general).etiqueta}</td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-3 text-[10px] text-gray-500">Escala de 0 a 10. Nota mínima de aprobación: 5.0. Promedio ponderado por evaluación.</p>

      <div className="mt-14 grid grid-cols-2 gap-12 text-center text-[11px] text-gray-400">
        <div className="border-t border-gray-500 pt-2">Firma del docente orientador</div>
        <div className="border-t border-gray-500 pt-2">Firma del padre, madre o responsable</div>
      </div>
    </section>
  );
}
