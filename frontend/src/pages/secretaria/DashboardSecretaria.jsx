import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertTriangle, BadgePercent, BarChart2, Bell, CalendarClock, Clock, CreditCard, Receipt, Tag, TrendingUp, Wallet,
} from 'lucide-react';
import Alerta from '../../components/ui/Alerta';
import Cargando from '../../components/ui/Cargando';
import SectionTitle from '../../components/ui/SectionTitle';
import { mensajeError } from '../../services/api';
import obtenerResumenSecretaria from '../../services/dashboardSecretaria';
import {
  dinero, fechaCorta, fechaLarga, nombreCompleto,
} from '../../utils/formato';
import COLORES from '../admin/dashboard/colores';
import {
  ChartCard, KpiCard, Leyenda, TooltipGrafico,
} from '../admin/dashboard/DashboardWidgets';

const EJE = { fill: COLORES.eje, fontSize: 11 };
const ESTADOS = {
  pagado: { nombre: 'Pagadas', color: COLORES.exito },
  parcial: { nombre: 'Con abonos', color: COLORES.info },
  pendiente: { nombre: 'Pendientes', color: COLORES.aviso },
  vencido: { nombre: 'Vencidas', color: COLORES.peligro },
};

const ACCIONES = [
  { etiqueta: 'Registrar pago', icono: CreditCard, pestana: 'pendientes' },
  { etiqueta: 'Estados de cuenta', icono: Receipt, pestana: 'estados' },
  { etiqueta: 'Aranceles', icono: Tag, pestana: 'aranceles' },
  { etiqueta: 'Descuentos y becas', icono: BadgePercent, pestana: 'descuentos' },
  { etiqueta: 'Generar reporte', icono: BarChart2, ruta: '/secretaria/reportes' },
];

function TooltipDinero({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-base px-3 py-2 text-xs text-white">
      <p className="mb-1 font-semibold">{label}</p>
      <p style={{ color: COLORES.brandSuave }}>{dinero(payload[0].value)}</p>
    </div>
  );
}

function Lista({
  titulo, icono: Icono, vacio, children, accion,
}) {
  return (
    <div className="rounded-xl border border-line bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-sm font-semibold text-white"><Icono size={14} className="text-brand-soft" />{titulo}</p>
        {accion}
      </div>
      {children.length === 0 ? <p className="py-6 text-center text-xs text-gray-500">{vacio}</p> : <div>{children}</div>}
    </div>
  );
}

function FilaLista({
  titulo, detalle, valor, color = '#fff', nota,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xs font-semibold text-white">{titulo}</p>
        <p className="truncate text-[11px] text-gray-500">{detalle}</p>
      </div>
      <div className="text-right">
        <p className="font-display text-xs font-bold" style={{ color }}>{valor}</p>
        {nota && <p className="text-[10px] text-gray-500">{nota}</p>}
      </div>
    </div>
  );
}

