import { obtenerCicloActivo, obtenerSeccionesConGrado } from './catalogos';
import { obtenerTodos } from './recursos';

// Registros de asistencia con estudiante, sección, asignatura y docente ya resueltos.
export default async function cargarAsistencias() {
  const { ciclos, activo } = await obtenerCicloActivo();
  const [asistencias, matriculas, estudiantes, asignaciones, asignaturas, docentes, { secciones }] = await Promise.all([
    obtenerTodos('asistencias'),
    obtenerTodos('matriculas'),
    obtenerTodos('estudiantes'),
    obtenerTodos('asignaciones-cursos'),
    obtenerTodos('asignaturas'),
    obtenerTodos('docentes'),
    obtenerSeccionesConGrado(),
  ]);

  const porId = (lista) => Object.fromEntries(lista.map((x) => [x.id, x]));
  const matriculaPorId = porId(matriculas);
  const estudiantePorId = porId(estudiantes);
  const asignacionPorId = porId(asignaciones);
  const asignaturaPorId = porId(asignaturas);
  const docentePorId = porId(docentes);
  const seccionPorId = porId(secciones);

  const registros = asistencias.map((a) => {
    const matricula = matriculaPorId[a.id_matricula];
    const asignacion = asignacionPorId[a.id_asignacion_curso];
    const seccion = seccionPorId[matricula?.id_seccion];
    const docente = docentePorId[asignacion?.id_docente];
    return {
      id: a.id,
      fecha: String(a.fecha).slice(0, 10),
      estado: a.estado,
      idCiclo: matricula?.id_ciclo,
      estudiante: estudiantePorId[matricula?.id_estudiante] || null,
      grado: seccion?.grado || '—',
      idGrado: seccion?.id_grado || 0,
      seccion: seccion?.nombre?.trim() || '—',
      asignatura: asignaturaPorId[asignacion?.id_asignatura]?.nombre || '—',
      docente: docente ? `${docente.nombres} ${docente.apellidos}` : '—',
    };
  });

  return {
    ciclos,
    cicloActivo: activo,
    secciones,
    asignaturas: asignaturas.map((a) => a.nombre).sort(),
    registros,
  };
}
