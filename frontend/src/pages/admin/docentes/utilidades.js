const COLORES_AVATAR = ['#c2416b', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#8e2440', '#6366F1', '#14B8A6', '#e58fa8'];

export function colorDocente(docente) {
  return COLORES_AVATAR[(docente?.id || 0) % COLORES_AVATAR.length];
}

export function codigoDocente(docente) {
  return `DOC-${String(docente.id).padStart(3, '0')}`;
}

export function materias(docente) {
  return [...new Set(docente.asignaciones.map((a) => a.asignatura))].sort();
}

export function grados(docente) {
  const unicos = new Map(docente.asignaciones.map((a) => [a.idGrado, a.grado]));
  return [...unicos.entries()].sort((a, b) => a[0] - b[0]).map(([, nombre]) => nombre);
}

export function horasSemanales(docente) {
  return Math.round(docente.asignaciones.reduce((suma, a) => suma + a.horas, 0) * 10) / 10;
}
