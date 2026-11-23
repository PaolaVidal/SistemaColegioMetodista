import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, Bell, BookOpen, Briefcase, ClipboardList, Clock, CreditCard, DollarSign, FileText,
  GraduationCap, Megaphone, UserPlus, Users,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Cargando from '../../../components/ui/Cargando';
import SectionTitle from '../../../components/ui/SectionTitle';
import { mensajeError } from '../../../services/api';
import obtenerResumenDashboard from '../../../services/dashboard';
import {
  dinero, fechaCorta, fechaLarga, nombreCiclo, nombreCompleto,
} from '../../../utils/formato';
import COLORES, { COLOR_ASISTENCIA, COLOR_CUENTA, NOMBRE_CUENTA } from './colores';
import {
  ChartCard, ItemAlerta, KpiCard, Leyenda, TooltipGrafico,
} from './DashboardWidgets';

const PESTANAS = [
  { id: 'resumen', etiqueta: 'Resumen' },
  { id: 'graficos', etiqueta: 'Gráficos' },
  { id: 'alertas', etiqueta: 'Alertas' },
];

const ACCIONES_RAPIDAS = [
  {
    etiqueta: 'Registrar estudiante', icono: UserPlus, ruta: '/admin/estudiantes', estado: { crear: true },
  },
  {
    etiqueta: 'Registrar docente', icono: Briefcase, ruta: '/admin/docentes', estado: { crear: true },
  },
  { etiqueta: 'Registrar matrícula', icono: BookOpen, ruta: '/admin/matriculas' },
  { etiqueta: 'Registrar pago', icono: CreditCard, ruta: '/admin/pagos' },
  { etiqueta: 'Crear anuncio', icono: Megaphone, ruta: '/admin/comunicados' },
  { etiqueta: 'Generar reporte', icono: FileText, ruta: '/admin/reportes' },
];

const EJE = { fill: COLORES.eje, fontSize: 11 };

function construirAlertas(datos) {
  const vencidas = datos.cuentasVencidas.map((c) => ({
    clave: `cuenta-${c.id}`,
    icono: DollarSign,
    color: COLORES.peligro,
    titulo: c.estudiante ? nombreCompleto(c.estudiante) : `Estudiante #${c.id_estudiante}`,
    detalle: `${c.concepto} vencida — saldo ${dinero(c.saldo_pendiente)}`,
    momento: `Venció el ${fechaCorta(c.fecha_vencimiento)}`,
  }));
  const anuncios = datos.anuncios.map((a) => ({
    clave: `anuncio-${a.id}`,
    icono: Bell,
    color: COLORES.brandSuave,
    titulo: a.titulo,
    detalle: a.contenido,
    momento: `Publicado el ${fechaCorta(a.fecha_publicacion)}`,
  }));
  return [...vencidas, ...anuncios];
}

