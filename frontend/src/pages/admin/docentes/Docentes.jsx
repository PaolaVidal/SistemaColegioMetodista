import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle, ChevronRight, GraduationCap, Plus, RotateCcw, Search, X,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Cargando from '../../../components/ui/Cargando';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { mensajeError } from '../../../services/api';
import { cargarDocentes, eliminarDocente, guardarDocente } from '../../../services/docentes';
import { iniciales, nombreCompleto } from '../../../utils/formato';
import DocenteForm from './DocenteForm';
import DocentePerfil from './DocentePerfil';
import {
  codigoDocente, colorDocente, grados, horasSemanales, materias,
} from './utilidades';

function ItemDocente({ docente, seleccionado, onSeleccionar }) {
  const color = colorDocente(docente);
  return (
    <button
      type="button"
      onClick={onSeleccionar}
      aria-current={seleccionado ? 'true' : undefined}
      className="relative w-full border-l-[3px] px-4 py-4 text-left transition-all"
      style={{ background: seleccionado ? 'var(--color-base)' : 'transparent', borderLeftColor: seleccionado ? color : 'transparent' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg,${color},${color}88)` }}
        >
          {iniciales(docente.nombres, docente.apellidos)}
          {!docente.activo && (
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-[#EF4444]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xs font-bold text-white">{nombreCompleto(docente)}</p>
          <p className="mt-0.5 truncate text-[10px] text-gray-500">{materias(docente).join(', ') || codigoDocente(docente)}</p>
          <div className="mt-1.5 flex items-center gap-2 text-[9px] text-gray-600">
            <span>{`${materias(docente).length} materias`}</span>
            <span>·</span>
            <span>{`${grados(docente).length} grados`}</span>
            <span>·</span>
            <span>{`${horasSemanales(docente)}h/sem`}</span>
          </div>
        </div>
        {seleccionado && <ChevronRight size={12} className="flex-shrink-0" style={{ color }} />}
      </div>
    </button>
  );
}

export default function Docentes() {
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [modo, setModo] = useState('ver'); // 'ver' | 'editar' | 'crear'
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMateria, setFiltroMateria] = useState('');
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const resultado = await cargarDocentes();
      setDatos(resultado);
      setError('');
      setIdSeleccionado((actual) => actual ?? resultado.docentes[0]?.id ?? null);
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los docentes.'));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (ubicacion.state?.crear) {
      setModo('crear');
      navegar(ubicacion.pathname, { replace: true, state: null });
    }
  }, [ubicacion.state, ubicacion.pathname, navegar]);

  const secciones = useMemo(
    () => [...(datos?.secciones || [])].sort((a, b) => a.id_grado - b.id_grado || a.nombre.localeCompare(b.nombre)),
    [datos],
  );

  const filtrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase();
    return (datos?.docentes || [])
      .filter((d) => !termino || nombreCompleto(d).toLowerCase().includes(termino)
        || d.dui.includes(termino) || codigoDocente(d).toLowerCase().includes(termino))
      .filter((d) => !filtroEstado || String(d.activo) === filtroEstado)
      .filter((d) => !filtroMateria || materias(d).includes(filtroMateria))
      .sort((a, b) => a.apellidos.localeCompare(b.apellidos));
  }, [datos, buscar, filtroEstado, filtroMateria]);

  if (error && !datos) return <Alerta>{error}</Alerta>;
  if (!datos) return <Cargando texto="Cargando docentes..." />;

  const seleccionado = datos.docentes.find((d) => d.id === idSeleccionado) || null;
  const hayFiltros = Boolean(buscar || filtroEstado || filtroMateria);
  const activos = datos.docentes.filter((d) => d.activo).length;
  const opcionesMateria = [...new Set(datos.asignaciones.map((a) => a.asignatura))].sort();

  async function recargarCon(mensaje) {
    setAviso(mensaje);
    await cargar();
  }

  async function alGuardar(id, mensaje) {
    setIdSeleccionado(id);
    setModo('ver');
    await recargarCon(mensaje);
  }

  async function cambiarEstado() {
    setProcesando(true);
    try {
      await guardarDocente(seleccionado.id, { activo: !seleccionado.activo });
      await recargarCon(seleccionado.activo ? 'Docente desactivado.' : 'Docente activado.');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo cambiar el estado.'));
    } finally {
      setProcesando(false);
    }
  }

  async function eliminar() {
    setProcesando(true);
    try {
      await eliminarDocente(seleccionado.id);
      setIdSeleccionado(datos.docentes.find((d) => d.id !== seleccionado.id)?.id ?? null);
      await recargarCon('Docente eliminado.');
    } catch (e) {
      setError(e?.response?.status === 409
        ? 'No se puede eliminar: el docente tiene asignaturas, horarios u otros registros asociados. Puede desactivarlo.'
        : mensajeError(e, 'No se pudo eliminar el docente.'));
    } finally {
      setProcesando(false);
      setConfirmarEliminar(false);
    }
  }

  function limpiarMensajes() {
    setAviso('');
    setError('');
  }

  let panelDerecho;
  if (modo === 'crear') {
    panelDerecho = <DocenteForm onGuardado={alGuardar} onCancel={() => setModo('ver')} />;
  } else if (modo === 'editar' && seleccionado) {
    panelDerecho = <DocenteForm docente={seleccionado} onGuardado={alGuardar} onCancel={() => setModo('ver')} />;
  } else if (seleccionado) {
    panelDerecho = (
      <DocentePerfil
        key={seleccionado.id}
        docente={seleccionado}
        ciclo={datos.ciclo}
        secciones={secciones}
        asignaturas={datos.asignaturas}
        asignacionesCiclo={datos.asignaciones}
        procesando={procesando}
        onEditar={() => { limpiarMensajes(); setModo('editar'); }}
        onCambiarEstado={cambiarEstado}
        onEliminar={() => setConfirmarEliminar(true)}
        onCambio={recargarCon}
      />
    );
  } else {
    panelDerecho = (
      <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-base">
          <GraduationCap size={28} className="text-gray-600" />
        </div>
        <p className="font-display text-base font-bold text-white">Selecciona un docente</p>
        <p className="mt-1 text-sm text-gray-500">o crea uno nuevo para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Alerta tipo="exito">{aviso}</Alerta>
      <Alerta>{error}</Alerta>

      <div className="flex flex-col gap-4 lg:h-[calc(100vh-11rem)] lg:flex-row">
        <div className="flex max-h-[70vh] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-card lg:max-h-none lg:w-[360px]">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-4 py-4">
            <div>
              <p className="font-display text-sm font-bold text-white">Docentes</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{`${activos} activos · ${datos.docentes.length - activos} inactivos`}</p>
            </div>
            <button
              type="button"
              onClick={() => { limpiarMensajes(); setModo('crear'); }}
              className="bg-brand-gradient flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 font-display text-xs
                font-semibold text-white"
            >
              <Plus size={13} />Nuevo
            </button>
          </div>

          <div className="flex-shrink-0 border-b border-line px-3 py-3">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-base px-3 py-2">
              <Search size={12} className="flex-shrink-0 text-gray-500" />
              <label htmlFor="buscar-docente" className="sr-only">Buscar docente</label>
              <input
                id="buscar-docente"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                placeholder="Buscar por nombre o DUI..."
                className="w-full bg-transparent text-xs text-white placeholder-gray-600 outline-none"
              />
              {buscar && (
                <button type="button" aria-label="Limpiar búsqueda" onClick={() => setBuscar('')}>
                  <X size={11} className="text-gray-500" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 border-b border-line px-3 py-2">
            <label htmlFor="filtro-estado-docente" className="sr-only">Estado</label>
            <select
              id="filtro-estado-docente"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="flex-1 bg-transparent text-[11px] text-gray-400 outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
            <label htmlFor="filtro-materia-docente" className="sr-only">Materia</label>
            <select
              id="filtro-materia-docente"
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              className="flex-1 bg-transparent text-[11px] text-gray-400 outline-none"
            >
              <option value="">Todas las materias</option>
              {opcionesMateria.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {hayFiltros && (
              <button
                type="button"
                aria-label="Limpiar filtros"
                onClick={() => { setBuscar(''); setFiltroEstado(''); setFiltroMateria(''); }}
                className="flex-shrink-0 rounded p-1 text-gray-600 transition-colors hover:text-gray-400"
              >
                <RotateCcw size={11} />
              </button>
            )}
          </div>

          <div className="flex-1 divide-y divide-line overflow-y-auto">
            {filtrados.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <AlertCircle size={28} className="mb-3 text-gray-700" />
                <p className="text-sm text-gray-500">Sin resultados</p>
              </div>
            )}
            {filtrados.map((d) => (
              <ItemDocente
                key={d.id}
                docente={d}
                seleccionado={d.id === idSeleccionado && modo !== 'crear'}
                onSeleccionar={() => { limpiarMensajes(); setIdSeleccionado(d.id); setModo('ver'); }}
              />
            ))}
          </div>
        </div>

        <div className="min-h-[60vh] flex-1 overflow-hidden rounded-2xl border border-line bg-card lg:min-h-0">
          {panelDerecho}
        </div>
      </div>

      {confirmarEliminar && seleccionado && (
        <ConfirmDialog
          titulo="Eliminar docente"
          mensaje={`¿Desea eliminar a ${nombreCompleto(seleccionado)}? Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          procesando={procesando}
          onConfirm={eliminar}
          onCancel={() => setConfirmarEliminar(false)}
        />
      )}
    </div>
  );
}
