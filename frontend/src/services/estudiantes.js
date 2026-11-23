import api from './api';
import { obtenerCicloActivo, obtenerSeccionesConGrado } from './catalogos';
import { obtenerTodos } from './recursos';

// Estudiantes con su ficha y su matrícula en el ciclo activo.
export async function cargarEstudiantes() {
  const { activo: ciclo } = await obtenerCicloActivo();
  const [estudiantes, fichas, matriculas, { secciones }] = await Promise.all([
    obtenerTodos('estudiantes'),
    obtenerTodos('fichas-estudiantes'),
    ciclo ? obtenerTodos('matriculas', { id_ciclo: ciclo.id }) : [],
    obtenerSeccionesConGrado(ciclo?.id),
  ]);

  const fichaPorEstudiante = Object.fromEntries(fichas.map((f) => [f.id_estudiante, f]));
  const matriculaPorEstudiante = Object.fromEntries(matriculas.map((m) => [m.id_estudiante, m]));
  const seccionPorId = Object.fromEntries(secciones.map((s) => [s.id, s]));

  const lista = estudiantes.map((e) => {
    const matricula = matriculaPorEstudiante[e.id] || null;
    const seccion = matricula ? seccionPorId[matricula.id_seccion] : null;
    return {
      ...e,
      ficha: fichaPorEstudiante[e.id] || null,
      matricula,
      grado: seccion?.grado || null,
      idGrado: seccion?.id_grado || null,
      seccion: seccion?.nombre?.trim() || null,
    };
  });

  return { ciclo, secciones, estudiantes: lista };
}

export async function obtenerExpediente(id) {
  const { data } = await api.get(`/api/expedientes/${id}`);
  return data;
}

// Crea o actualiza el expediente (estudiante + ficha y, opcionalmente, su cuenta de usuario).
export async function guardarEstudiante(id, datos) {
  const { data } = id
    ? await api.put(`/api/expedientes/${id}`, datos)
    : await api.post('/api/expedientes', datos);
  return data;
}
