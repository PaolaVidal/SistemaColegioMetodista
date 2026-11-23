import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Edit3, Eye, GripVertical, Layers, Trash2, User,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Cargando from '../../../components/ui/Cargando';
import SelectFiltro from '../../../components/ui/SelectFiltro';
import { mensajeError } from '../../../services/api';
import {
  DURACION_CLASE, aHora, cargarHorarios, crearBloque, eliminarBloque, intercambiarBloques, mensajeHorario, minutos,
  moverBloque, reemplazarAsignacion,
} from '../../../services/horarios';
import { nombreCiclo } from '../../../utils/formato';
import AvisoConflicto from './AvisoConflicto';
import BloqueModal from './BloqueModal';
import explicarConflicto from './conflictos';
import VistaPreviaConflicto from './VistaPreviaConflicto';
import CuadriculaHorario, { iniciarArrastre } from './CuadriculaHorario';

const PASO_MINUTOS = 10;

function FichaPaleta({
  asignacion, vista, onArrastrar, onTerminar,
}) {
  return (
    <div
      draggable
      onDragStart={(e) => { iniciarArrastre(e); onArrastrar(); }}
      onDragEnd={onTerminar}
      title="Arrastra a la cuadrícula del horario"
      className="flex cursor-grab items-center gap-2 rounded-lg border px-2.5 py-2 transition-all select-none hover:brightness-125
        active:cursor-grabbing"
      style={{ background: `${asignacion.color}15`, borderColor: `${asignacion.color}40` }}
    >
      <GripVertical size={11} className="flex-shrink-0 text-gray-500" />
      <div className="min-w-0">
        <p className="truncate font-display text-[11px] font-semibold" style={{ color: asignacion.color }}>{asignacion.asignatura}</p>
        <p className="truncate text-[10px] text-gray-500">
          {vista === 'seccion' ? asignacion.docente : `${asignacion.grado} — ${asignacion.seccion}`}
        </p>
      </div>
    </div>
  );
}

