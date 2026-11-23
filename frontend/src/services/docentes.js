import { obtenerCicloActivo, obtenerSeccionesConGrado } from './catalogos';
import {
  actualizar, crear, eliminar, obtenerTodos,
} from './recursos';

function horasEntre(inicio, fin) {
  const minutos = (hora) => {
    const [h, m] = String(hora).split(':').map(Number);
    return h * 60 + m;
  };
  return Math.max(0, minutos(fin) - minutos(inicio)) / 60;
}

// Docentes con su correo de usuario y sus asignaciones del ciclo activo.
export async function cargarDocentes() {
  const { activo: ciclo } = await obtenerCicloActivo();
  const [docentes, usuarios, asignaciones, asignaturas, horarios, { secciones }] = await Promise.all([
    obtenerTodos('docentes'),
    obtenerTodos('usuarios'),
    ciclo ? obtenerTodos('asignaciones-cursos', { id_ciclo: ciclo.id }) : [],
    obtenerTodos('asignaturas'),
    obtenerTodos('horarios'),
    obtenerSeccionesConGrado(ciclo?.id),
  ]);

  const correoPorUsuario = Object.fromEntries(usuarios.map((u) => [u.id, u.correo]));
  const asignaturaPorId = Object.fromEntries(asignaturas.map((a) => [a.id, a]));
  const seccionPorId = Object.fromEntries(secciones.map((s) => [s.id, s]));
  const horasPorAsignacion = horarios.reduce((acc, h) => ({
    ...acc,
    [h.id_asignacion_curso]: (acc[h.id_asignacion_curso] || 0) + horasEntre(h.hora_inicio, h.hora_fin),
  }), {});

  const detalle = asignaciones.map((a) => ({
    ...a,
    asignatura: asignaturaPorId[a.id_asignatura]?.nombre || '—',
    grado: seccionPorId[a.id_seccion]?.grado || '—',
    idGrado: seccionPorId[a.id_seccion]?.id_grado || 0,
    seccion: seccionPorId[a.id_seccion]?.nombre?.trim() || '—',
    horas: Math.round((horasPorAsignacion[a.id] || 0) * 10) / 10,
  }));

  const lista = docentes.map((d) => ({
    ...d,
    correo: d.id_usuario ? correoPorUsuario[d.id_usuario] || null : null,
    asignaciones: detalle
      .filter((a) => a.id_docente === d.id)
      .sort((x, y) => x.idGrado - y.idGrado || x.seccion.localeCompare(y.seccion)),
  }));

  return {
    ciclo, docentes: lista, asignaturas, secciones, asignaciones: detalle,
  };
}

export function guardarDocente(id, datos) {
  return id ? actualizar('docentes', id, datos) : crear('docentes', datos);
}

export function eliminarDocente(id) {
  return eliminar('docentes', id);
}

export function asignarCurso({
  idCiclo, idSeccion, idAsignatura, idDocente,
}) {
  return crear('asignaciones-cursos', {
    id_ciclo: idCiclo, id_seccion: idSeccion, id_asignatura: idAsignatura, id_docente: idDocente,
  });
}

export function quitarCurso(idAsignacion) {
  return eliminar('asignaciones-cursos', idAsignacion);
}
