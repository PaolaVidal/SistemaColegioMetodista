import { useEffect, useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, AlertTriangle, Award, BookOpen, Calendar, Eye, Filter, GraduationCap, Layers, Minus, RotateCcw, Star,
  TrendingDown, TrendingUp,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Buscador from '../../../components/ui/Buscador';
import Cargando from '../../../components/ui/Cargando';
import Paginacion, { paginar } from '../../../components/ui/Paginacion';
import Pill from '../../../components/ui/Pill';
import SelectFiltro from '../../../components/ui/SelectFiltro';
import { mensajeError } from '../../../services/api';
import cargarCalificaciones from '../../../services/calificaciones';
import { iniciales, nombreCiclo, nombreCompleto } from '../../../utils/formato';
import {
  NIVELES_NOTA, NOTA_MINIMA, PERIODOS, colorNota, formatoNota, nivelNota, promedio,
} from '../../../utils/notas';
import HistorialNotasDrawer from './HistorialNotasDrawer';

const FILAS = 12;
const EJE = { fill: '#8b7a80', fontSize: 10 };
const ICONO_NIVEL = {
  excelente: Award, 'muy-bueno': TrendingUp, bueno: Minus, riesgo: TrendingDown,
};

function filtrosIniciales(cicloActivo) {
  return {
    buscar: '',
    ciclo: cicloActivo ? String(cicloActivo.id) : '',
    grado: '',
    seccion: '',
    asignatura: '',
    periodo: '',
    bajoRendimiento: false,
  };
}

function TooltipNota({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-base px-3 py-2 text-xs text-white">
      <p className="mb-1 font-semibold">{payload[0].payload.nombre || label}</p>
      <p style={{ color: colorNota(payload[0].value) }}>{`Promedio: ${formatoNota(payload[0].value)}`}</p>
    </div>
  );
}

function promedioPor(registros, clave) {
  const grupos = registros.reduce((acc, r) => ({ ...acc, [r[clave]]: [...(acc[r[clave]] || []), r.nota] }), {});
  return Object.entries(grupos).map(([nombre, notas]) => ({ nombre, promedio: promedio(notas) }));
}

export default function Calificaciones() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [idEstudianteDrawer, setIdEstudianteDrawer] = useState(null);

  useEffect(() => {
    let vigente = true;
    cargarCalificaciones()
      .then((resultado) => {
        if (!vigente) return;
        setDatos(resultado);
        setFiltros(filtrosIniciales(resultado.cicloActivo));
      })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudieron cargar las calificaciones.')); });
    return () => { vigente = false; };
  }, []);

  const delCiclo = useMemo(() => (datos && filtros
    ? datos.registros.filter((r) => !filtros.ciclo || String(r.idCiclo) === filtros.ciclo) : []), [datos, filtros]);

  const promediosCiclo = useMemo(() => (datos && filtros
    ? datos.promedios.filter((p) => !filtros.ciclo || String(p.idCiclo) === filtros.ciclo) : []), [datos, filtros]);

  const bajoRendimiento = useMemo(() => {
    const porEstudiante = promediosCiclo
      .filter((p) => p.promedio !== null && p.promedio < NOTA_MINIMA && p.estudiante)
      .reduce((acc, p) => ({ ...acc, [p.estudiante.id]: [...(acc[p.estudiante.id] || []), p] }), {});
    return Object.values(porEstudiante)
      .map((lista) => ({ ...lista[0], materias: lista.length, minimo: Math.min(...lista.map((p) => p.promedio)) }))
      .sort((a, b) => a.minimo - b.minimo);
  }, [promediosCiclo]);

  const filtrados = useMemo(() => {
    if (!filtros) return [];
    const termino = filtros.buscar.trim().toLowerCase();
    const idsBajo = new Set(bajoRendimiento.map((b) => b.estudiante.id));
    return delCiclo
      .filter((r) => !termino || nombreCompleto(r.estudiante).toLowerCase().includes(termino)
        || r.estudiante?.codigo_nie.includes(termino))
      .filter((r) => !filtros.grado || String(r.idGrado) === filtros.grado)
      .filter((r) => !filtros.seccion || r.seccion === filtros.seccion)
      .filter((r) => !filtros.asignatura || r.asignatura === filtros.asignatura)
      .filter((r) => !filtros.periodo || String(r.periodo) === filtros.periodo)
      .filter((r) => !filtros.bajoRendimiento || idsBajo.has(r.estudiante?.id))
      .sort((a, b) => a.idGrado - b.idGrado || a.seccion.localeCompare(b.seccion)
        || nombreCompleto(a.estudiante).localeCompare(nombreCompleto(b.estudiante)) || a.periodo - b.periodo);
  }, [delCiclo, filtros, bajoRendimiento]);

  const graficos = useMemo(() => ({
    asignaturas: promedioPor(filtrados, 'asignatura').sort((a, b) => b.promedio - a.promedio),
    grados: promedioPor(filtrados, 'idGrado')
      .map((g) => ({
        ...g, nombre: filtrados.find((r) => String(r.idGrado) === g.nombre)?.grado, orden: Number(g.nombre),
      }))
      .sort((a, b) => a.orden - b.orden),
  }), [filtrados]);

  if (error && !datos) return <Alerta>{error}</Alerta>;
  if (!datos || !filtros) return <Cargando texto="Cargando calificaciones..." />;

  const { pagina: paginaActual, totalPaginas, filas } = paginar(filtrados, pagina, FILAS);
  const general = promedio(filtrados.map((r) => r.nota));
  const grados = [...new Map(datos.secciones.map((s) => [s.id_grado, s.grado])).entries()].sort((a, b) => a[0] - b[0]);
  const nombresSeccion = [...new Set(datos.secciones.map((s) => s.nombre.trim()))].sort();
  const hayFiltros = JSON.stringify(filtros) !== JSON.stringify(filtrosIniciales(datos.cicloActivo));
  const idsBajo = new Set(bajoRendimiento.map((b) => b.estudiante.id));

  function cambiarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
    setPagina(1);
  }

  const kpis = [
    {
      etiqueta: 'Promedio general', valor: formatoNota(general), color: colorNota(general), icono: Star,
    },
    {
      etiqueta: 'Total registros', valor: filtrados.length.toLocaleString('es-SV'), color: '#9CA3AF', icono: Activity,
    },
    ...NIVELES_NOTA.map((n) => ({
      etiqueta: `${n.etiqueta} (${n.rango})`,
      valor: filtrados.filter((r) => nivelNota(r.nota).clave === n.clave).length,
      color: n.color,
      icono: ICONO_NIVEL[n.clave],
    })),
  ];

  const promediosDrawer = promediosCiclo.filter((p) => p.estudiante?.id === idEstudianteDrawer && p.promedio !== null);
  const registrosDrawer = delCiclo.filter((r) => r.estudiante?.id === idEstudianteDrawer);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.etiqueta} className="flex items-center gap-3 rounded-xl border border-line bg-card p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${k.color}20` }}>
              <k.icono size={17} style={{ color: k.color }} />
            </div>
            <div>
              <p className="font-display text-2xl leading-none font-bold" style={{ color: k.color }}>{k.valor}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-gray-400">{k.etiqueta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="rounded-xl border border-line bg-card p-5 xl:col-span-2">
          <p className="mb-4 font-display text-sm font-semibold text-white">Promedio por asignatura</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={graficos.asignaturas} barSize={16} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#3d262d" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={EJE} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nombre" tick={{ ...EJE, fill: '#c4b5b9' }} axisLine={false} tickLine={false} width={110} />
              <ReferenceLine x={NOTA_MINIMA} stroke="#EF4444" strokeDasharray="3 2" />
              <Tooltip content={<TooltipNota />} cursor={{ fill: '#3d262d80' }} />
              <Bar dataKey="promedio" radius={[0, 4, 4, 0]}>
                {graficos.asignaturas.map((d) => <Cell key={d.nombre} fill={colorNota(d.promedio)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-line bg-card p-5">
          <p className="mb-4 font-display text-sm font-semibold text-white">Promedio por grado</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={graficos.grados} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3d262d" vertical={false} />
              <XAxis dataKey="nombre" tick={EJE} axisLine={false} tickLine={false} tickFormatter={(v) => String(v).slice(0, 3)} />
              <YAxis domain={[0, 10]} tick={EJE} axisLine={false} tickLine={false} width={24} />
              <ReferenceLine y={NOTA_MINIMA} stroke="#EF4444" strokeDasharray="3 2" />
              <Tooltip content={<TooltipNota />} cursor={{ fill: '#3d262d80' }} />
              <Bar dataKey="promedio" radius={[4, 4, 0, 0]}>
                {graficos.grados.map((d) => <Cell key={d.nombre} fill={colorNota(d.promedio)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-[#EF4444]" />
              <p className="font-display text-xs font-semibold text-white">Bajo rendimiento</p>
            </div>
            <span className="rounded-full bg-[#EF444420] px-2 py-0.5 text-xs font-semibold text-[#EF4444]">{bajoRendimiento.length}</span>
          </div>
          <div className="max-h-52 divide-y divide-line overflow-y-auto">
            {bajoRendimiento.map((b) => (
              <button
                key={b.estudiante.id}
                type="button"
                onClick={() => setIdEstudianteDrawer(b.estudiante.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-line/50"
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#EF444430]">
                  <TrendingDown size={11} className="text-[#EF4444]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xs font-semibold text-white">{nombreCompleto(b.estudiante)}</p>
                  <p className="text-[10px] text-gray-500">{`${b.grado} — Sec. ${b.seccion} · ${b.materias} en riesgo`}</p>
                </div>
                <span className="font-display text-sm font-bold text-[#EF4444]">{formatoNota(b.minimo)}</span>
              </button>
            ))}
            {bajoRendimiento.length === 0 && <p className="px-4 py-6 text-center text-xs text-gray-600">Sin estudiantes en riesgo</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Buscador
            id="buscar-calificacion"
            etiqueta="Buscar estudiante"
            placeholder="Buscar estudiante..."
            valor={filtros.buscar}
            onChange={(v) => cambiarFiltro('buscar', v)}
          />
          <SelectFiltro id="cal-ciclo" etiqueta="Ciclo" icono={Calendar} valor={filtros.ciclo} onChange={(v) => cambiarFiltro('ciclo', v)}>
            {datos.ciclos.map((c) => <option key={c.id} value={c.id}>{nombreCiclo(c)}</option>)}
          </SelectFiltro>
          <SelectFiltro id="cal-grado" etiqueta="Grado" icono={GraduationCap} valor={filtros.grado} onChange={(v) => cambiarFiltro('grado', v)}>
            {grados.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
          </SelectFiltro>
          <SelectFiltro id="cal-seccion" etiqueta="Sección" icono={Layers} valor={filtros.seccion} onChange={(v) => cambiarFiltro('seccion', v)}>
            {nombresSeccion.map((s) => <option key={s} value={s}>{`Sección ${s}`}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="cal-asignatura"
            etiqueta="Asignatura"
            icono={BookOpen}
            valor={filtros.asignatura}
            onChange={(v) => cambiarFiltro('asignatura', v)}
          >
            {datos.asignaturas.map((a) => <option key={a} value={a}>{a}</option>)}
          </SelectFiltro>
          <SelectFiltro id="cal-periodo" etiqueta="Período" icono={Filter} valor={filtros.periodo} onChange={(v) => cambiarFiltro('periodo', v)}>
            {Object.entries(PERIODOS).map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}
          </SelectFiltro>
          <button
            type="button"
            aria-pressed={filtros.bajoRendimiento}
            onClick={() => cambiarFiltro('bajoRendimiento', !filtros.bajoRendimiento)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 font-display text-xs font-medium transition-all
              ${filtros.bajoRendimiento ? 'border-[#EF4444] bg-[#EF444415] text-[#EF4444]' : 'border-line bg-base text-gray-500'}`}
          >
            <AlertTriangle size={12} />Bajo rendimiento
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
                {['Estudiante', 'Grado / Sección', 'Asignatura', 'Evaluación', 'Docente', 'Período', 'Nota', 'Prom. período', 'Nivel', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-14 text-center">
                    <Star size={36} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-sm text-gray-500">No se encontraron calificaciones</p>
                  </td>
                </tr>
              )}
              {filas.map((r, i) => {
                const nivel = nivelNota(r.nota);
                return (
                  <tr key={r.id} className="group border-b border-line transition-colors hover:bg-line/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white
                              ${i % 2 === 0 ? 'bg-brand-dark' : 'bg-brand'}`}
                          >
                            {iniciales(r.estudiante?.nombres, r.estudiante?.apellidos)}
                          </div>
                          {idsBajo.has(r.estudiante?.id) && (
                            <span
                              title="Bajo rendimiento"
                              className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border border-card bg-[#EF4444]"
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
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className="whitespace-nowrap text-gray-300">{r.grado}</span>
                        <span className="bg-brand-gradient flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white">{r.seccion}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-200">{r.asignatura}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{`${r.evaluacion} (${r.ponderacion}%)`}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{r.docente}</td>
                    <td className="px-4 py-3"><span className="rounded bg-line px-2 py-0.5 text-[11px] text-gray-400">{`T${r.periodo}`}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold" style={{ color: nivel.color }}>{formatoNota(r.nota)}</span>
                        <div className="h-1.5 w-12 rounded-full bg-line">
                          <div className="h-1.5 rounded-full" style={{ width: `${r.nota * 10}%`, background: nivel.color }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-display text-sm font-bold" style={{ color: colorNota(r.promedioPeriodo) }}>
                      {formatoNota(r.promedioPeriodo)}
                    </td>
                    <td className="px-4 py-3"><Pill color={nivel.color}>{nivel.etiqueta}</Pill></td>
                    <td className="px-4 py-3">
                      {r.estudiante && (
                        <button
                          type="button"
                          onClick={() => setIdEstudianteDrawer(r.estudiante.id)}
                          title="Ver boleta del estudiante"
                          aria-label={`Ver boleta de ${nombreCompleto(r.estudiante)}`}
                          className="rounded-lg p-1.5 text-gray-500 opacity-70 transition-all group-hover:opacity-100 hover:bg-brand/10 hover:text-brand-soft"
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

      <div className="flex flex-wrap items-center gap-3 text-[11px]">
        <span className="font-medium text-gray-400">Escala:</span>
        {NIVELES_NOTA.map((n) => (
          <span key={n.clave} className="flex items-center gap-1" style={{ color: n.color }}>
            <span className="h-2 w-2 rounded-full" style={{ background: n.color }} />{`${n.etiqueta} ${n.rango}`}
          </span>
        ))}
        <span className="ml-auto text-gray-600">Los docentes registran las notas; esta vista es de consulta y supervisión.</span>
      </div>

      {idEstudianteDrawer && registrosDrawer.length > 0 && (
        <HistorialNotasDrawer
          estudiante={registrosDrawer[0].estudiante}
          promedios={promediosDrawer}
          registros={registrosDrawer}
          onClose={() => setIdEstudianteDrawer(null)}
        />
      )}
    </div>
  );
}