export default function Horarios() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [vista, setVista] = useState('seccion');
  const [idSeccion, setIdSeccion] = useState('');
  const [idDocente, setIdDocente] = useState('');
  const [edicion, setEdicion] = useState(false);
  const [modal, setModal] = useState(null); // { bloque } | { inicial }
  const [arrastre, setArrastre] = useState(null); // { bloque, desfase } | { asignacion }
  const [vistaPrevia, setVistaPrevia] = useState(null); // { dia, inicio, fin, valido, detalle, explicacion }
  const [conflicto, setConflicto] = useState(null); // { mensaje, previa, pista }
  const [previaAbierta, setPreviaAbierta] = useState(null);
  const [sobrePapelera, setSobrePapelera] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const resultado = await cargarHorarios();
      setDatos(resultado);
      setIdSeccion((actual) => actual || String(resultado.secciones[0]?.id || ''));
      setIdDocente((actual) => actual || String(resultado.docentes[0]?.id || ''));
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los horarios.'));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    if (!datos) return [];
    return datos.bloques.filter((b) => (vista === 'seccion'
      ? String(b.asignacion.id_seccion) === idSeccion
      : String(b.asignacion.id_docente) === idDocente));
  }, [datos, vista, idSeccion, idDocente]);

  if (!datos) return error ? <Alerta>{error}</Alerta> : <Cargando texto="Cargando horarios..." />;

  const asignacionesVista = datos.asignaciones.filter((a) => (vista === 'seccion'
    ? String(a.id_seccion) === idSeccion : String(a.id_docente) === idDocente));
  const horas = visibles.reduce((s, b) => s + (minutos(b.fin) - minutos(b.inicio)) / 60, 0);
  const seccionActual = datos.secciones.find((s) => String(s.id) === idSeccion);
  const docenteActual = datos.docentes.find((d) => String(d.id) === idDocente);
  const titulo = vista === 'seccion'
    ? `${seccionActual?.grado || ''} — Sec. ${seccionActual?.nombre?.trim() || ''}`
    : `${docenteActual?.nombres || ''} ${docenteActual?.apellidos || ''}`;
  const porAsignatura = Object.values(visibles.reduce((acc, b) => {
    const clave = b.asignacion.asignatura;
    const actual = acc[clave] || { nombre: clave, color: b.asignacion.color, horas: 0 };
    return { ...acc, [clave]: { ...actual, horas: actual.horas + (minutos(b.fin) - minutos(b.inicio)) / 60 } };
  }, {})).sort((a, b) => b.horas - a.horas);

  // Revisa todos los horarios (no solo los visibles): sección y docente.
  function revisar(asignacion, rango, excluir = []) {
    return explicarConflicto(datos.bloques, asignacion, rango, excluir, vista);
  }

  function mostrarConflicto(explicacion, pista = '') {
    setAviso('');
    setError('');
    setConflicto({ ...explicacion, pista: explicacion.previa ? '' : pista });
  }

  function terminarArrastre() {
    setArrastre(null);
    setVistaPrevia(null);
    setSobrePapelera(false);
  }

  // Aplica el cambio en pantalla de inmediato, lo guarda y, si la base lo rechaza, recarga el estado real.
  async function aplicar(cambioLocal, guardar, mensaje) {
    setError('');
    setAviso('');
    setConflicto(null);
    setDatos((actual) => ({ ...actual, bloques: cambioLocal(actual.bloques) }));
    setGuardando(true);
    try {
      await guardar();
      setAviso(mensaje);
    } catch (e) {
      setError(mensajeHorario(e));
    } finally {
      await cargar();
      setGuardando(false);
    }
  }

  // Calcula dónde caería el bloque según la posición del cursor (ajustado a 10 minutos).
  function alPasarSobreDia(dia, minutoCursor, desde, hasta) {
    const duracion = arrastre.bloque
      ? minutos(arrastre.bloque.fin) - minutos(arrastre.bloque.inicio)
      : DURACION_CLASE;
    const deseado = Math.round((minutoCursor - (arrastre.desfase || 0)) / PASO_MINUTOS) * PASO_MINUTOS;
    const inicio = Math.min(Math.max(deseado, desde), hasta - duracion);
    const rango = { dia, inicio: aHora(inicio), fin: aHora(inicio + duracion) };
    if (vistaPrevia?.dia === dia && vistaPrevia?.inicio === rango.inicio) return;
    const asignacion = arrastre.bloque ? arrastre.bloque.asignacion : arrastre.asignacion;
    const explicacion = revisar(asignacion, rango, arrastre.bloque ? [arrastre.bloque.id] : []);
    setVistaPrevia({
      ...rango, valido: !explicacion, detalle: explicacion?.corto, explicacion,
    });
  }

  function alSoltarEnDia() {
    const actual = arrastre;
    const destino = vistaPrevia;
    terminarArrastre();
    if (!actual || !destino || guardando) return;
    if (!destino.valido) {
      mostrarConflicto(destino.explicacion, actual.bloque ? 'Suelta el bloque sobre otro para intercambiarlos.' : '');
      return;
    }
    const celda = { dia: destino.dia, inicio: destino.inicio, fin: destino.fin };

    if (actual.bloque) {
      const { bloque } = actual;
      if (bloque.dia_semana === celda.dia && bloque.inicio === celda.inicio) return;
      aplicar(
        (bloques) => bloques.map((b) => (b.id === bloque.id
          ? {
            ...b, dia_semana: celda.dia, inicio: celda.inicio, fin: celda.fin,
          }
          : b)),
        () => moverBloque(bloque, celda),
        `${bloque.asignacion.asignatura} se movió al ${celda.dia} de ${celda.inicio} a ${celda.fin}.`,
      );
      return;
    }

    const { asignacion } = actual;
    aplicar(
      (bloques) => [...bloques, {
        id: `nuevo-${Date.now()}`,
        id_asignacion_curso: asignacion.id,
        dia_semana: celda.dia,
        inicio: celda.inicio,
        fin: celda.fin,
        asignacion,
      }],
      () => crearBloque(asignacion.id, celda),
      `${asignacion.asignatura} se agregó el ${celda.dia} de ${celda.inicio} a ${celda.fin}.`,
    );
  }

  // Soltar sobre otro bloque: intercambia posiciones o reemplaza su asignatura.
  function alSoltarSobreBloque(destino) {
    const actual = arrastre;
    terminarArrastre();
    if (!actual || guardando) return;

    if (actual.bloque) {
      const { bloque } = actual;
      if (bloque.id === destino.id) return;
      const posicion = (b, de) => ({
        ...b, dia_semana: de.dia_semana, inicio: de.inicio, fin: de.fin,
      });
      const rango = (b) => ({ dia: b.dia_semana, inicio: b.inicio, fin: b.fin });
      const choque = revisar(bloque.asignacion, rango(destino), [bloque.id, destino.id])
        || revisar(destino.asignacion, rango(bloque), [bloque.id, destino.id]);
      if (choque) {
        mostrarConflicto(choque);
        return;
      }
      aplicar(
        (bloques) => bloques.map((b) => {
          if (b.id === bloque.id) return posicion(b, destino);
          if (b.id === destino.id) return posicion(b, bloque);
          return b;
        }),
        () => intercambiarBloques(bloque, destino),
        `${bloque.asignacion.asignatura} y ${destino.asignacion.asignatura} intercambiaron su horario.`,
      );
      return;
    }

    const { asignacion } = actual;
    const rangoDestino = { dia: destino.dia_semana, inicio: destino.inicio, fin: destino.fin };
    const choque = revisar(asignacion, rangoDestino, [destino.id]);
    if (choque) {
      mostrarConflicto(choque);
      return;
    }
    aplicar(
      (bloques) => bloques.map((b) => (b.id === destino.id
        ? { ...b, id_asignacion_curso: asignacion.id, asignacion } : b)),
      () => reemplazarAsignacion(destino, asignacion.id),
      `${destino.asignacion.asignatura} se reemplazó por ${asignacion.asignatura}.`,
    );
  }

  function soltarEnPapelera() {
    const actual = arrastre;
    terminarArrastre();
    if (!actual?.bloque || guardando) return;
    aplicar(
      (bloques) => bloques.filter((b) => b.id !== actual.bloque.id),
      () => eliminarBloque(actual.bloque.id),
      `Se quitó ${actual.bloque.asignacion.asignatura} del ${actual.bloque.dia_semana} a las ${actual.bloque.inicio}.`,
    );
  }

  async function alGuardar(mensaje) {
    setModal(null);
    setError('');
    setConflicto(null);
    setAviso(mensaje);
    await cargar();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-shrink-0 overflow-hidden rounded-lg border border-line">
          {[['seccion', 'Por sección', Layers], ['docente', 'Por docente', User]].map(([valor, texto, Icono]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={vista === valor}
              onClick={() => { setVista(valor); setConflicto(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 font-display text-xs font-medium transition-colors
                ${vista === valor ? 'bg-brand text-white' : 'bg-base text-gray-500 hover:text-gray-300'}`}
            >
              <Icono size={12} />{texto}
            </button>
          ))}
        </div>
        {vista === 'seccion' ? (
          <SelectFiltro id="horario-seccion" etiqueta="Sección" icono={Layers} valor={idSeccion} onChange={setIdSeccion}>
            {datos.secciones.map((s) => <option key={s.id} value={s.id}>{`${s.grado} — Sección ${s.nombre.trim()}`}</option>)}
          </SelectFiltro>
        ) : (
          <SelectFiltro id="horario-docente" etiqueta="Docente" icono={User} valor={idDocente} onChange={setIdDocente}>
            {datos.docentes.map((d) => <option key={d.id} value={d.id}>{`${d.nombres} ${d.apellidos}`}</option>)}
          </SelectFiltro>
        )}
        {guardando && <span className="text-xs text-gray-500">Guardando cambios...</span>}
        <button
          type="button"
          onClick={() => setEdicion(!edicion)}
          className={`ml-auto flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold transition-all
            ${edicion ? 'bg-[#F59E0B] text-white' : 'border border-line text-gray-300 hover:bg-line'}`}
        >
          {edicion ? <Eye size={13} /> : <Edit3 size={13} />}
          {edicion ? 'Terminar edición' : 'Editar horario'}
        </button>
      </div>

      <Alerta tipo="exito">{aviso}</Alerta>
      <Alerta>{error}</Alerta>
      <AvisoConflicto conflicto={conflicto} pista={conflicto?.pista} onVer={() => setPreviaAbierta(conflicto.previa)} />

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="flex flex-shrink-0 flex-col gap-4 xl:w-56">
          <div className="rounded-xl border border-line bg-card p-4">
            <p className="mb-2 text-[10px] tracking-wider text-gray-500 uppercase">{vista === 'seccion' ? 'Sección' : 'Docente'}</p>
            <p className="font-display text-lg leading-tight font-bold text-white">{titulo}</p>
            <p className="mt-1 text-xs text-gray-500">{nombreCiclo(datos.ciclo)}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-base p-2 text-center">
                <p className="font-display text-sm font-bold text-brand-soft">{visibles.length}</p>
                <p className="text-[10px] text-gray-500">bloques</p>
              </div>
              <div className="rounded-lg bg-base p-2 text-center">
                <p className="font-display text-sm font-bold text-[#10B981]">{`${Math.round(horas * 10) / 10}h`}</p>
                <p className="text-[10px] text-gray-500">por semana</p>
              </div>
            </div>
          </div>

          {edicion && (
            <div className="overflow-hidden rounded-xl border border-line bg-card">
              <div className="border-b border-line px-3 py-2.5">
                <p className="font-display text-[11px] font-semibold text-white">Arrastrar asignatura</p>
                <p className="mt-0.5 text-[10px] text-gray-500">Suéltala en un espacio libre o sobre un bloque para reemplazarlo</p>
              </div>
              <div className="max-h-72 space-y-1.5 overflow-y-auto p-2">
                {asignacionesVista.length === 0 && <p className="p-2 text-[11px] text-gray-600">Sin asignaturas asignadas en este ciclo</p>}
                {asignacionesVista.map((a) => (
                  <FichaPaleta
                    key={a.id}
                    asignacion={a}
                    vista={vista}
                    onArrastrar={() => setArrastre({ asignacion: a })}
                    onTerminar={terminarArrastre}
                  />
                ))}
              </div>
            </div>
          )}

          {edicion && (
            <div
              onDragOver={(e) => {
                if (!arrastre?.bloque) return;
                e.preventDefault();
                setVistaPrevia(null);
                setSobrePapelera(true);
              }}
              onDragLeave={() => setSobrePapelera(false)}
              onDrop={(e) => { e.preventDefault(); soltarEnPapelera(); }}
              className={`flex items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-[11px] transition-all
                ${sobrePapelera ? 'border-[#EF4444] bg-[#EF444420] text-[#EF4444]' : 'border-line text-gray-500'}`}
            >
              <Trash2 size={13} />Suelta aquí un bloque para quitarlo
            </div>
          )}

          <div className="rounded-xl border border-line bg-card p-3">
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Horas por asignatura</p>
            <div className="space-y-1.5">
              {porAsignatura.length === 0 && <p className="text-[11px] text-gray-600">Sin bloques asignados</p>}
              {porAsignatura.map((a) => (
                <div key={a.nombre} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background: a.color }} />
                  <span className="flex-1 truncate text-[11px] text-gray-400">{a.nombre}</span>
                  <span className="text-[11px] font-semibold text-white">{`${Math.round(a.horas * 10) / 10}h`}</span>
                </div>
              ))}
            </div>
          </div>

          {edicion && (
            <p className="rounded-xl border border-[#F59E0B40] bg-[#F59E0B10] p-3 text-[11px] text-[#F59E0B]">
              Arrastra un bloque a cualquier hora libre para moverlo (se ajusta a 10 minutos) o suéltalo sobre otro
              bloque para intercambiarlos. Pulsa un espacio libre o un bloque para editar horas exactas.
            </p>
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-line bg-card">
          <CuadriculaHorario
            bloques={visibles}
            vista={vista}
            edicion={edicion}
            arrastre={arrastre}
            vistaPrevia={vistaPrevia}
            onArrastrarBloque={(bloque, desfase) => setArrastre({ bloque, desfase })}
            onTerminar={terminarArrastre}
            onSobreDia={alPasarSobreDia}
            onSoltarDia={alSoltarEnDia}
            onSoltarSobreBloque={alSoltarSobreBloque}
            onEditarBloque={(bloque) => setModal({ bloque })}
            onAgregar={(dia, minuto) => setModal({
              inicial: {
                dia, inicio: aHora(minuto), fin: aHora(minuto + DURACION_CLASE), idAsignacion: asignacionesVista[0]?.id,
              },
            })}
          />
        </div>
      </div>

      {modal && (
        <BloqueModal
          bloque={modal.bloque}
          inicial={modal.inicial}
          asignaciones={asignacionesVista.length ? asignacionesVista : datos.asignaciones}
          revisar={revisar}
          bloques={datos.bloques}
          onClose={() => setModal(null)}
          onGuardado={alGuardar}
        />
      )}
      {previaAbierta && (
        <VistaPreviaConflicto previa={previaAbierta} bloques={datos.bloques} onClose={() => setPreviaAbierta(null)} />
      )}
    </div>
  );
}
