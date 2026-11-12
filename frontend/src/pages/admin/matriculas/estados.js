import { Check, CheckCircle, XCircle } from 'lucide-react';

export const ESTADOS_MATRICULA = {
  Activa: { color: '#10B981', icono: CheckCircle },
  Finalizada: { color: '#9CA3AF', icono: Check },
  Anulada: { color: '#EF4444', icono: XCircle },
};

export function codigoMatricula(matricula) {
  return `MAT-${String(matricula.ciclo?.fecha_inicio || '').slice(0, 4)}-${String(matricula.id).padStart(3, '0')}`;
}

// Color de la barra de ocupación de una sección.
export function colorOcupacion(ocupados, capacidad) {
  if (!capacidad) return '#10B981';
  const porcentaje = (ocupados / capacidad) * 100;
  if (porcentaje >= 95) return '#EF4444';
  if (porcentaje >= 80) return '#F59E0B';
  return '#10B981';
}
