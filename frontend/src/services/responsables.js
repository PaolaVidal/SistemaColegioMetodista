import api from './api';
import { obtenerTodos } from './recursos';

export const PARENTESCOS = ['Madre', 'Padre', 'Abuelo/a', 'Tío/a', 'Hermano/a', 'Tutor legal', 'Otro'];

// Responsables con los estudiantes que tienen a cargo.
export async function cargarResponsables() {
  const [responsables, relaciones, estudiantes] = await Promise.all([
    obtenerTodos('responsables'),
    obtenerTodos('relaciones-estudiante-responsable'),
    obtenerTodos('estudiantes'),
  ]);

  const estudiantePorId = Object.fromEntries(estudiantes.map((e) => [e.id, e]));
  const aCargo = {};
  relaciones.forEach((r) => {
    const estudiante = estudiantePorId[r.id_estudiante];
    if (!estudiante) return;
    (aCargo[r.id_responsable] ||= []).push({ ...estudiante, es_contacto_principal: Boolean(r.es_contacto_principal) });
  });

  const porNombre = (a, b) => a.apellidos.localeCompare(b.apellidos) || a.nombres.localeCompare(b.nombres);
  return {
    estudiantes: [...estudiantes].sort(porNombre),
    responsables: responsables
      .map((r) => ({ ...r, estudiantes: (aCargo[r.id] || []).sort((a, b) => a.apellidos.localeCompare(b.apellidos)) }))
      .sort(porNombre),
  };
}

export async function obtenerFamilia(id) {
  const { data } = await api.get(`/api/familias/${id}`);
  return data;
}

export async function guardarResponsable(id, datos) {
  const { data } = id ? await api.put(`/api/familias/${id}`, datos) : await api.post('/api/familias', datos);
  return data;
}

function datosResponsable(r) {
  return {
    nombres: r.nombres.trim(),
    apellidos: r.apellidos.trim(),
    dui: r.dui.trim(),
    telefono: r.telefono?.trim() || null,
    correo: r.correo?.trim() || null,
    parentesco: r.parentesco?.trim() || null,
    activo: Boolean(r.activo),
  };
}

// Agrega un estudiante a un responsable existente sin tocar sus otros vínculos.
export async function vincularEstudiante(idResponsable, idEstudiante, esPrincipal) {
  const { responsable, estudiantes } = await obtenerFamilia(idResponsable);
  const lista = estudiantes
    .filter((e) => e.id !== idEstudiante)
    .map((e) => ({ id: e.id, es_contacto_principal: Boolean(e.es_contacto_principal) }));
  return guardarResponsable(idResponsable, {
    ...datosResponsable(responsable),
    estudiantes: [...lista, { id: idEstudiante, es_contacto_principal: esPrincipal }],
  });
}
