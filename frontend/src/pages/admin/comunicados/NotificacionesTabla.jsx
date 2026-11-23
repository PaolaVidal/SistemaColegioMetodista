import { useState } from 'react';
import {
  CheckCircle, Clock, Filter, Mail, XCircle,
} from 'lucide-react';
import Paginacion, { paginar } from '../../../components/ui/Paginacion';
import Pill from '../../../components/ui/Pill';
import SelectFiltro from '../../../components/ui/SelectFiltro';
import StatCard from '../../../components/ui/StatCard';
import { fechaCorta } from '../../../utils/formato';

const ESTADOS_ENVIO = {
  enviado: { etiqueta: 'Enviado', color: '#10B981', icono: CheckCircle },
  pendiente: { etiqueta: 'Pendiente', color: '#F59E0B', icono: Clock },
  fallido: { etiqueta: 'Fallido', color: '#EF4444', icono: XCircle },
};

const TIPOS = {
  general: 'Aviso general', mora: 'Aviso de mora', pago: 'Pago registrado', rendimiento: 'Bajo rendimiento',
};

const FILAS = 12;

// Bitácora de correos automáticos que el backend encola y n8n envía.
export default function NotificacionesTabla({ notificaciones }) {
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [pagina, setPagina] = useState(1);

  const filtradas = notificaciones
    .filter((n) => !estado || n.estado_envio === estado)
    .filter((n) => !tipo || n.tipo === tipo);
  const { pagina: paginaActual, totalPaginas, filas } = paginar(filtradas, pagina, FILAS);
  const tipos = [...new Set(notificaciones.map((n) => n.tipo))].sort();
  const contar = (e) => notificaciones.filter((n) => n.estado_envio === e).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icono={Mail} etiqueta="Notificaciones" valor={notificaciones.length} color="#c2416b" />
        <StatCard icono={CheckCircle} etiqueta="Enviadas" valor={contar('enviado')} color="#10B981" />
        <StatCard icono={Clock} etiqueta="Pendientes" valor={contar('pendiente')} color="#F59E0B" />
        <StatCard icono={XCircle} etiqueta="Fallidas" valor={contar('fallido')} color="#EF4444" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SelectFiltro id="notif-estado" etiqueta="Todos los estados" icono={Filter} valor={estado} onChange={(v) => { setEstado(v); setPagina(1); }}>
          {Object.entries(ESTADOS_ENVIO).map(([clave, e]) => <option key={clave} value={clave}>{e.etiqueta}</option>)}
        </SelectFiltro>
        <SelectFiltro id="notif-tipo" etiqueta="Todos los tipos" icono={Mail} valor={tipo} onChange={(v) => { setTipo(v); setPagina(1); }}>
          {tipos.map((t) => <option key={t} value={t}>{TIPOS[t] || t}</option>)}
        </SelectFiltro>
        <span className="ml-auto text-[11px] text-gray-600">Los correos se generan al registrar pagos, moras y bajo rendimiento.</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-base">
                {['Asunto', 'Tipo', 'Destinatario', 'Canal', 'Creada', 'Enviada', 'Estado'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">Sin notificaciones</td></tr>
              )}
              {filas.map((n) => {
                const e = ESTADOS_ENVIO[n.estado_envio] || ESTADOS_ENVIO.pendiente;
                return (
                  <tr key={n.id} className="border-b border-line transition-colors hover:bg-line/40">
                    <td className="max-w-80 px-4 py-3">
                      <p className="truncate font-display font-semibold text-white">{n.asunto}</p>
                      {n.contenido && <p className="truncate text-[10px] text-gray-500">{n.contenido}</p>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">{TIPOS[n.tipo] || n.tipo}</td>
                    <td className="px-4 py-3 text-gray-400">{n.destinatario?.correo || `Usuario #${n.id_usuario_destino}`}</td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{n.canal}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{fechaCorta(n.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{n.fecha_envio ? fechaCorta(n.fecha_envio) : '—'}</td>
                    <td className="px-4 py-3"><Pill color={e.color} icono={e.icono}>{e.etiqueta}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Paginacion
          pagina={paginaActual}
          totalPaginas={totalPaginas}
          total={filtradas.length}
          porPagina={FILAS}
          onCambiar={setPagina}
          unidad="notificaciones"
        />
      </div>
    </div>
  );
}
