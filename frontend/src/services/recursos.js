import api from './api';
import { enCache } from './cache';

// Debe coincidir con el máximo que acepta CrudController::index en el backend.
const POR_PAGINA = 500;

function parametros(filtros = {}, extra = {}) {
  return { ...extra, filtros };
}

function clave(recurso, filtros, extra = '') {
  return `${recurso}?${JSON.stringify(filtros)}${extra}`;
}

async function descargarTodos(recurso, filtros) {
  const primera = await api.get(`/api/${recurso}`, {
    params: parametros(filtros, { por_pagina: POR_PAGINA, page: 1 }),
  });
  const ultima = primera.data.last_page || 1;
  const restantes = await Promise.all(
    Array.from({ length: ultima - 1 }, (_, i) => api.get(`/api/${recurso}`, {
      params: parametros(filtros, { por_pagina: POR_PAGINA, page: i + 2 }),
    })),
  );
  return [primera, ...restantes].flatMap((respuesta) => respuesta.data.data);
}

// Descarga todas las páginas de un recurso CRUD de la API (con caché compartida).
export async function obtenerTodos(recurso, filtros = {}) {
  const lista = await enCache(clave(recurso, filtros), () => descargarTodos(recurso, filtros));
  return [...lista];
}

// Cuenta registros usando el total de la paginación, sin descargar los datos.
export function contar(recurso, filtros = {}) {
  return enCache(clave(recurso, filtros, '#total'), async () => {
    const { data } = await api.get(`/api/${recurso}`, { params: parametros(filtros, { por_pagina: 1 }) });
    return data.total;
  });
}

// Una página del recurso, para listados grandes paginados en el servidor (p. ej. auditoría).
export function obtenerPagina(recurso, {
  pagina = 1, porPagina = 25, filtros = {}, orden = 'id', direccion = 'desc',
} = {}) {
  return enCache(clave(recurso, filtros, `#p${pagina}-${porPagina}-${orden}-${direccion}`), async () => {
    const { data } = await api.get(`/api/${recurso}`, {
      params: parametros(filtros, {
        page: pagina, por_pagina: porPagina, orden, direccion,
      }),
    });
    return data;
  });
}

export async function obtenerRecientes(recurso, cantidad, filtros = {}, orden = 'id') {
  const datos = await obtenerPagina(recurso, {
    porPagina: cantidad, filtros, orden, direccion: 'desc',
  });
  return datos.data;
}

export async function crear(recurso, datos) {
  const { data } = await api.post(`/api/${recurso}`, datos);
  return data;
}

export async function actualizar(recurso, id, datos) {
  const { data } = await api.put(`/api/${recurso}/${id}`, datos);
  return data;
}

export async function eliminar(recurso, id) {
  await api.delete(`/api/${recurso}/${id}`);
}
