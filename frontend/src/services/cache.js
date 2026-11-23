// Caché en memoria de consultas GET. Evita repetir descargas al cambiar de pantalla y
// une solicitudes simultáneas iguales. Cualquier escritura en la API la vacía (ver api.js).
const DURACION_MS = 2 * 60 * 1000;
const entradas = new Map();

export function enCache(clave, cargar) {
  const ahora = Date.now();
  const entrada = entradas.get(clave);
  if (entrada && entrada.expira > ahora) return entrada.promesa;

  const promesa = cargar().catch((error) => {
    entradas.delete(clave);
    throw error;
  });
  entradas.set(clave, { expira: ahora + DURACION_MS, promesa });
  return promesa;
}

export function limpiarCache() {
  entradas.clear();
}
