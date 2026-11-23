import { promedioPonderado } from '../utils/notas';
import { obtenerCicloActivo, obtenerSeccionesConGrado } from './catalogos';
import { obtenerTodos } from './recursos';

function porId(lista) {
  return Object.fromEntries(lista.map((x) => [x.id, x]));
}

// Calificaciones con estudiante, sección, asignatura, docente y el promedio ponderado del período.
export default async function cargarCalificaciones() {
  const { ciclos, activo } = await obtenerCicloActivo();
  const [
    calificaciones, evaluaciones, matriculas, estudiantes, asignaciones, asignaturas, docentes, { secciones },
  ] = await Promise.all([
    obtenerTodos('calificaciones'),
    obtenerTodos('evaluaciones'),
    obtenerTodos('matriculas'),
    obtenerTodos('estudiantes'),
    obtenerTodos('asignaciones-cursos'),
    obtenerTodos('asignaturas'),
    obtenerTodos('docentes'),
    obtenerSeccionesConGrado(),
  ]);

  const evaluacionPorId = porId(evaluaciones);
  const matriculaPorId = porId(matriculas);
  const estudiantePorId = porId(estudiantes);
  const asignacionPorId = porId(asignaciones);
  const asignaturaPorId = porId(asignaturas);
  const docentePorId = porId(docentes);
  const seccionPorId = porId(secciones);

  const registros = calificaciones.map((c) => {
    const evaluacion = evaluacionPorId[c.id_evaluacion];
    const matricula = matriculaPorId[c.id_matricula];
    const asignacion = asignacionPorId[evaluacion?.id_asignacion_curso];
    const seccion = seccionPorId[matricula?.id_seccion];
    const docente = docentePorId[asignacion?.id_docente];
    return {
      id: c.id,
      nota: Number(c.nota),
      evaluacion: evaluacion?.nombre || '—',
      ponderacion: Number(evaluacion?.ponderacion || 0),
      periodo: evaluacion?.periodo,
      idAsignacion: asignacion?.id,
      asignatura: asignaturaPorId[asignacion?.id_asignatura]?.nombre || '—',
      docente: docente ? `${docente.nombres} ${docente.apellidos}` : '—',
      idMatricula: matricula?.id,
      idCiclo: matricula?.id_ciclo,
      estudiante: estudiantePorId[matricula?.id_estudiante] || null,
      grado: seccion?.grado || '—',
      idGrado: seccion?.id_grado || 0,
      seccion: seccion?.nombre?.trim() || '—',
    };
  });

  // Promedio ponderado por matrícula + asignación + período (mismo cálculo que las alertas del backend).
  const grupos = registros.reduce((acc, r) => {
    const llave = `${r.idMatricula}|${r.idAsignacion}|${r.periodo}`;
    (acc[llave] = acc[llave] || []).push(r);
    return acc;
  }, {});
  const promedios = Object.fromEntries(
    Object.entries(grupos).map(([llave, lista]) => [llave, promedioPonderado(lista)]),
  );

  return {
    ciclos,
    cicloActivo: activo,
    secciones,
    asignaturas: asignaturas.map((a) => a.nombre).sort(),
    registros: registros.map((r) => ({ ...r, promedioPeriodo: promedios[`${r.idMatricula}|${r.idAsignacion}|${r.periodo}`] })),
    promedios: Object.entries(grupos).map(([llave, lista]) => ({
      llave,
      ...lista[0],
      promedio: promedios[llave],
    })),
  };
}
