import { useEffect, useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, AlertTriangle, BookOpen, Calendar, CheckCircle, Clock, Eye, Filter, GraduationCap, Layers, RotateCcw,
  TrendingDown, XCircle,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Buscador from '../../../components/ui/Buscador';
import Cargando from '../../../components/ui/Cargando';
import Paginacion, { paginar } from '../../../components/ui/Paginacion';
import Pill from '../../../components/ui/Pill';
import SelectFiltro from '../../../components/ui/SelectFiltro';
import { mensajeError } from '../../../services/api';
import cargarAsistencias from '../../../services/asistencias';
import { iniciales, nombreCiclo, nombreCompleto } from '../../../utils/formato';
import HistorialAsistenciaDrawer from './HistorialAsistenciaDrawer';
import {
  ESTADOS_ASISTENCIA, MINIMO_AUSENCIAS_RECURRENTES, colorPorcentaje, fechaConDia, porcentajeAsistencia,
} from './estados';

const FILAS = 12;
const EJE = { fill: '#8b7a80', fontSize: 10 };

function filtrosIniciales(cicloActivo) {
  return {
    buscar: '',
    ciclo: cicloActivo ? String(cicloActivo.id) : '',
    fecha: '',
    grado: '',
    seccion: '',
    asignatura: '',
    estado: '',
    recurrentes: false,
  };
}

function TooltipAsistencia({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="space-y-1 rounded-lg border border-line bg-base px-3 py-2 text-xs text-white">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => <p key={p.dataKey} style={{ color: p.fill }}>{`${p.name}: ${p.value}`}</p>)}
    </div>
  );
}

