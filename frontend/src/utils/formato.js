const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function iniciales(nombres = '', apellidos = '') {
  return `${nombres.trim()[0] || ''}${apellidos.trim()[0] || ''}`.toUpperCase();
}

export function nombreCompleto(persona) {
  return `${persona?.nombres || ''} ${persona?.apellidos || ''}`.trim();
}

export function fechaCorta(valor) {
  if (!valor) return '—';
  const [anio, mes, dia] = String(valor).slice(0, 10).split('-');
  return `${dia} ${MESES[Number(mes) - 1]} ${anio}`;
}

export function fechaLarga(fecha = new Date()) {
  const texto = fecha.toLocaleDateString('es-SV', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function edad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(`${String(fechaNacimiento).slice(0, 10)}T00:00:00`);
  const hoy = new Date();
  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) anios -= 1;
  return anios;
}

export function dinero(valor) {
  return Number(valor || 0).toLocaleString('es-SV', { style: 'currency', currency: 'USD' });
}

export function porcentaje(parte, total) {
  if (!total) return 0;
  return Math.round((parte / total) * 1000) / 10;
}

export function nombreCiclo(ciclo) {
  if (!ciclo) return '—';
  return `Año escolar ${String(ciclo.fecha_inicio).slice(0, 4)}`;
}

// Formatos de documento salvadoreños; el guion se agrega solo mientras se escribe.
export const PATRON_DUI = /^\d{8}-\d$/;
export const PATRON_TELEFONO = /^\d{4}-\d{4}$/;

export function formatoDui(valor = '') {
  const digitos = String(valor).replace(/\D/g, '').slice(0, 9);
  return digitos.length > 8 ? `${digitos.slice(0, 8)}-${digitos.slice(8)}` : digitos;
}

export function formatoTelefono(valor = '') {
  const digitos = String(valor).replace(/\D/g, '').slice(0, 8);
  return digitos.length > 4 ? `${digitos.slice(0, 4)}-${digitos.slice(4)}` : digitos;
}

export const MASCARAS = { dui: formatoDui, telefono: formatoTelefono };
