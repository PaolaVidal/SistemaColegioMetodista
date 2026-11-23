import { CheckCircle, Clock, XCircle } from 'lucide-react';

export const ESTADOS_ASISTENCIA = {
  Presente: { color: '#10B981', icono: CheckCircle },
  Ausente: { color: '#EF4444', icono: XCircle },
  Tardanza: { color: '#F59E0B', icono: Clock },
  Justificado: { color: '#A78BFA', icono: CheckCircle },
};

export const MINIMO_AUSENCIAS_RECURRENTES = 3;

// Porcentaje de asistencia: presentes, tardanzas y justificados cuentan como asistencia.
export function porcentajeAsistencia(registros) {
  if (!registros.length) return null;
  const asistidos = registros.filter((r) => r.estado !== 'Ausente').length;
  return Math.round((asistidos / registros.length) * 1000) / 10;
}

export function colorPorcentaje(valor) {
  if (valor === null) return '#9CA3AF';
  if (valor >= 90) return '#10B981';
  if (valor >= 80) return '#F59E0B';
  return '#EF4444';
}

export function fechaConDia(fecha) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-SV', { weekday: 'short', day: '2-digit', month: 'short' });
}