// Panel de secretaría: indicadores de cobro, recaudación, cuentas vencidas y próximos vencimientos.
export default function DashboardSecretaria() {
  const navegar = useNavigate();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    obtenerResumenSecretaria()
      .then((d) => { if (vigente) setDatos(d); })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudo cargar el resumen de cobros.')); });
    return () => { vigente = false; };
  }, []);

  if (!datos) return error ? <Alerta>{error}</Alerta> : <Cargando texto="Cargando resumen de cobros..." />;

  const ind = datos.indicadores;
  const estados = datos.estados.map((e) => ({
    nombre: ESTADOS[e.estado].nombre, valor: e.cuentas, color: ESTADOS[e.estado].color,
  }));
  const irAPagos = (pestana) => navegar('/secretaria/pagos', { state: { pestana } });
  const verTodo = (pestana) => (
    <button type="button" className="text-xs text-brand-soft hover:underline" onClick={() => irAPagos(pestana)}>Ver todo →</button>
  );

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">{fechaLarga()}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icono={Wallet} etiqueta="Recaudado hoy" valor={dinero(ind.recaudadoHoy)} detalle={`${ind.pagosHoy} pago(s) registrados hoy`} destacado />
        <KpiCard icono={TrendingUp} etiqueta="Recaudado este mes" valor={dinero(ind.recaudadoMes)} detalle={`${ind.pagosMes} pago(s) en el mes`} />
        <KpiCard icono={Clock} etiqueta="Por cobrar" valor={dinero(ind.porCobrar)} detalle={`${ind.cuentasPorCobrar} cuenta(s) sin pagar`} />
        <KpiCard
          icono={AlertTriangle}
          etiqueta="En mora"
          valor={dinero(ind.vencido)}
          detalle={`${ind.cuentasVencidas} cuenta(s) vencidas · ${ind.estudiantesConMora} estudiante(s)`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard titulo="Recaudación de los últimos 6 meses" etiqueta="USD">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={datos.recaudacion} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORES.linea} vertical={false} />
                <XAxis dataKey="mes" tick={EJE} axisLine={false} tickLine={false} />
                <YAxis tick={EJE} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<TooltipDinero />} cursor={{ fill: `${COLORES.linea}80` }} />
                <Bar dataKey="total" fill={COLORES.brand} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="rounded-xl border border-line bg-card p-5">
          <SectionTitle>Estado de las cuentas</SectionTitle>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={estados} dataKey="valor" nameKey="nombre" innerRadius={36} outerRadius={55} strokeWidth={0}>
                  {estados.map((e) => <Cell key={e.nombre} fill={e.color} />)}
                </Pie>
                <Tooltip content={<TooltipGrafico />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1"><Leyenda items={estados} /></div>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Acciones rápidas</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {ACCIONES.map((accion, i) => (
            <button
              key={accion.etiqueta}
              type="button"
              onClick={() => (accion.ruta ? navegar(accion.ruta) : irAPagos(accion.pestana))}
              className="flex flex-col items-center gap-3 rounded-xl border border-line bg-card p-4 text-center
                transition-all duration-150 hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${i % 2 ? COLORES.brandOscuro : COLORES.brand}22` }}>
                <accion.icono size={18} style={{ color: i % 2 ? COLORES.brandSuave : COLORES.brand }} />
              </div>
              <span className="font-display text-xs leading-tight font-medium text-gray-300">{accion.etiqueta}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Lista titulo="Mayores saldos vencidos" icono={AlertTriangle} vacio="No hay cuentas vencidas." accion={verTodo('pendientes')}>
          {datos.morosos.map((c) => (
            <FilaLista
              key={c.id}
              titulo={nombreCompleto(c.estudiante)}
              detalle={c.concepto}
              valor={dinero(c.saldo)}
              color={COLORES.peligro}
              nota={`${c.dias} día(s) de atraso`}
            />
          ))}
        </Lista>
        <Lista titulo="Vencen en los próximos 15 días" icono={CalendarClock} vacio="Sin vencimientos próximos." accion={verTodo('pendientes')}>
          {datos.proximos.map((c) => (
            <FilaLista
              key={c.id}
              titulo={nombreCompleto(c.estudiante)}
              detalle={c.concepto}
              valor={dinero(c.saldo)}
              color={COLORES.aviso}
              nota={`Vence el ${fechaCorta(c.fecha_vencimiento)}`}
            />
          ))}
        </Lista>
        <Lista titulo="Últimos pagos registrados" icono={Receipt} vacio="Aún no hay pagos." accion={verTodo('recibidos')}>
          {datos.ultimosPagos.map((p) => (
            <FilaLista
              key={p.id}
              titulo={nombreCompleto(p.estudiante)}
              detalle={`${p.numero_comprobante} · ${p.cuenta?.concepto || p.concepto}`}
              valor={dinero(p.monto_pago)}
              color={COLORES.exito}
              nota={fechaCorta(p.fecha_pago)}
            />
          ))}
        </Lista>
      </div>

      {datos.anuncios.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>Anuncios recientes</SectionTitle>
            <button type="button" className="text-xs text-brand-soft hover:underline" onClick={() => navegar('/secretaria/anuncios')}>Ver todos →</button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {datos.anuncios.map((a) => (
              <div key={a.id} className="rounded-xl border border-line bg-card p-4">
                <p className="flex items-center gap-2 font-display text-xs font-semibold text-white"><Bell size={12} className="text-brand-soft" />{a.titulo}</p>
                <p className="mt-1 line-clamp-2 text-[11px] text-gray-400">{a.contenido}</p>
                <p className="mt-2 text-[10px] text-brand-soft">{fechaCorta(a.fecha_publicacion)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
