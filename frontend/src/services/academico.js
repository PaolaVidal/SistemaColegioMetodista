import { actualizar, obtenerTodos } from './recursos';

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

// La base solo guarda `activo`; "Planificado" y "Finalizado" se deducen de las fechas.
export function estadoCiclo(ciclo) {
  if (ciclo.activo) return 'Activo';
  return String(ciclo.fecha_inicio) > hoy() ? 'Planificado' : 'Finalizado';
}

export async function cargarAcademico() {
  const [ciclos, grados, secciones, asignaturas, asignaciones, docentes, matriculas] = await Promise.all([
    obtenerTodos('ciclos'),
    obtenerTodos('grados'),
    obtenerTodos('secciones'),
    obtenerTodos('asignaturas'),
    obtenerTodos('asignaciones-cursos'),
    obtenerTodos('docentes'),
    obtenerTodos('matriculas', { estado: true }),
  ]);

  const ordenadosCiclos = ciclos.sort((a, b) => String(b.fecha_inicio).localeCompare(String(a.fecha_inicio)));
  const cicloActivo = ordenadosCiclos.find((c) => c.activo) || ordenadosCiclos[0] || null;
  const gradoPorId = Object.fromEntries(grados.map((g) => [g.id, g]));
  const asignaturaPorId = Object.fromEntries(asignaturas.map((a) => [a.id, a]));
  const docentePorId = Object.fromEntries(docentes.map((d) => [d.id, d]));
  const seccionPorId = Object.fromEntries(secciones.map((s) => [s.id, s]));
  const estudiantesPorSeccion = matriculas.reduce((acc, m) => ({
    ...acc, [m.id_seccion]: (acc[m.id_seccion] || 0) + 1,
  }), {});

  const asignacionesDetalle = asignaciones.map((a) => ({
    ...a,
    asignatura: asignaturaPorId[a.id_asignatura]?.nombre || '—',
    docente: docentePorId[a.id_docente] ? `${docentePorId[a.id_docente].nombres} ${docentePorId[a.id_docente].apellidos}` : '—',
    idGrado: seccionPorId[a.id_seccion]?.id_grado,
  }));

  return {
    ciclos: ordenadosCiclos.map((c) => ({ ...c, estado: estadoCiclo(c) })),
    cicloActivo,
    grados: grados.sort((a, b) => a.id - b.id),
    secciones: secciones.map((s) => ({
      ...s,
      nombre: s.nombre.trim(),
      grado: gradoPorId[s.id_grado]?.nombre || '—',
      estudiantes: estudiantesPorSeccion[s.id] || 0,
      asignaciones: asignacionesDetalle.filter((a) => a.id_seccion === s.id),
    })),
    asignaturas: asignaturas.sort((a, b) => a.nombre.localeCompare(b.nombre)),
    asignaciones: asignacionesDetalle,
    gradoPorId,
  };
}

// Deja un único ciclo activo: el elegido se activa y el resto se desactiva.
export async function activarCiclo(idCiclo, ciclos) {
  const otrosActivos = ciclos.filter((c) => c.activo && c.id !== idCiclo);
  await Promise.all(otrosActivos.map((c) => actualizar('ciclos', c.id, { activo: false })));
  await actualizar('ciclos', idCiclo, { activo: true });
}
