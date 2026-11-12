import { Fragment, useState } from 'react';
import {
  AlertTriangle, ArrowRight, Calendar, Check, ChevronLeft, GraduationCap, Layers, Search, User, UserPlus, X,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import { mensajeError } from '../../../services/api';
import { registrarMatricula } from '../../../services/matriculas';
import {
  fechaLarga, iniciales, nombreCiclo, nombreCompleto,
} from '../../../utils/formato';
import { colorOcupacion } from './estados';

const PASOS = ['Estudiante', 'Ciclo', 'Grado', 'Sección', 'Confirmación'];

function PuntoPaso({ numero, actual, etiqueta }) {
  const hecho = numero < actual;
  const activo = numero === actual;
  let estilo = 'border-line bg-card text-gray-500';
  if (hecho) estilo = 'border-brand bg-brand text-white';
  else if (activo) estilo = 'border-brand bg-brand/10 text-brand-soft';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-display text-xs font-bold ${estilo}`}>
        {hecho ? <Check size={14} /> : numero}
      </div>
      <span className={`font-display text-[10px] font-medium whitespace-nowrap ${activo ? 'text-brand-soft' : 'text-gray-500'}`}>
        {etiqueta}
      </span>
    </div>
  );
}

function Opcion({
  seleccionada, deshabilitada = false, onClick, children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitada}
      aria-pressed={seleccionada}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all
        disabled:cursor-not-allowed disabled:opacity-50
        ${seleccionada ? 'border-brand bg-brand/10' : 'border-line bg-card hover:border-brand/40'}`}
    >
      {children}
      {seleccionada && <Check size={14} className="ml-auto flex-shrink-0 text-brand-soft" />}
    </button>
  );
}

