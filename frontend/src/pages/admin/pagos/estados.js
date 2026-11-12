import {
  BookOpen, CheckCircle, Clock, CreditCard, GraduationCap, AlertTriangle,
} from 'lucide-react';

export const ESTADOS_CUENTA = {
  pagado: { etiqueta: 'Pagado', color: '#10B981', icono: CheckCircle },
  parcial: { etiqueta: 'Parcial', color: '#e58fa8', icono: Clock },
  pendiente: { etiqueta: 'Pendiente', color: '#F59E0B', icono: Clock },
  vencido: { etiqueta: 'Vencido', color: '#EF4444', icono: AlertTriangle },
};

// Orden de prioridad para listar pendientes: primero lo vencido.
export const PRIORIDAD = {
  vencido: 0, parcial: 1, pendiente: 2, pagado: 3,
};

export function iconoConcepto(concepto = '') {
  const texto = concepto.toLowerCase();
  if (texto.includes('matr')) return GraduationCap;
  if (texto.includes('material')) return BookOpen;
  return CreditCard;
}
