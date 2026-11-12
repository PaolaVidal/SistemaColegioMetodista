// Roles normalizados que devuelve la API en `usuario.rol`.
export const ROLES = {
  administrador: { nombre: 'Administrador', inicio: '/admin' },
  secretaria: { nombre: 'Secretaría', inicio: '/portal' },
  docente: { nombre: 'Docente', inicio: '/portal' },
  estudiante: { nombre: 'Estudiante', inicio: '/portal' },
  responsable: { nombre: 'Encargado', inicio: '/portal' },
};

export function rutaInicio(usuario) {
  return ROLES[usuario?.rol]?.inicio || '/portal';
}

export function nombreRol(rol) {
  return ROLES[rol]?.nombre || 'Usuario';
}
