import api from './api';

// `identificador` puede ser el correo o el nombre de usuario.
export async function iniciarSesion(identificador, contrasena) {
  await api.get('/sanctum/csrf-cookie');
  const { data } = await api.post('/api/auth/sesion', { identificador, contrasena });
  return data.usuario;
}

export async function obtenerUsuarioActual() {
  const { data } = await api.get('/api/auth/me');
  return data;
}

export async function cerrarSesion() {
  await api.post('/api/auth/logout');
}
