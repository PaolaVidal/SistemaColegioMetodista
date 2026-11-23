import { useEffect, useState } from 'react';
import {
  AlertCircle, BarChart2, ChevronRight, Filter, LoaderCircle,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Cargando from '../../../components/ui/Cargando';
import { mensajeError } from '../../../services/api';
import { obtenerCicloActivo, obtenerSeccionesConGrado } from '../../../services/catalogos';
import { obtenerTodos } from '../../../services/recursos';
import descargarCsv from '../../../utils/exportar';
import REPORTES from './definiciones';
import VistaReporte from './VistaReporte';

async function cargarCatalogo() {
  const [{ ciclos, activo }, { secciones }, asignaturas, cuentas, matriculas, estudiantes] = await Promise.all([
    obtenerCicloActivo(),
    obtenerSeccionesConGrado(),
    obtenerTodos('asignaturas'),
    obtenerTodos('cuentas-por-cobrar'),
    obtenerTodos('matriculas'),
    obtenerTodos('estudiantes'),
  ]);
  const seccionPorId = Object.fromEntries(secciones.map((s) => [s.id, s]));
  const estudiantePorId = Object.fromEntries(estudiantes.map((e) => [e.id, e]));
  return {
    matriculas: matriculas.filter((m) => estudiantePorId[m.id_estudiante]).map((m) => ({
      idCiclo: m.id_ciclo,
      idGrado: seccionPorId[m.id_seccion]?.id_grado,
      seccion: seccionPorId[m.id_seccion]?.nombre?.trim(),
      estudiante: estudiantePorId[m.id_estudiante],
    })),
    ciclos,
    cicloActivo: activo,
    grados: [...new Map(secciones.map((s) => [s.id_grado, s.grado])).entries()].sort((a, b) => a[0] - b[0]),
    nombresSeccion: [...new Set(secciones.map((s) => s.nombre.trim()))].sort(),
    asignaturas: asignaturas.map((a) => a.nombre).sort(),
    conceptos: [...new Set(cuentas.map((c) => c.concepto))].sort(),
  };
}

// Cambia un filtro y vacía los que dependen de él (p. ej. el estudiante al cambiar de sección).
function cambiarFiltro(definicion, filtros, id, valor) {
  const dependientes = definicion.filtros.filter((f) => f.dependeDe?.includes(id)).map((f) => [f.id, '']);
  return { ...filtros, [id]: valor, ...Object.fromEntries(dependientes) };
}

function ahora() {
  return new Date().toLocaleString('es-SV', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function GrupoCatalogo({
  titulo, reportes, seleccionado, onSeleccionar,
}) {
  return (
    <div>
      <p className="mb-2 px-2 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">{titulo}</p>
      <div className="space-y-1">
        {reportes.map((r) => {
          const activo = seleccionado === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSeleccionar(r)}
              aria-current={activo ? 'true' : undefined}
              className="flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all"
              style={{ background: activo ? `${r.color}15` : 'transparent', borderColor: activo ? `${r.color}40` : 'transparent' }}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `${r.color}18` }}>
                <r.icono size={15} style={{ color: r.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs leading-tight font-semibold" style={{ color: activo ? r.color : '#D1D5DB' }}>{r.etiqueta}</p>
                <p className="mt-0.5 truncate text-[10px] text-gray-600">{r.descripcion}</p>
              </div>
              {activo && <ChevronRight size={12} style={{ color: r.color }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Reportes() {
  const [catalogo, setCatalogo] = useState(null);
  const [error, setError] = useState('');
  const [definicion, setDefinicion] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [estado, setEstado] = useState('inicio'); // inicio | configurando | generando | vista
  const [resultado, setResultado] = useState(null);
  const [generado, setGenerado] = useState('');

  useEffect(() => {
    let vigente = true;
    cargarCatalogo()
      .then((c) => { if (vigente) setCatalogo(c); })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudo cargar el catálogo de reportes.')); });
    return () => { vigente = false; };
  }, []);

  if (!catalogo) return error ? <Alerta>{error}</Alerta> : <Cargando texto="Cargando reportes..." />;

  function seleccionar(def) {
    setDefinicion(def);
    setFiltros(Object.fromEntries(def.filtros.map((f) => [f.id, f.inicial ? f.inicial(catalogo) : ''])));
    setResultado(null);
    setError('');
    setEstado('configurando');
  }

  const faltantes = definicion?.filtros.filter((f) => f.requerido && !filtros[f.id]) || [];

  async function generar() {
    setError('');
    setEstado('generando');
    try {
      setResultado(await definicion.generar(filtros));
      setGenerado(ahora());
      setEstado('vista');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo generar el reporte.'));
      setEstado('configurando');
    }
  }

  function textoFiltros() {
    return definicion.filtros
      .filter((f) => filtros[f.id])
      .map((f) => {
        const opcion = f.opciones?.(catalogo, filtros).find(([valor]) => valor === filtros[f.id]);
        return `${f.etiqueta}: ${opcion ? opcion[1] : filtros[f.id]}`;
      })
      .join(' · ');
  }

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100vh-11rem)] lg:flex-row">
      <div className="no-imprimir flex flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-card lg:w-80">
        <div className="flex-shrink-0 border-b border-line px-5 py-4">
          <p className="font-display text-sm font-bold text-white">Centro de reportes</p>
          <p className="mt-0.5 text-[11px] text-gray-500">Selecciona un tipo de reporte</p>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
          <GrupoCatalogo
            titulo="Académicos"
            reportes={REPORTES.filter((r) => r.categoria === 'academico')}
            seleccionado={definicion?.id}
            onSeleccionar={seleccionar}
          />
          <GrupoCatalogo
            titulo="Administrativos"
            reportes={REPORTES.filter((r) => r.categoria === 'administrativo')}
            seleccionado={definicion?.id}
            onSeleccionar={seleccionar}
          />
        </div>
      </div>

      <div className="flex min-h-[60vh] flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-card lg:min-h-0">
        {estado === 'inicio' && (
          <div className="flex flex-1 flex-col items-center justify-center px-12 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-base"><BarChart2 size={28} className="text-gray-600" /></div>
            <p className="mb-2 font-display text-lg font-bold text-white">Selecciona un reporte</p>
            <p className="max-w-xs text-sm text-gray-500">Elige un tipo de reporte en el panel izquierdo para configurarlo y generarlo con los datos actuales.</p>
          </div>
        )}

        {estado === 'configurando' && definicion && (
          <div className="flex h-full flex-col">
            <div className="flex flex-shrink-0 items-center gap-3 border-b border-line px-7 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${definicion.color}18` }}>
                <definicion.icono size={18} style={{ color: definicion.color }} />
              </div>
              <div>
                <p className="font-display text-base font-bold text-white">{`Reporte: ${definicion.etiqueta}`}</p>
                <p className="mt-0.5 text-xs text-gray-500">{definicion.descripcion}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-7 py-6">
              <Alerta>{error}</Alerta>
              <div className="mb-5 flex items-center gap-2">
                <Filter size={13} className="text-gray-500" />
                <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Filtros del reporte</p>
              </div>
              <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
                {definicion.filtros.map((f) => (
                  <div key={f.id}>
                    <label htmlFor={`rep-${f.id}`} className="mb-1.5 block text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                      {`${f.etiqueta}${f.requerido ? ' *' : ''}`}
                    </label>
                    {f.tipo === 'fecha' ? (
                      <input
                        id={`rep-${f.id}`}
                        type="date"
                        className="input-field py-2.5 text-sm"
                        value={filtros[f.id] || ''}
                        onChange={(e) => setFiltros({ ...filtros, [f.id]: e.target.value })}
                      />
                    ) : (
                      <select
                        id={`rep-${f.id}`}
                        className="input-field py-2.5 text-sm"
                        value={filtros[f.id] || ''}
                        onChange={(e) => setFiltros(cambiarFiltro(definicion, filtros, f.id, e.target.value))}
                      >
                        <option value="">{f.vacio || (f.requerido ? 'Seleccionar...' : 'Todos')}</option>
                        {f.opciones(catalogo, filtros).map(([valor, texto]) => (
                          <option key={valor} value={valor}>{texto}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex max-w-2xl items-start gap-3 rounded-xl border border-line bg-base p-4">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-gray-600" />
                <p className="text-[11px] leading-relaxed text-gray-500">
                  El reporte se genera con los datos actuales del sistema.
                  Los filtros vacíos incluyen todos los registros.
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-line px-7 py-4">
              {faltantes.length > 0 && <span className="text-[11px] text-[#F59E0B]">{`Seleccione: ${faltantes.map((f) => f.etiqueta).join(', ')}`}</span>}
              <button
                type="button"
                onClick={generar}
                disabled={faltantes.length > 0}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 font-display text-sm font-semibold text-white transition-all hover:opacity-90
                  disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: `linear-gradient(135deg,${definicion.color},#8e2440)` }}
              >
                <BarChart2 size={14} />Generar reporte
              </button>
            </div>
          </div>
        )}

        {estado === 'generando' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <LoaderCircle size={36} className="animate-spin" style={{ color: definicion.color }} />
            <p className="font-display font-semibold text-white">Generando reporte...</p>
            <p className="text-xs text-gray-500">Procesando datos del sistema</p>
          </div>
        )}

        {estado === 'vista' && resultado && (
          <VistaReporte
            definicion={definicion}
            resultado={resultado}
            filtrosTexto={textoFiltros()}
            generado={generado}
            onNuevo={() => setEstado('configurando')}
            onCsv={() => descargarCsv(`reporte-${definicion.id}-${new Date().toISOString().slice(0, 10)}.csv`, resultado.columnas, resultado.filas)}
          />
        )}
      </div>
    </div>
  );
}