function Advertencia({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[#F59E0B40] bg-[#F59E0B15] p-3 text-xs text-[#F59E0B]">
      <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />{children}
    </div>
  );
}

// Con `estudianteFijo` el asistente omite el paso de selección de estudiante (se usa desde Estudiantes).
export default function MatriculaWizard({
  estudiantes = [], ciclos, secciones, matriculas, estudianteFijo = null, onNuevoEstudiante, onClose, onRegistrada,
}) {
  const primerPaso = estudianteFijo ? 2 : 1;
  const pasosVisibles = PASOS.slice(primerPaso - 1);
  const [paso, setPaso] = useState(primerPaso);
  const [buscar, setBuscar] = useState('');
  const [estudiante, setEstudiante] = useState(estudianteFijo);
  const [ciclo, setCiclo] = useState(null);
  const [idGrado, setIdGrado] = useState(null);
  const [seccion, setSeccion] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const termino = buscar.trim().toLowerCase();
  const candidatos = estudiantes
    .filter((e) => !termino || nombreCompleto(e).toLowerCase().includes(termino) || e.codigo_nie.includes(termino))
    .sort((a, b) => a.apellidos.localeCompare(b.apellidos))
    .slice(0, 40);

  const ciclosMatriculados = new Set(
    matriculas.filter((m) => m.id_estudiante === estudiante?.id).map((m) => m.id_ciclo),
  );
  const seccionesCiclo = secciones.filter((s) => s.id_ciclo === ciclo?.id);
  const grados = [...new Map(seccionesCiclo.map((s) => [s.id_grado, s.grado])).entries()].sort((a, b) => a[0] - b[0]);
  const seccionesGrado = seccionesCiclo
    .filter((s) => s.id_grado === idGrado)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  const matriculaActual = matriculas.find((m) => m.id_estudiante === estudiante?.id && m.ciclo?.activo);

  const puedeAvanzar = [Boolean(estudiante), Boolean(ciclo), Boolean(idGrado), Boolean(seccion), true][paso - 1];

  function cuposLibres(lista) {
    return lista.reduce((suma, s) => suma + Math.max(0, (s.capacidad || 0) - s.ocupados), 0);
  }

  async function confirmar() {
    setError('');
    setGuardando(true);
    try {
      await registrarMatricula({ idEstudiante: estudiante.id, idCiclo: ciclo.id, idSeccion: seccion.id });
      onRegistrada(
        `Matrícula de ${nombreCompleto(estudiante)} registrada correctamente.`,
        `${seccion.grado} — Sección ${seccion.nombre} (${nombreCiclo(ciclo)})`,
      );
    } catch (e) {
      setError(mensajeError(e, 'No se pudo registrar la matrícula.'));
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Registrar matrícula"
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-base shadow-2xl"
      >
        <div className="border-b border-line px-6 pt-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-white">Registrar matrícula</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {estudianteFijo ? `${nombreCompleto(estudianteFijo)} · ` : ''}
                {`Paso ${paso - primerPaso + 1} de ${pasosVisibles.length}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-line hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 pb-5">
            {pasosVisibles.map((etiqueta, i) => (
              <Fragment key={etiqueta}>
                <PuntoPaso numero={i + 1} actual={paso - primerPaso + 1} etiqueta={etiqueta} />
                {i < pasosVisibles.length - 1 && (
                  <div className={`mb-4 h-0.5 flex-1 rounded-full ${paso - primerPaso + 1 > i + 1 ? 'bg-brand' : 'bg-line'}`} />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="max-h-[55vh] min-h-72 space-y-3 overflow-y-auto px-6 py-5">
          {paso === 1 && (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400">Selecciona el estudiante a matricular.</p>
                {onNuevoEstudiante && (
                  <button
                    type="button"
                    onClick={onNuevoEstudiante}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5
                      font-display text-[11px] font-semibold text-brand-soft transition-colors hover:bg-brand/20"
                  >
                    <UserPlus size={12} />Registrar nuevo estudiante
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2">
                <Search size={13} className="text-gray-500" />
                <label htmlFor="wizard-buscar" className="sr-only">Buscar estudiante</label>
                <input
                  id="wizard-buscar"
                  className="w-full bg-transparent text-xs text-white placeholder-gray-600 outline-none"
                  placeholder="Buscar por nombre o NIE..."
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                />
              </div>
              <div className="max-h-56 space-y-1.5 overflow-y-auto">
                {candidatos.map((e) => (
                  <Opcion
                    key={e.id}
                    seleccionada={estudiante?.id === e.id}
                    onClick={() => { setEstudiante(e); setCiclo(null); setIdGrado(null); setSeccion(null); }}
                  >
                    <div className="bg-brand-dark flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                      {iniciales(e.nombres, e.apellidos)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-semibold text-white">{nombreCompleto(e)}</p>
                      <p className="font-mono text-[10px] text-gray-500">{e.codigo_nie}</p>
                    </div>
                    <span
                      className="flex-shrink-0 rounded-full px-2 py-0.5 text-[11px]"
                      style={e.activo ? { background: '#10B98120', color: '#10B981' } : { background: '#F59E0B20', color: '#F59E0B' }}
                    >
                      {e.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </Opcion>
                ))}
                {candidatos.length === 0 && (
                  <p className="py-6 text-center text-xs text-gray-500">
                    {onNuevoEstudiante ? '¿No está en el sistema? Regístralo con el botón «Registrar nuevo estudiante».' : 'Sin resultados'}
                  </p>
                )}
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <p className="text-xs text-gray-400">Selecciona el ciclo académico para esta matrícula.</p>
              {ciclos.map((c) => {
                const yaMatriculado = ciclosMatriculados.has(c.id);
                return (
                  <Opcion
                    key={c.id}
                    seleccionada={ciclo?.id === c.id}
                    deshabilitada={yaMatriculado}
                    onClick={() => { setCiclo(c); setIdGrado(null); setSeccion(null); }}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-display text-xs font-bold text-white
                        ${ciclo?.id === c.id ? 'bg-brand' : 'bg-line'}`}
                    >
                      {String(c.fecha_inicio).slice(0, 4)}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-white">{nombreCiclo(c)}</p>
                      <span className={`text-[11px] ${c.activo ? 'text-[#10B981]' : 'text-gray-500'}`}>
                        {c.activo ? 'Activo' : 'Histórico'}
                        {yaMatriculado && ' · El estudiante ya tiene matrícula en este ciclo'}
                      </span>
                    </div>
                  </Opcion>
                );
              })}
            </>
          )}

          {paso === 3 && (
            <>
              <p className="text-xs text-gray-400">Selecciona el grado al que se matriculará el estudiante.</p>
              {matriculaActual && (
                <div className="flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 p-3 text-xs text-brand-soft">
                  <User size={12} />
                  {`Grado actual del estudiante: ${matriculaActual.grado} — Sección ${matriculaActual.seccion}`}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {grados.map(([id, nombre]) => {
                  const libres = cuposLibres(seccionesCiclo.filter((s) => s.id_grado === id));
                  return (
                    <Opcion
                      key={id}
                      seleccionada={idGrado === id}
                      onClick={() => { setIdGrado(id); setSeccion(null); }}
                    >
                      <GraduationCap size={16} className={idGrado === id ? 'text-brand-soft' : 'text-gray-500'} />
                      <div>
                        <p className="font-display text-sm font-semibold text-white">{nombre}</p>
                        <p className={`text-[11px] ${libres > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {libres > 0 ? `${libres} cupos disponibles` : 'Sin cupos'}
                        </p>
                      </div>
                    </Opcion>
                  );
                })}
              </div>
            </>
          )}

          {paso === 4 && (
            <>
              <p className="text-xs text-gray-400">Selecciona la sección para el estudiante.</p>
              {seccionesGrado.map((s) => {
                const libres = s.capacidad ? s.capacidad - s.ocupados : null;
                const color = colorOcupacion(s.ocupados, s.capacidad);
                return (
                  <Opcion
                    key={s.id}
                    seleccionada={seccion?.id === s.id}
                    deshabilitada={libres !== null && libres <= 0}
                    onClick={() => setSeccion(s)}
                  >
                    <div className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-bold text-white">
                      {s.nombre}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="font-display text-sm font-semibold text-white">{`Sección ${s.nombre}`}</p>
                        <span className="text-xs text-gray-400">{`${s.ocupados}/${s.capacidad ?? '∞'} estudiantes`}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-line">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${s.capacidad ? Math.min(100, (s.ocupados / s.capacidad) * 100) : 0}%`, background: color }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-sm font-bold" style={{ color }}>{libres ?? '—'}</p>
                      <p className="text-[10px] text-gray-500">cupos</p>
                    </div>
                  </Opcion>
                );
              })}
            </>
          )}

          {paso === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">Revisa la información antes de confirmar la matrícula.</p>
              <Alerta>{error}</Alerta>
              {!estudiante.activo && (
                <Advertencia>
                  El estudiante está marcado como Inactivo. Verifique su estado antes de matricular.
                </Advertencia>
              )}
              {!ciclo.activo && (
                <Advertencia>El ciclo seleccionado es histórico; la matrícula aparecerá como finalizada.</Advertencia>
              )}
              <div className="overflow-hidden rounded-xl border border-line">
                <div className="flex items-center gap-3 border-b border-line bg-card p-4">
                  <div className="bg-brand-gradient flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white">
                    {iniciales(estudiante.nombres, estudiante.apellidos)}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-white">{nombreCompleto(estudiante)}</p>
                    <p className="font-mono text-[11px] text-gray-500">{estudiante.codigo_nie}</p>
                  </div>
                </div>
                {[
                  { icono: Calendar, etiqueta: 'Ciclo', valor: nombreCiclo(ciclo) },
                  { icono: GraduationCap, etiqueta: 'Grado', valor: seccion.grado },
                  { icono: Layers, etiqueta: 'Sección', valor: `Sección ${seccion.nombre}` },
                  { icono: Calendar, etiqueta: 'Fecha de matrícula', valor: fechaLarga() },
                ].map((fila) => (
                  <div key={fila.etiqueta} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
                    <fila.icono size={13} className="text-brand-soft" />
                    <span className="w-32 flex-shrink-0 text-xs text-gray-500">{fila.etiqueta}</span>
                    <span className="text-xs font-medium text-white">{fila.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={paso === primerPaso ? onClose : () => setPaso(paso - 1)}
            disabled={guardando}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 font-display text-xs font-medium text-gray-400
              transition-colors hover:bg-line hover:text-white"
          >
            <ChevronLeft size={14} />{paso === primerPaso ? 'Cancelar' : 'Anterior'}
          </button>
          {paso < PASOS.length ? (
            <button
              type="button"
              onClick={() => setPaso(paso + 1)}
              disabled={!puedeAvanzar}
              className="bg-brand-gradient flex items-center gap-1.5 rounded-lg px-5 py-2 font-display text-xs font-semibold
                text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={confirmar}
              disabled={guardando}
              className="bg-brand-gradient flex items-center gap-1.5 rounded-lg px-5 py-2 font-display text-xs font-semibold
                text-white hover:opacity-90 disabled:opacity-40"
            >
              <Check size={13} />{guardando ? 'Registrando...' : 'Confirmar matrícula'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
