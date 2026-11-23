import { useState } from 'react';
import { Clock, Plus, X } from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import { mensajeError } from '../../../services/api';
import { asignarCurso, quitarCurso } from '../../../services/docentes';
import { nombreCiclo } from '../../../utils/formato';
import { colorDocente, horasSemanales } from './utilidades';

// Asignaturas que imparte el docente en el ciclo activo, con alta y baja de asignaciones.
export default function AsignacionesDocente({
  docente, ciclo, secciones, asignaturas, asignacionesCiclo, onCambio,
}) {
  const [idSeccion, setIdSeccion] = useState('');
  const [idAsignatura, setIdAsignatura] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const color = colorDocente(docente);

  const ocupadas = new Set(
    asignacionesCiclo.filter((a) => String(a.id_seccion) === idSeccion).map((a) => a.id_asignatura),
  );
  const disponibles = asignaturas.filter((a) => !ocupadas.has(a.id));

  async function ejecutar(accion, mensaje) {
    setError('');
    setProcesando(true);
    try {
      await accion();
      await onCambio(mensaje);
      setIdAsignatura('');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo completar la operación.'));
    } finally {
      setProcesando(false);
    }
  }

  function agregar() {
    ejecutar(() => asignarCurso({
      idCiclo: ciclo.id, idSeccion: Number(idSeccion), idAsignatura: Number(idAsignatura), idDocente: docente.id,
    }), 'Asignatura asignada correctamente.');
  }

  function quitar(asignacion) {
    ejecutar(() => quitarCurso(asignacion.id), 'Asignación eliminada.');
  }

  return (
    <div className="space-y-4">
      <Alerta>{error}</Alerta>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-line">
              {['Asignatura', 'Grado', 'Sección', 'Horas/sem', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold tracking-wider text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docente.asignaciones.length === 0 && (
              <tr>
                <td colSpan={5} className="bg-base px-4 py-6 text-center text-gray-500">
                  {`Sin asignaturas en el ${nombreCiclo(ciclo).toLowerCase()}`}
                </td>
              </tr>
            )}
            {docente.asignaciones.map((a, i) => (
              <tr key={a.id} className={i % 2 === 0 ? 'bg-base' : 'bg-panel'}>
                <td className="px-4 py-3 font-medium text-gray-200">{a.asignatura}</td>
                <td className="px-4 py-3 text-gray-400">{a.grado}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: `${color}20`, color }}
                  >
                    {a.seccion}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock size={10} className="text-gray-600" />{`${a.horas}h/sem`}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => quitar(a)}
                    disabled={procesando}
                    title="Quitar asignación"
                    aria-label={`Quitar ${a.asignatura} de ${a.grado} ${a.seccion}`}
                    className="text-gray-600 transition-colors hover:text-[#EF4444] disabled:opacity-40"
                  >
                    <X size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {docente.asignaciones.length > 0 && (
            <tfoot>
              <tr className="bg-line">
                <td colSpan={3} className="px-4 py-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Total</td>
                <td colSpan={2} className="px-4 py-2 text-[11px] font-bold text-brand-soft">{`${horasSemanales(docente)}h/sem`}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {ciclo && (
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Asignar nueva asignatura</p>
          <div className="flex flex-wrap items-end gap-2">
            <label htmlFor="asignar-seccion" className="sr-only">Grado y sección</label>
            <select
              id="asignar-seccion"
              value={idSeccion}
              onChange={(e) => { setIdSeccion(e.target.value); setIdAsignatura(''); }}
              className="input-field w-auto min-w-44 flex-1"
            >
              <option value="">Grado y sección...</option>
              {secciones.map((s) => <option key={s.id} value={s.id}>{`${s.grado} — ${s.nombre.trim()}`}</option>)}
            </select>
            <label htmlFor="asignar-asignatura" className="sr-only">Asignatura</label>
            <select
              id="asignar-asignatura"
              value={idAsignatura}
              onChange={(e) => setIdAsignatura(e.target.value)}
              disabled={!idSeccion}
              className="input-field w-auto min-w-40 flex-1"
            >
              <option value="">{idSeccion && disponibles.length === 0 ? 'Sin asignaturas libres' : 'Asignatura...'}</option>
              {disponibles.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
            <button
              type="button"
              onClick={agregar}
              disabled={!idSeccion || !idAsignatura || procesando}
              className="bg-brand-gradient flex flex-shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold
                text-white disabled:opacity-40"
            >
              <Plus size={12} />Agregar
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-600">
            Solo se muestran las asignaturas que aún no tienen docente en la sección elegida.
          </p>
        </div>
      )}
    </div>
  );
}
