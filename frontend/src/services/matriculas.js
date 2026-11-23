import { obtenerCicloActivo, obtenerSeccionesConGrado } from './catalogos';
import { actualizar, obtenerTodos } from './recursos';

// En la base la matrícula solo es activa/inactiva; el estado visible depende también del ciclo.
export function estadoMatricula(matricula, ciclo) {
  if (!matricula.estado) return 'Anulada';
  return ciclo?.activo ? 'Activa' : 'Finalizada';
}

export async function cargarMatriculas() {
  const { ciclos, activo } = await obtenerCicloActivo();
  const [matriculas, estudiantes, { secciones }, aranceles, descuentos] = await Promise.all([
    obtenerTodos('matriculas'),
    obtenerTodos('estudiantes'),
    obtenerSeccionesConGrado(),
    obtenerTodos('aranceles-base'),
    obtenerTodos('descuentos-alumnos'),
  ]);

  const cicloPorId = Object.fromEntries(ciclos.map((c) => [c.id, c]));
  const estudiantePorId = Object.fromEntries(estudiantes.map((e) => [e.id, e]));
  const seccionPorId = Object.fromEntries(secciones.map((s) => [s.id, s]));

  const ocupados = matriculas
    .filter((m) => m.estado)
    .reduce((acc, m) => ({ ...acc, [m.id_seccion]: (acc[m.id_seccion] || 0) + 1 }), {});

  const lista = matriculas.map((m) => {
    const seccion = seccionPorId[m.id_seccion];
    const ciclo = cicloPorId[m.id_ciclo];
    return {
      ...m,
      estudiante: estudiantePorId[m.id_estudiante] || null,
      ciclo,
      grado: seccion?.grado || '—',
      idGrado: seccion?.id_grado || 0,
      seccion: seccion?.nombre?.trim() || '—',
      estadoTexto: estadoMatricula(m, ciclo),
    };
  });

  return {
    cicloActivo: activo,
    ciclos,
    aranceles,
    descuentos,
    estudiantes,
    matriculas: lista,
    secciones: secciones.map((s) => ({ ...s, nombre: s.nombre.trim(), ocupados: ocupados[s.id] || 0 })),
  };
}

export function actualizarMatricula(id, datos) {
  return actualizar('matriculas', id, datos);
}
