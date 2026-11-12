import { obtenerTodos } from './recursos';

// Ciclo activo (o el más reciente si ninguno está marcado como activo).
export async function obtenerCicloActivo() {
  const ciclos = await obtenerTodos('ciclos');
  const ordenados = [...ciclos].sort((a, b) => String(b.fecha_inicio).localeCompare(String(a.fecha_inicio)));
  return { ciclos: ordenados, activo: ordenados.find((c) => c.activo) || ordenados[0] || null };
}

// Secciones de un ciclo con el nombre del grado ya resuelto.
export async function obtenerSeccionesConGrado(idCiclo) {
  const [secciones, grados] = await Promise.all([
    obtenerTodos('secciones', idCiclo ? { id_ciclo: idCiclo } : {}),
    obtenerTodos('grados'),
  ]);
  const gradoPorId = Object.fromEntries(grados.map((g) => [g.id, g]));
  return {
    grados,
    secciones: secciones.map((s) => ({ ...s, grado: gradoPorId[s.id_grado]?.nombre || '—' })),
  };
}