function Resumen({ datos, alertas, onVerAlertas }) {
  const navegar = useNavigate();
  const { indicadores: ind } = datos;
  const pagos = datos.cuentas.map((c) => ({
    nombre: NOMBRE_CUENTA[c.estado], valor: c.total, color: COLOR_CUENTA[c.estado],
  }));

  return (
    <>
      <div>
        <SectionTitle>Indicadores generales</SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            icono={GraduationCap}
            etiqueta="Total estudiantes"
            valor={ind.totalEstudiantes}
            detalle={`${ind.estudiantesActivos} activos`}
            destacado
          />
          <KpiCard
            icono={Briefcase}
            etiqueta="Total docentes"
            valor={ind.totalDocentes}
            detalle={`${ind.docentesActivos} activos`}
          />
          <KpiCard icono={Users} etiqueta="Usuarios del sistema" valor={ind.totalUsuarios} detalle="Cuentas de acceso" />
          <KpiCard
            icono={ClipboardList}
            etiqueta="Matrículas activas"
            valor={ind.matriculasActivas}
            detalle={nombreCiclo(datos.ciclo)}
          />
          <KpiCard icono={Activity} etiqueta="Asistencia general" valor={`${ind.asistenciaGeneral}%`} detalle="Incluye tardanzas" />
          <KpiCard icono={DollarSign} etiqueta="Saldo pendiente" valor={dinero(ind.saldoPendiente)} detalle="Pendiente y vencido" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-line bg-card p-5">
          <SectionTitle>Estado de cuentas por cobrar</SectionTitle>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={pagos} dataKey="valor" nameKey="nombre" innerRadius={36} outerRadius={55} strokeWidth={0}>
                  {pagos.map((p) => <Cell key={p.nombre} fill={p.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1">
              <Leyenda items={pagos} />
              <div className="mt-2 border-t border-line pt-2">
                <p className="text-xs text-gray-500">Saldo por cobrar</p>
                <p className="mt-0.5 font-display text-xl font-bold text-white">{dinero(ind.saldoPendiente)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="xl:col-span-2">
          <ChartCard titulo="Estudiantes matriculados por grado" etiqueta={nombreCiclo(datos.ciclo)}>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={datos.estudiantesPorGrado} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORES.linea} vertical={false} />
                <XAxis dataKey="grado" tick={EJE} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={EJE} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<TooltipGrafico />} cursor={{ fill: `${COLORES.linea}80` }} />
                <Bar dataKey="total" fill={COLORES.brand} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div>
        <SectionTitle>Acciones rápidas</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {ACCIONES_RAPIDAS.map((accion, i) => (
            <button
              key={accion.etiqueta}
              type="button"
              onClick={() => navegar(accion.ruta, { state: accion.estado })}
              className="flex flex-col items-center gap-3 rounded-xl border border-line bg-card p-4 text-center
                transition-all duration-150 hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${i % 2 ? COLORES.brandOscuro : COLORES.brand}22` }}
              >
                <accion.icono size={18} style={{ color: i % 2 ? COLORES.brandSuave : COLORES.brand }} />
              </div>
              <span className="font-display text-xs leading-tight font-medium text-gray-300">{accion.etiqueta}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle>Alertas recientes</SectionTitle>
          <button type="button" className="text-xs text-brand-soft hover:underline" onClick={onVerAlertas}>
            Ver todas →
          </button>
        </div>
        <div className="rounded-xl border border-line bg-card p-4">
          {alertas.length === 0
            ? <p className="py-4 text-center text-xs text-gray-500">No hay alertas por ahora.</p>
            : alertas.slice(0, 3).map((a) => <ItemAlerta key={a.clave} alerta={a} />)}
        </div>
      </div>
    </>
  );
}

function Graficos({ datos }) {
  const totalSecciones = datos.estudiantesPorSeccion.reduce((a, b) => a + b.total, 0);
  const coloresSeccion = [COLORES.brand, COLORES.brandOscuro, COLORES.brandSuave, COLORES.linea];
  const asistencia = datos.asistencia.map((a) => ({
    nombre: a.estado, valor: a.total, color: COLOR_ASISTENCIA[a.estado],
  }));
  const totalAsistencia = asistencia.reduce((a, b) => a + b.valor, 0);

  return (
    <div className="space-y-4">
      <SectionTitle>Estadísticas y gráficos</SectionTitle>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard titulo="Estudiantes por grado">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datos.estudiantesPorGrado} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORES.linea} vertical={false} />
              <XAxis dataKey="grado" tick={EJE} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={EJE} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<TooltipGrafico />} cursor={{ fill: `${COLORES.linea}80` }} />
              <Bar dataKey="total" fill={COLORES.brand} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Estudiantes por sección">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={220}>
              <PieChart>
                <Pie data={datos.estudiantesPorSeccion} dataKey="total" nameKey="seccion" outerRadius={80} strokeWidth={0}>
                  {datos.estudiantesPorSeccion.map((s, i) => (
                    <Cell key={s.seccion} fill={coloresSeccion[i % coloresSeccion.length]} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipGrafico />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {datos.estudiantesPorSeccion.map((s, i) => (
                <div key={s.seccion}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-gray-400">Sección {s.seccion}</span>
                    <span className="font-semibold text-white">{s.total}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-line">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${totalSecciones ? (s.total / totalSecciones) * 100 : 0}%`,
                        background: coloresSeccion[i % coloresSeccion.length],
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="border-t border-line pt-2 text-xs text-gray-500">
                Total: <span className="font-semibold text-white">{totalSecciones}</span> estudiantes
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard titulo="Registros de asistencia por estado" etiqueta={`${totalAsistencia} registros`}>
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={asistencia}
                  dataKey="valor"
                  nameKey="nombre"
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={0}
                  paddingAngle={3}
                >
                  {asistencia.map((a) => <Cell key={a.nombre} fill={a.color} />)}
                </Pie>
                <Tooltip content={<TooltipGrafico />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full flex-1"><Leyenda items={asistencia} /></div>
          </div>
        </ChartCard>

        <ChartCard titulo="Cuentas por cobrar — distribución">
          <div className="grid grid-cols-3 gap-4">
            {datos.cuentas.map((c) => (
              <div key={c.estado} className="rounded-lg border border-line bg-base p-4 text-center">
                <div className="mx-auto mb-2 h-3 w-3 rounded-full" style={{ background: COLOR_CUENTA[c.estado] }} />
                <p className="font-display text-2xl font-bold text-white">{c.total}</p>
                <p className="mt-1 text-xs text-gray-400">{NOMBRE_CUENTA[c.estado]}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function Alertas({ datos, alertas }) {
  const ausencias = datos.asistencia.find((a) => a.estado === 'Ausente')?.total || 0;
  const pendientes = datos.cuentas.find((c) => c.estado === 'pendiente')?.total || 0;
  const contadores = [
    {
      etiqueta: 'Cuentas vencidas', total: datos.cuentasVencidas.length, color: COLORES.peligro, icono: DollarSign,
    },
    {
      etiqueta: 'Inasistencias registradas', total: ausencias, color: COLORES.aviso, icono: Clock,
    },
    {
      etiqueta: 'Cuentas pendientes', total: pendientes, color: COLORES.aviso, icono: CreditCard,
    },
    {
      etiqueta: 'Anuncios recientes', total: datos.anuncios.length, color: COLORES.brandSuave, icono: Bell,
    },
  ];

  return (
    <div className="space-y-4">
      <SectionTitle>Centro de alertas</SectionTitle>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {contadores.map((item) => (
          <div key={item.etiqueta} className="flex items-center gap-3 rounded-xl border border-line bg-card p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${item.color}20` }}>
              <item.icono size={16} style={{ color: item.color }} />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">{item.total}</p>
              <p className="text-[11px] text-gray-400">{item.etiqueta}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-line bg-card p-1">
        {alertas.length === 0 && <p className="py-6 text-center text-xs text-gray-500">No hay alertas por ahora.</p>}
        {alertas.map((a) => (
          <div key={a.clave} className="rounded-lg px-3 transition-colors hover:bg-line/50">
            <ItemAlerta alerta={a} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [pestana, setPestana] = useState('resumen');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    obtenerResumenDashboard()
      .then((resumen) => { if (vigente) setDatos(resumen); })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudo cargar el dashboard.')); });
    return () => { vigente = false; };
  }, []);

  if (error) return <Alerta>{error}</Alerta>;
  if (!datos) return <Cargando texto="Cargando indicadores..." />;

  const alertas = construirAlertas(datos);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500">{fechaLarga()}</p>
        <div className="flex rounded-lg bg-card p-0.5" role="tablist">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={pestana === p.id}
              onClick={() => setPestana(p.id)}
              className={`rounded-md px-3 py-1.5 font-display text-xs font-medium transition-all duration-150
                ${pestana === p.id ? 'bg-brand text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {p.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {pestana === 'resumen' && <Resumen datos={datos} alertas={alertas} onVerAlertas={() => setPestana('alertas')} />}
      {pestana === 'graficos' && <Graficos datos={datos} />}
      {pestana === 'alertas' && <Alertas datos={datos} alertas={alertas} />}
    </div>
  );
}
