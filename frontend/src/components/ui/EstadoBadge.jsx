import { CheckCircle, XCircle } from 'lucide-react';

export default function EstadoBadge({ activo }) {
  const estilo = activo
    ? { background: '#10B98120', color: '#10B981' }
    : { background: '#EF444420', color: '#EF4444' };
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={estilo}>
      {activo ? <CheckCircle size={10} /> : <XCircle size={10} />}
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}
