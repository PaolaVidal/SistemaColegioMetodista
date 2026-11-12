import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, ChevronRight, Mail, Plus, RotateCcw, Search, X,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Cargando from '../../../components/ui/Cargando';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Pill from '../../../components/ui/Pill';
import { mensajeError } from '../../../services/api';
import { cargarComunicados, eliminarAnuncio } from '../../../services/comunicados';
import useAuthStore from '../../../store/authStore';
import { fechaCorta } from '../../../utils/formato';
import { DetalleAnuncio, ESTADOS_ANUNCIO, FormularioAnuncio } from './AnuncioPanel';
import NotificacionesTabla from './NotificacionesTabla';

function resumen(texto, maximo = 90) {
  return texto.length > maximo ? `${texto.slice(0, maximo).trimEnd()}…` : texto;
}

export default function Comunicados() {
  const usuario = useAuthStore((s) => s.usuario);
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [pestana, setPestana] = useState('anuncios');
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [modo, setModo] = useState('ver'); // 'ver' | 'editar' | 'crear'
  const [plantilla, setPlantilla] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [confirmar, setConfirmar] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const resultado = await cargarComunicados();
      setDatos(resultado);
      setIdSeleccionado((actual) => actual ?? resultado.anuncios[0]?.id ?? null);
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los comunicados.'));
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

  const filtrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase();
    return (datos?.anuncios || [])
      .filter((a) => !termino || a.titulo.toLowerCase().includes(termino)
        || a.contenido.toLowerCase().includes(termino))
      .filter((a) => !filtroEstado || a.estado === filtroEstado);
  }, [datos, buscar, filtroEstado]);

  if (!datos) return error ? <Alerta>{error}</Alerta> : <Cargando texto="Cargando comunicados..." />;

  const seleccionado = datos.anuncios.find((a) => a.id === idSeleccionado) || null;
  const contar = (estado) => datos.anuncios.filter((a) => a.estado === estado).length;

  async function alGuardar(id, mensaje) {
    setIdSeleccionado(id);
    setModo('ver');
    setPlantilla(null);
    setAviso(mensaje);
    await cargar();
  }

  async function eliminar() {
    setProcesando(true);
    try {
      await eliminarAnuncio(seleccionado.id);
      setIdSeleccionado(datos.anuncios.find((a) => a.id !== seleccionado.id)?.id ?? null);
      setAviso('Comunicado eliminado.');
      await cargar();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo eliminar el comunicado.'));
    } finally {
      setProcesando(false);
      setConfirmar(false);
    }
  }

  let panel;
  if (modo === 'crear' || (modo === 'editar' && seleccionado)) {
    panel = (
      <FormularioAnuncio
        key={`${modo}-${seleccionado?.id}`}
        anuncio={modo === 'editar' ? seleccionado : plantilla}
        idAutor={usuario?.id}
        onGuardado={alGuardar}
        onCancel={() => { setModo('ver'); setPlantilla(null); }}
      />
    );
  } else if (seleccionado) {
    panel = (
      <DetalleAnuncio
        anuncio={seleccionado}
        onEditar={() => { setAviso(''); setModo('editar'); }}
        onDuplicar={() => {
          setPlantilla({ titulo: `Copia de ${seleccionado.titulo}`.slice(0, 150), contenido: seleccionado.contenido });
          setModo('crear');
        }}
        onEliminar={() => setConfirmar(true)}
      />
    );
  } else {
    panel = (
      <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-base"><Bell size={28} className="text-gray-600" /></div>
        <p className="font-display text-base font-bold text-white">Sin selección</p>
        <p className="mt-1 text-sm text-gray-500">Selecciona un comunicado o crea uno nuevo</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex w-fit items-center gap-1 rounded-xl border border-line bg-panel p-1" role="tablist">
        {[['anuncios', 'Comunicados', Bell], ['notificaciones', 'Notificaciones automáticas', Mail]].map(([id, texto, Icono]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={pestana === id}
            onClick={() => setPestana(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold transition-all
              ${pestana === id ? 'bg-brand text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icono size={13} />{texto}
          </button>
        ))}
      </div>

      <Alerta tipo="exito">{aviso}</Alerta>
      <Alerta>{error}</Alerta>

      {pestana === 'notificaciones' && <NotificacionesTabla notificaciones={datos.notificaciones} />}

      {pestana === 'anuncios' && (
        <div className="flex flex-col gap-4 lg:h-[calc(100vh-13rem)] lg:flex-row">
          <div className="flex max-h-[70vh] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-card lg:max-h-none lg:w-[380px]">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-4 py-4">
              <div>
                <p className="font-display text-sm font-bold text-white">Comunicados</p>
                <p className="mt-0.5 text-[10px] text-gray-500">{`${contar('publicado')} publicados · ${contar('programado')} programados`}</p>
              </div>
              <button
                type="button"
                onClick={() => { setAviso(''); setPlantilla(null); setModo('crear'); }}
                className="bg-brand-gradient flex items-center gap-1.5 rounded-lg px-3 py-2 font-display text-xs font-semibold text-white"
              >
                <Plus size={13} />Nuevo
              </button>
            </div>
            <div className="flex-shrink-0 border-b border-line px-3 py-3">
              <div className="flex items-center gap-2 rounded-lg border border-line bg-base px-3 py-2">
                <Search size={12} className="flex-shrink-0 text-gray-500" />
                <label htmlFor="buscar-anuncio" className="sr-only">Buscar comunicado</label>
                <input
                  id="buscar-anuncio"
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                  placeholder="Buscar comunicado..."
                  className="w-full bg-transparent text-xs text-white placeholder-gray-600 outline-none"
                />
                {buscar && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setBuscar('')}><X size={11} className="text-gray-500" /></button>}
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 border-b border-line px-3 py-2">
              <label htmlFor="filtro-estado-anuncio" className="sr-only">Estado</label>
              <select
                id="filtro-estado-anuncio"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="flex-1 bg-transparent text-[11px] text-gray-400 outline-none"
              >
                <option value="">Todos los estados</option>
                {Object.entries(ESTADOS_ANUNCIO).map(([clave, e]) => (
                  <option key={clave} value={clave}>{e.etiqueta}</option>
                ))}
              </select>
              {(buscar || filtroEstado) && (
                <button
                  type="button"
                  aria-label="Limpiar filtros"
                  onClick={() => { setBuscar(''); setFiltroEstado(''); }}
                  className="rounded p-1 text-gray-600 hover:text-gray-400"
                >
                  <RotateCcw size={11} />
                </button>
              )}
            </div>
            <div className="flex-1 divide-y divide-line overflow-y-auto">
              {filtrados.length === 0 && <p className="px-6 py-14 text-center text-sm text-gray-500">Sin comunicados</p>}
              {filtrados.map((a) => {
                const activo = a.id === idSeleccionado && modo !== 'crear';
                const estado = ESTADOS_ANUNCIO[a.estado];
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => { setAviso(''); setIdSeleccionado(a.id); setModo('ver'); }}
                    className="relative w-full border-l-[3px] px-4 py-3.5 text-left transition-all"
                    style={{ background: activo ? 'var(--color-base)' : 'transparent', borderLeftColor: activo ? '#c2416b' : estado.color }}
                  >
                    <div className="mb-1.5 flex items-start gap-2">
                      <p className="min-w-0 flex-1 truncate font-display text-xs font-bold text-white">{a.titulo}</p>
                      <Pill color={estado.color}>{estado.etiqueta}</Pill>
                    </div>
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-gray-500">{resumen(a.contenido)}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-gray-600">
                      <span>{a.autor}</span>
                      <span>{fechaCorta(a.fecha_publicacion)}</span>
                    </div>
                    {activo && <ChevronRight size={12} className="absolute top-1/2 right-3 -translate-y-1/2 text-brand-soft" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="min-h-[60vh] flex-1 overflow-hidden rounded-2xl border border-line bg-card lg:min-h-0">{panel}</div>
        </div>
      )}

      {confirmar && seleccionado && (
        <ConfirmDialog
          titulo="Eliminar comunicado"
          mensaje={`¿Eliminar "${seleccionado.titulo}"? Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          procesando={procesando}
          onConfirm={eliminar}
          onCancel={() => setConfirmar(false)}
        />
      )}
    </div>
  );
}
