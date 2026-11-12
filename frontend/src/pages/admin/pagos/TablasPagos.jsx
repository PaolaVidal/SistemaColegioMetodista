import {
  CheckCircle, DollarSign, Eye, Users, Wallet,
} from 'lucide-react';
import Pill from '../../../components/ui/Pill';
import { diasVencido } from '../../../services/pagos';
import {
  dinero, fechaCorta, iniciales, nombreCompleto,
} from '../../../utils/formato';
import { ESTADOS_CUENTA, iconoConcepto } from './estados';

function Encabezados({ columnas }) {
  return (
    <thead>
      <tr className="border-b border-line bg-base">
        {columnas.map((h) => (
          <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>
        ))}
      </tr>
    </thead>
  );
}

function FilaVacia({ columnas, icono: Icono, texto }) {
  return (
    <tr>
      <td colSpan={columnas} className="px-4 py-14 text-center">
        <Icono size={36} className="mx-auto mb-3 text-gray-700" />
        <p className="text-sm text-gray-500">{texto}</p>
      </td>
    </tr>
  );
}

function CeldaEstudiante({ estudiante, alerta }) {
  let fondo = 'bg-brand-gradient';
  if (alerta === 'vencido') fondo = 'bg-[#B91C1C]';
  else if (alerta === 'pendiente') fondo = 'bg-[#D97706]';
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${fondo}`}>
        {iniciales(estudiante?.nombres, estudiante?.apellidos)}
      </div>
      <div>
        <p className="font-display font-semibold text-white">{nombreCompleto(estudiante)}</p>
        <p className="text-[10px] text-gray-500">
          {estudiante?.grado ? `${estudiante.grado} · Sec. ${estudiante.seccion}` : estudiante?.codigo_nie}
        </p>
      </div>
    </div>
  );
}

function BotonesCuenta({ cuenta, onVer, onPagar }) {
  return (
    <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
      {cuenta.estado !== 'pagado' && (
        <button
          type="button"
          onClick={() => onPagar(cuenta)}
          title="Registrar pago"
          aria-label={`Registrar pago de ${nombreCompleto(cuenta.estudiante)}`}
          className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-[#10B981]/10 hover:text-[#10B981]"
        >
          <Wallet size={13} />
        </button>
      )}
      <button
        type="button"
        onClick={() => onVer(cuenta.id_estudiante)}
        title="Ver estado de cuenta"
        aria-label={`Ver estado de cuenta de ${nombreCompleto(cuenta.estudiante)}`}
        className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-brand/10 hover:text-brand-soft"
      >
        <Eye size={13} />
      </button>
    </div>
  );
}

// Cuentas por cobrar (pestañas "Cuentas" y "Pendientes").
export function TablaCuentas({
  cuentas, onVer, onPagar, vacio = 'Sin resultados',
}) {
  return (
    <table className="w-full text-xs">
      <Encabezados columnas={['Estudiante', 'Concepto', 'Vencimiento', 'Monto', 'Saldo', 'Estado', '']} />
      <tbody>
        {cuentas.length === 0 && <FilaVacia columnas={7} icono={CheckCircle} texto={vacio} />}
        {cuentas.map((c) => {
          const Icono = iconoConcepto(c.concepto);
          const estado = ESTADOS_CUENTA[c.estadoVisible];
          return (
            <tr key={c.id} className="group border-b border-line transition-colors hover:bg-line/30">
              <td className="px-4 py-3"><CeldaEstudiante estudiante={c.estudiante} alerta={c.estado} /></td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-2 text-gray-300"><Icono size={12} className="text-brand-soft" />{c.concepto}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-400">{fechaCorta(c.fecha_vencimiento)}</td>
              <td className="px-4 py-3">
                <p className="font-display font-bold text-white">{dinero(c.total)}</p>
                {c.abonado > 0 && c.estado !== 'pagado' && (
                  <p className="text-[10px] text-brand-soft">{`Abonado ${dinero(c.abonado)}`}</p>
                )}
              </td>
              <td className="px-4 py-3 font-display font-bold" style={{ color: c.saldo > 0 ? estado.color : '#6B7280' }}>
                {dinero(c.saldo)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <Pill color={estado.color} icono={estado.icono}>{estado.etiqueta}</Pill>
                  {c.estado === 'vencido' && (
                    <p className="ml-1 text-[10px] text-[#EF4444]">{`${diasVencido(c.fecha_vencimiento)} días vencido`}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3"><BotonesCuenta cuenta={c} onVer={onVer} onPagar={onPagar} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function TablaEstados({ estados, onVer }) {
  return (
    <table className="w-full text-xs">
      <Encabezados columnas={['Estudiante', 'Total comprometido', 'Pagado', 'Pendiente', 'Vencido', 'Progreso', '']} />
      <tbody>
        {estados.length === 0 && <FilaVacia columnas={7} icono={Users} texto="Sin resultados" />}
        {estados.map((e) => {
          const avance = e.total > 0 ? Math.min(100, (e.pagado / e.total) * 100) : 0;
          let alerta = 'pagado';
          if (e.vencido > 0) alerta = 'vencido';
          else if (e.pendiente > 0) alerta = 'pendiente';
          let colorBarra = '#F59E0B';
          if (avance === 100) colorBarra = '#10B981';
          else if (avance > 60) colorBarra = '#c2416b';
          return (
            <tr key={e.id} className="group border-b border-line transition-colors hover:bg-line/30">
              <td className="px-4 py-3"><CeldaEstudiante estudiante={e} alerta={alerta} /></td>
              <td className="px-4 py-3 font-display font-semibold text-white">{dinero(e.total)}</td>
              <td className="px-4 py-3 font-display font-semibold text-[#10B981]">{dinero(e.pagado)}</td>
              <td className={`px-4 py-3 font-display font-semibold ${e.pendiente > 0 ? 'text-[#F59E0B]' : 'text-gray-500'}`}>
                {dinero(e.pendiente)}
              </td>
              <td className={`px-4 py-3 font-display font-semibold ${e.vencido > 0 ? 'text-[#EF4444]' : 'text-gray-500'}`}>
                {dinero(e.vencido)}
              </td>
              <td className="min-w-36 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-1.5 rounded-full" style={{ width: `${avance}%`, background: colorBarra }} />
                  </div>
                  <span className="text-[10px] whitespace-nowrap text-gray-500">{`${avance.toFixed(0)}%`}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onVer(e.id)}
                  className="flex items-center gap-1 rounded-lg bg-brand/10 px-2.5 py-1.5 text-[11px] font-medium text-brand-soft
                    opacity-70 transition-all group-hover:opacity-100"
                >
                  <Eye size={11} />Historial
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function TablaPagosRecibidos({ pagos, onVer }) {
  return (
    <table className="w-full text-xs">
      <Encabezados columnas={['Estudiante', 'Concepto', 'Cuenta', 'Fecha de pago', 'Comprobante', 'Monto', '']} />
      <tbody>
        {pagos.length === 0 && <FilaVacia columnas={7} icono={DollarSign} texto="Sin pagos registrados" />}
        {pagos.map((p) => (
          <tr key={p.id} className="group border-b border-line transition-colors hover:bg-line/30">
            <td className="px-4 py-3"><CeldaEstudiante estudiante={p.estudiante} /></td>
            <td className="px-4 py-3 text-gray-300">{p.concepto}</td>
            <td className="px-4 py-3 text-gray-400">{p.cuenta?.concepto || '—'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-gray-400">{fechaCorta(p.fecha_pago)}</td>
            <td className="px-4 py-3 font-mono text-[11px] text-gray-400">{p.numero_comprobante}</td>
            <td className="px-4 py-3 font-display font-bold text-[#10B981]">{dinero(p.monto_pago)}</td>
            <td className="px-4 py-3">
              {p.cuenta && (
                <button
                  type="button"
                  onClick={() => onVer(p.cuenta.id_estudiante)}
                  title="Ver estado de cuenta"
                  aria-label={`Ver estado de cuenta de ${nombreCompleto(p.estudiante)}`}
                  className="rounded-lg p-1.5 text-gray-500 opacity-70 transition-all group-hover:opacity-100 hover:bg-brand/10
                    hover:text-brand-soft"
                >
                  <Eye size={13} />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
