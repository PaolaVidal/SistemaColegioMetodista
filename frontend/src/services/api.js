import axios from 'axios';
import BASE_URL from '../api';
import { limpiarCache } from './cache';

// La sesión del SPA usa cookies de Sanctum con protección CSRF.
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
});

// Tras cualquier escritura (o inicio/cierre de sesión) los datos en caché dejan de ser confiables.
api.interceptors.response.use((respuesta) => {
  if (respuesta.config.method !== 'get') limpiarCache();
  return respuesta;
});

export function mensajeError(error, porDefecto = 'Ocurrió un error inesperado.') {
  const datos = error?.response?.data;
  if (error?.response?.status === 429) {
    return 'Se realizaron demasiadas solicitudes en poco tiempo. Espere unos segundos e intente de nuevo.';
  }
  if (datos?.errors) {
    return Object.values(datos.errors).flat()[0];
  }
  return datos?.message || porDefecto;
}

export default api;
