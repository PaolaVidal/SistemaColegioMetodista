import { mensajeError } from './api';
import { obtenerCicloActivo, obtenerSeccionesConGrado } from './catalogos';
import {
  actualizar, crear, eliminar, obtenerTodos,
} from './recursos';

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Jornada que muestra la cuadrícula (en minutos desde medianoche) y duración por defecto de una clase.
export const JORNADA_INICIO = 7 * 60;
export const JORNADA_FIN = 18 * 60;
export const DURACION_CLASE = 50;

const COLORES = ['#c2416b', '#10B981', '#8B5CF6', '#F59E0B', '#60A5FA', '#EC4899', '#14B8A6', '#F97316'];

export function hhmm(hora) {
  return String(hora).slice(0, 5);
}

export function minutos(hora) {
  const [h, m] = hhmm(hora).split(':').map(Number);
  return h * 60 + m;
}

export function aHora(totalMinutos) {
  const h = Math.floor(totalMinutos / 60);
  const m = totalMinutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Bloques del mismo día cuyo horario se cruza con el rango indicado.
export function traslapes(bloques, { dia, inicio, fin }, excluir = []) {
  return bloques.filter((b) => b.dia_semana === dia && !excluir.includes(b.id)
    && minutos(b.inicio) < minutos(fin) && minutos(inicio) < minutos(b.fin));
}

export async function cargarHorarios() {
  const { activo: ciclo } = await obtenerCicloActivo();
  const [horarios, asignaciones, asignaturas, docentes, { secciones }] = await Promise.all([
    obtenerTodos('horarios'),
    ciclo ? obtenerTodos('asignaciones-cursos', { id_ciclo: ciclo.id }) : [],
    obtenerTodos('asignaturas'),
    obtenerTodos('docentes'),
    obtenerSeccionesConGrado(ciclo?.id),
  ]);

  const asignaturasOrdenadas = [...asignaturas].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const colorPorAsignatura = Object.fromEntries(
    asignaturasOrdenadas.map((a, i) => [a.id, COLORES[i % COLORES.length]]),
  );
  const asignaturaPorId = Object.fromEntries(asignaturas.map((a) => [a.id, a]));
  const docentePorId = Object.fromEntries(docentes.map((d) => [d.id, d]));
  const seccionPorId = Object.fromEntries(secciones.map((s) => [s.id, s]));

  const asignacionesDetalle = asignaciones.map((a) => {
    const docente = docentePorId[a.id_docente];
    const seccion = seccionPorId[a.id_seccion];
    return {
      ...a,
      asignatura: asignaturaPorId[a.id_asignatura]?.nombre || '—',
      color: colorPorAsignatura[a.id_asignatura] || COLORES[0],
      docente: docente ? `${docente.nombres} ${docente.apellidos}` : '—',
      grado: seccion?.grado || '—',
      seccion: seccion?.nombre?.trim() || '—',
    };
  });
  const asignacionPorId = Object.fromEntries(asignacionesDetalle.map((a) => [a.id, a]));

  const bloques = horarios
    .filter((h) => asignacionPorId[h.id_asignacion_curso])
    .map((h) => ({
      ...h,
      inicio: hhmm(h.hora_inicio),
      fin: hhmm(h.hora_fin),
      asignacion: asignacionPorId[h.id_asignacion_curso],
    }));

  return {
    ciclo,
    secciones: [...secciones].sort((a, b) => a.id_grado - b.id_grado || a.nombre.localeCompare(b.nombre)),
    docentes: [...docentes].sort((a, b) => a.apellidos.localeCompare(b.apellidos)),
    asignaturas: asignaturasOrdenadas.map((a) => ({ ...a, color: colorPorAsignatura[a.id] })),
    asignaciones: asignacionesDetalle,
    bloques,
  };
}

export function guardarBloque(id, datos) {
  return id ? actualizar('horarios', id, datos) : crear('horarios', datos);
}

export function eliminarBloque(id) {
  return eliminar('horarios', id);
}

// El trigger de la base devuelve un 422 genérico cuando el docente tendría dos clases a la vez.
export function mensajeHorario(error) {
  const datos = error?.response?.data;
  if (error?.response?.status === 422 && !datos?.errors) {
    return 'El docente ya tiene otra clase que se traslapa en ese día y horario.';
  }
  return mensajeError(error, 'No se pudo guardar el horario.');
}

function posicion(dia, inicio, fin) {
  return { dia_semana: dia, hora_inicio: inicio, hora_fin: fin };
}

// Mueve un bloque a otra celda.
export function moverBloque(bloque, { dia, inicio, fin }) {
  return actualizar('horarios', bloque.id, posicion(dia, inicio, fin));
}

// Intercambia dos bloques de celda. Si comparten docente, el primero pasa por una posición
// temporal fuera de la jornada para que el trigger de traslapes no rechace el paso intermedio.
export async function intercambiarBloques(a, b) {
  const mismoDocente = a.asignacion.id_docente === b.asignacion.id_docente;
  if (mismoDocente) await actualizar('horarios', a.id, posicion(a.dia_semana, '23:58', '23:59'));
  try {
    await actualizar('horarios', b.id, posicion(a.dia_semana, a.inicio, a.fin));
  } catch (error) {
    // Deja el primer bloque donde estaba si el segundo no se pudo mover.
    if (mismoDocente) await actualizar('horarios', a.id, posicion(a.dia_semana, a.inicio, a.fin)).catch(() => {});
    throw error;
  }
  try {
    await actualizar('horarios', a.id, posicion(b.dia_semana, b.inicio, b.fin));
  } catch (error) {
    await actualizar('horarios', b.id, posicion(b.dia_semana, b.inicio, b.fin)).catch(() => {});
    if (mismoDocente) await actualizar('horarios', a.id, posicion(a.dia_semana, a.inicio, a.fin)).catch(() => {});
    throw error;
  }
}

// Cambia la asignatura (asignación) de un bloque existente.
export function reemplazarAsignacion(bloque, idAsignacion) {
  return actualizar('horarios', bloque.id, { id_asignacion_curso: idAsignacion });
}

export function crearBloque(idAsignacion, { dia, inicio, fin }) {
  return crear('horarios', { id_asignacion_curso: idAsignacion, ...posicion(dia, inicio, fin) });
}

// Bloques que chocan con el rango si se coloca ahí una clase de `asignacion`:
// por la misma sección (dos clases a la vez) o por el mismo docente (en otra sección).
export function conflictos(bloques, asignacion, { dia, inicio, fin }, excluir = []) {
  return traslapes(bloques, { dia, inicio, fin }, excluir)
    .map((b) => ({
      bloque: b,
      mismaSeccion: b.asignacion.id_seccion === asignacion.id_seccion,
      mismoDocente: b.asignacion.id_docente === asignacion.id_docente,
    }))
    .filter((c) => c.mismaSeccion || c.mismoDocente);
}
