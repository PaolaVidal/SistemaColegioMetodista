import {
  actualizar, crear, eliminar, obtenerTodos,
} from './recursos';

// "Programado" = fecha de publicación futura; la tabla no guarda otro estado.
export function estadoAnuncio(anuncio) {
  return new Date(anuncio.fecha_publicacion) > new Date() ? 'programado' : 'publicado';
}

export async function cargarComunicados() {
  const [anuncios, usuarios, notificaciones] = await Promise.all([
    obtenerTodos('anuncios'),
    obtenerTodos('usuarios'),
    obtenerTodos('notificaciones'),
  ]);
  const usuarioPorId = Object.fromEntries(usuarios.map((u) => [u.id, u]));

  return {
    anuncios: anuncios
      .map((a) => ({ ...a, autor: usuarioPorId[a.autor_id]?.nombre_usuario || 'Usuario eliminado', estado: estadoAnuncio(a) }))
      .sort((a, b) => String(b.fecha_publicacion).localeCompare(String(a.fecha_publicacion))),
    notificaciones: notificaciones
      .map((n) => ({ ...n, destinatario: usuarioPorId[n.id_usuario_destino] || null }))
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id),
  };
}

export function guardarAnuncio(id, datos) {
  return id ? actualizar('anuncios', id, datos) : crear('anuncios', datos);
}

export function eliminarAnuncio(id) {
  return eliminar('anuncios', id);
}
