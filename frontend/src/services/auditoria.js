import {
  contar, obtenerPagina, obtenerTodos,
} from './recursos';

export const ACCIONES = ['Crear', 'Actualizar', 'Eliminar'];

// La auditoría crece sin límite: se pagina en el servidor en lugar de descargarla completa.
export async function cargarPaginaAuditoria({ pagina, porPagina, filtros }) {
  const [resultado, usuarios] = await Promise.all([
    obtenerPagina('auditoria', {
      pagina, porPagina, filtros, orden: 'fecha_creacion', direccion: 'desc',
    }),
    obtenerTodos('usuarios'),
  ]);
  const usuarioPorId = Object.fromEntries(usuarios.map((u) => [u.id, u]));
  return {
    total: resultado.total,
    ultimaPagina: resultado.last_page,
    registros: resultado.data.map((r) => ({ ...r, usuario: usuarioPorId[r.id_usuario] || null })),
    usuarios: [...usuarios].sort((a, b) => a.nombre_usuario.localeCompare(b.nombre_usuario, 'es', { numeric: true })),
  };
}

export async function resumenAuditoria(filtros) {
  const [total, ...porAccion] = await Promise.all([
    contar('auditoria', filtros),
    ...ACCIONES.map((accion) => contar('auditoria', { ...filtros, accion })),
  ]);
  return { total, porAccion: Object.fromEntries(ACCIONES.map((a, i) => [a, porAccion[i]])) };
}

// Lista de campos que cambiaron entre el valor anterior y el nuevo.
export function diferencias(registro) {
  const anterior = registro.valor_anterior || {};
  const nuevo = registro.valor_nuevo || {};
  return [...new Set([...Object.keys(anterior), ...Object.keys(nuevo)])]
    .filter((campo) => JSON.stringify(anterior[campo]) !== JSON.stringify(nuevo[campo]))
    .map((campo) => ({ campo, anterior: anterior[campo], nuevo: nuevo[campo] }));
}
