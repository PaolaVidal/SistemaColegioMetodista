import Drawer from '../../../components/ui/Drawer';
import Pill from '../../../components/ui/Pill';
import {
  dinero, fechaCorta, iniciales, nombreCompleto,
} from '../../../utils/formato';
import { ESTADOS_CUENTA, iconoConcepto } from './estados';

// Historial financiero de un estudiante: resumen, cuentas y pagos recibidos.
export default function EstadoCuentaDrawer({
  estudiante, cuentas, pagos, onClose, onRegistrarPago,
}) {
  const total = cuentas.reduce((s, c) => s + c.total, 0);
  const pagado = cuentas.reduce((s, c) => s + c.abonado, 0);
  const pendiente = cuentas.filter((c) => c.estado === 'pendiente').reduce((s, c) => s + c.saldo, 0);
  const vencido = cuentas.filter((c) => c.estado === 'vencido').reduce((s, c) => s + c.saldo, 0);
  const avance = total > 0 ? Math.min(100, (pagado / total) * 100) : 0;
  const ordenadas = [...cuentas].sort((a, b) => String(b.fecha_vencimiento).localeCompare(String(a.fecha_vencimiento)));
  const recibidos = [...pagos].sort((a, b) => String(b.fecha_pago).localeCompare(String(a.fecha_pago)));

  return (
    <Drawer
      titulo={nombreCompleto(estudiante)}
      subtitulo={`${estudiante.grado ? `${estudiante.grado} — Sección ${estudiante.seccion} · ` : ''}${estudiante.codigo_nie}`}
      onClose={onClose}
      encabezado={(
        <div className="bg-brand-gradient flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white">
          {iniciales(estudiante.nombres, estudiante.apellidos)}
        </div>
      )}
    >
      <div className="border-b border-line px-6 py-4">
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Total', total, '#9CA3AF'],
            ['Pagado', pagado, '#10B981'],
            ['Pendiente', pendiente, '#F59E0B'],
            ['Vencido', vencido, '#EF4444'],
          ].map(([etiqueta, valor, color]) => (
            <div key={etiqueta} className="rounded-xl border border-line bg-card p-3 text-center">
              <p className="font-display text-sm font-bold" style={{ color }}>{dinero(valor)}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{etiqueta}</p>
            </div>
          ))}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div className={`h-2 rounded-full ${avance === 100 ? 'bg-[#10B981]' : 'bg-brand'}`} style={{ width: `${avance}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-gray-500">{`${avance.toFixed(0)}% cancelado`}</p>
      </div>

      <div className="border-b border-line px-6 py-3">
        <p className="font-display text-xs font-semibold text-white">Cuentas por cobrar</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-line bg-card">
            {['Concepto', 'Vence', 'Saldo', 'Estado', ''].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-display font-semibold text-gray-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ordenadas.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Sin cuentas registradas</td></tr>
          )}
          {ordenadas.map((c) => {
            const Icono = iconoConcepto(c.concepto);
            const estado = ESTADOS_CUENTA[c.estadoVisible];
            return (
              <tr key={c.id} className="border-b border-line">
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2 text-gray-200"><Icono size={12} className="text-brand-soft" />{c.concepto}</span>
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-gray-400">{fechaCorta(c.fecha_vencimiento)}</td>
                <td className="px-4 py-2.5 font-display font-semibold whitespace-nowrap text-white">{dinero(c.saldo)}</td>
                <td className="px-4 py-2.5"><Pill color={estado.color} icono={estado.icono}>{estado.etiqueta}</Pill></td>
                <td className="px-4 py-2.5 text-right">
                  {c.estado !== 'pagado' && (
                    <button
                      type="button"
                      onClick={() => onRegistrarPago(c)}
                      className="rounded-lg bg-brand/10 px-2 py-1 text-[11px] font-medium text-brand-soft hover:bg-brand/20"
                    >
                      Pagar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="border-b border-line px-6 py-3">
        <p className="font-display text-xs font-semibold text-white">Pagos recibidos</p>
      </div>
      {recibidos.length === 0 && <p className="px-6 py-6 text-center text-xs text-gray-500">Sin pagos registrados</p>}
      {recibidos.map((p) => (
        <div key={p.id} className="flex items-center gap-3 border-b border-line px-6 py-2.5 text-xs">
          <span className="w-20 flex-shrink-0 font-mono text-[10px] text-gray-500">{fechaCorta(p.fecha_pago)}</span>
          <span className="flex-1 truncate text-gray-300">{p.concepto}</span>
          <span className="font-mono text-[10px] text-gray-500">{p.numero_comprobante}</span>
          <span className="font-display font-semibold text-[#10B981]">{dinero(p.monto_pago)}</span>
        </div>
      ))}
    </Drawer>
  );
}