export default function Asistencia() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [idEstudianteDrawer, setIdEstudianteDrawer] = useState(null);

  useEffect(() => {
    let vigente = true;
    cargarAsistencias()
      .then((resultado) => {
        if (!vigente) return;
        setDatos(resultado);
        setFiltros(filtrosIniciales(resultado.cicloActivo));
      })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudo cargar la asistencia.')); });
    return () => { vigente = false; };
  }, []);

  const delCiclo = useMemo(() => {
    if (!datos || !filtros) return [];
    return datos.registros.filter((r) => !filtros.ciclo || String(r.idCiclo) === filtros.ciclo);
  }, [datos, filtros]);

  const ausenciasPorEstudiante = useMemo(() => delCiclo
    .filter((r) => r.estado === 'Ausente' && r.estudiante)
    .reduce((acc, r) => ({ ...acc, [r.estudiante.id]: (acc[r.estudiante.id] || 0) + 1 }), {}), [delCiclo]);

  const recurrentes = useMemo(() => Object.entries(ausenciasPorEstudiante)
    .filter(([, total]) => total >= MINIMO_AUSENCIAS_RECURRENTES)
    .map(([id, total]) => ({ id: Number(id), total, registro: delCiclo.find((r) => r.estudiante?.id === Number(id)) }))
    .sort((a, b) => b.total - a.total), [ausenciasPorEstudiante, delCiclo]);

  const filtrados = useMemo(() => {
    if (!filtros) return [];
    const termino = filtros.buscar.trim().toLowerCase();
    const idsRecurrentes = new Set(recurrentes.map((r) => r.id));
    return delCiclo
      .filter((r) => !termino || nombreCompleto(r.estudiante).toLowerCase().includes(termino)
        || r.estudiante?.codigo_nie.includes(termino))
      .filter((r) => !filtros.fecha || r.fecha === filtros.fecha)
      .filter((r) => !filtros.grado || String(r.idGrado) === filtros.grado)
      .filter((r) => !filtros.seccion || r.seccion === filtros.seccion)
      .filter((r) => !filtros.asignatura || r.asignatura === filtros.asignatura)
      .filter((r) => !filtros.estado || r.estado === filtros.estado)
      .filter((r) => !filtros.recurrentes || idsRecurrentes.has(r.estudiante?.id))
      .sort((a, b) => b.fecha.localeCompare(a.fecha)
        || nombreCompleto(a.estudiante).localeCompare(nombreCompleto(b.estudiante)));
  }, [delCiclo, filtros, recurrentes]);

  const tendencia = useMemo(() => {
    const dias = [...new Set(filtrados.map((r) => r.fecha))].sort().slice(-10);
    return dias.map((dia) => {
      const delDia = filtrados.filter((r) => r.fecha === dia);
      return {
        dia: fechaConDia(dia),
        Presentes: delDia.filter((r) => r.estado === 'Presente').length,
        Ausentes: delDia.filter((r) => r.estado === 'Ausente').length,
        Tardanzas: delDia.filter((r) => r.estado === 'Tardanza').length,
      };
    });
  }, [filtrados]);

  if (error && !datos) return <Alerta>{error}</Alerta>;
  if (!datos || !filtros) return <Cargando texto="Cargando asistencia..." />;

  const { pagina: paginaActual, totalPaginas, filas } = paginar(filtrados, pagina, FILAS);
  const contar = (estado) => filtrados.filter((r) => r.estado === estado).length;
  const porcentaje = porcentajeAsistencia(filtrados);
  const proporcion = (n) => (filtrados.length ? `${((n / filtrados.length) * 100).toFixed(1)}% del total` : '—');
  const grados = [...new Map(datos.secciones.map((s) => [s.id_grado, s.grado])).entries()].sort((a, b) => a[0] - b[0]);
  const nombresSeccion = [...new Set(datos.secciones.map((s) => s.nombre.trim()))].sort();
  const hayFiltros = JSON.stringify(filtros) !== JSON.stringify(filtrosIniciales(datos.cicloActivo));
  const idsRecurrentes = new Set(recurrentes.map((r) => r.id));

  function cambiarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
    setPagina(1);
  }

  const kpis = [
    {
      etiqueta: 'Asistencias', valor: contar('Presente'), color: '#10B981', icono: CheckCircle, detalle: proporcion(contar('Presente')),
    },
    {
      etiqueta: 'Ausencias', valor: contar('Ausente'), color: '#EF4444', icono: XCircle, detalle: proporcion(contar('Ausente')),
    },
    {
      etiqueta: 'Tardanzas', valor: contar('Tardanza'), color: '#F59E0B', icono: Clock, detalle: proporcion(contar('Tardanza')),
    },
    {
      etiqueta: 'Justificados', valor: contar('Justificado'), color: '#A78BFA', icono: CheckCircle, detalle: proporcion(contar('Justificado')),
    },
    {
      etiqueta: '% Asistencia',
      valor: porcentaje === null ? '—' : `${porcentaje}%`,
      color: colorPorcentaje(porcentaje),
      icono: Activity,
      detalle: 'Meta institucional: 95%',
    },
  ];

  const registrosDrawer = delCiclo.filter((r) => r.estudiante?.id === idEstudianteDrawer);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.etiqueta} className="flex items-center gap-3 rounded-xl border border-line bg-card p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${k.color}20` }}>
              <k.icono size={17} style={{ color: k.color }} />
            </div>
            <div>
              <p className="font-display text-2xl leading-none font-bold" style={{ color: k.color }}>{k.valor}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{k.etiqueta}</p>
              <p className="mt-0.5 text-[10px] text-gray-600">{k.detalle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-line bg-card p-5 xl:col-span-2">
          <p className="mb-4 font-display text-sm font-semibold text-white">Tendencia diaria — últimos 10 días con registros</p>
          {tendencia.length === 0 ? (
            <p className="py-12 text-center text-xs text-gray-500">Sin registros para los filtros seleccionados</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={tendencia} barSize={12} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3d262d" vertical={false} />
                <XAxis dataKey="dia" tick={EJE} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={EJE} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<TooltipAsistencia />} cursor={{ fill: '#3d262d80' }} />
                <Bar dataKey="Presentes" fill="#10B981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Ausentes" fill="#EF4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Tardanzas" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#EF4444]" />
              <p className="font-display text-xs font-semibold text-white">Inasistencias recurrentes</p>
            </div>
            <span className="rounded-full bg-[#EF444420] px-2 py-0.5 text-xs font-semibold text-[#EF4444]">{recurrentes.length}</span>
          </div>
          <div className="max-h-52 divide-y divide-line overflow-y-auto">
            {recurrentes.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setIdEstudianteDrawer(r.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-line/50"
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#EF444430]">
                  <TrendingDown size={12} className="text-[#EF4444]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xs font-semibold text-white">{nombreCompleto(r.registro?.estudiante)}</p>
                  <p className="text-[10px] text-gray-500">{`${r.registro?.grado} — Sec. ${r.registro?.seccion}`}</p>
                </div>
                <span className="flex-shrink-0 text-xs font-bold text-[#EF4444]">{`${r.total} falt.`}</span>
              </button>
            ))}
            {recurrentes.length === 0 && <p className="px-4 py-6 text-center text-xs text-gray-600">Sin inasistencias recurrentes</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Buscador
            id="buscar-asistencia"
            etiqueta="Buscar estudiante"
            placeholder="Buscar estudiante..."
            valor={filtros.buscar}
            onChange={(v) => cambiarFiltro('buscar', v)}
          />
          <SelectFiltro id="filtro-ciclo-asistencia" etiqueta="Ciclo" icono={Calendar} valor={filtros.ciclo} onChange={(v) => cambiarFiltro('ciclo', v)}>
            {datos.ciclos.map((c) => <option key={c.id} value={c.id}>{nombreCiclo(c)}</option>)}
          </SelectFiltro>
          <div className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-line bg-base px-3 py-2">
            <Calendar size={12} className="text-gray-500" />
            <label htmlFor="filtro-fecha-asistencia" className="sr-only">Fecha</label>
            <input
              id="filtro-fecha-asistencia"
              type="date"
              value={filtros.fecha}
              onChange={(e) => cambiarFiltro('fecha', e.target.value)}
              className="cursor-pointer bg-transparent text-xs text-gray-300 outline-none"
            />
          </div>
          <SelectFiltro
            id="filtro-grado-asistencia"
            etiqueta="Grado"
            icono={GraduationCap}
            valor={filtros.grado}
            onChange={(v) => cambiarFiltro('grado', v)}
          >
            {grados.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="filtro-seccion-asistencia"
            etiqueta="Sección"
            icono={Layers}
            valor={filtros.seccion}
            onChange={(v) => cambiarFiltro('seccion', v)}
          >
            {nombresSeccion.map((s) => <option key={s} value={s}>{`Sección ${s}`}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="filtro-asignatura-asistencia"
            etiqueta="Asignatura"
            icono={BookOpen}
            valor={filtros.asignatura}
            onChange={(v) => cambiarFiltro('asignatura', v)}
          >
            {datos.asignaturas.map((a) => <option key={a} value={a}>{a}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="filtro-estado-asistencia"
            etiqueta="Estado"
            icono={Filter}
            valor={filtros.estado}
            onChange={(v) => cambiarFiltro('estado', v)}
          >
            {Object.keys(ESTADOS_ASISTENCIA).map((e) => <option key={e} value={e}>{e}</option>)}
          </SelectFiltro>
          <button
            type="button"
            aria-pressed={filtros.recurrentes}
            onClick={() => cambiarFiltro('recurrentes', !filtros.recurrentes)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 font-display text-xs font-medium transition-all
              ${filtros.recurrentes ? 'border-[#EF4444] bg-[#EF444415] text-[#EF4444]' : 'border-line bg-base text-gray-500'}`}
          >
            <AlertTriangle size={12} />Inasistencias recurrentes
          </button>
          {hayFiltros && (
            <button
              type="button"
              onClick={() => { setFiltros(filtrosIniciales(datos.cicloActivo)); setPagina(1); }}
              className="flex items-center gap-1 px-2 text-xs text-gray-500 transition-colors hover:text-gray-300"
            >
              <RotateCcw size={11} />Limpiar
            </button>
          )}
          <span className="ml-auto text-xs text-gray-500">{`${filtrados.length.toLocaleString('es-SV')} registros`}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-base">
                {['Estudiante', 'Fecha', 'Asignatura', 'Docente', 'Grado / Sección', 'Estado', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <Activity size={36} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-sm text-gray-500">No se encontraron registros</p>
                    <p className="mt-1 text-xs text-gray-600">Ajusta los filtros para ver otros registros</p>
                  </td>
                </tr>
              )}
              {filas.map((r, i) => {
                const { color, icono } = ESTADOS_ASISTENCIA[r.estado];
                return (
                  <tr key={r.id} className="group border-b border-line transition-colors hover:bg-line/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white
                              ${i % 2 === 0 ? 'bg-brand-dark' : 'bg-brand'}`}
                          >
                            {iniciales(r.estudiante?.nombres, r.estudiante?.apellidos)}
                          </div>
                          {idsRecurrentes.has(r.estudiante?.id) && (
                            <span
                              title="Inasistencia recurrente"
                              className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border border-card
                                bg-[#EF4444]"
                            >
                              <AlertTriangle size={7} className="text-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-display font-semibold whitespace-nowrap text-white">{nombreCompleto(r.estudiante)}</p>
                          <p className="font-mono text-[10px] text-gray-600">{r.estudiante?.codigo_nie}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{fechaConDia(r.fecha)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-gray-200">
                        <BookOpen size={11} className="flex-shrink-0 text-brand-soft" />{r.asignatura}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{r.docente}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className="text-gray-300">{r.grado}</span>
                        <span className="bg-brand-gradient flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white">
                          {r.seccion}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3"><Pill color={color} icono={icono}>{r.estado}</Pill></td>
                    <td className="px-4 py-3">
                      {r.estudiante && (
                        <button
                          type="button"
                          onClick={() => setIdEstudianteDrawer(r.estudiante.id)}
                          title="Ver historial del estudiante"
                          aria-label={`Ver historial de ${nombreCompleto(r.estudiante)}`}
                          className="rounded-lg p-1.5 text-gray-500 opacity-70 transition-all group-hover:opacity-100 hover:bg-brand/10
                            hover:text-brand-soft"
                        >
                          <Eye size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Paginacion
          pagina={paginaActual}
          totalPaginas={totalPaginas}
          total={filtrados.length}
          porPagina={FILAS}
          onCambiar={setPagina}
          unidad="registros"
        />
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-gray-600">
        <AlertTriangle size={11} />
        El registro de asistencia es responsabilidad del docente.
        El administrador tiene acceso de solo lectura y supervisión.
      </p>

      {idEstudianteDrawer && registrosDrawer.length > 0 && (
        <HistorialAsistenciaDrawer
          estudiante={registrosDrawer[0].estudiante}
          registros={registrosDrawer}
          onClose={() => setIdEstudianteDrawer(null)}
        />
      )}
    </div>
  );
}
