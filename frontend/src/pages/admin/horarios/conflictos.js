import { conflictos } from '../../../services/horarios';

function seccionDe(asignacion) {
  return `${asignacion.grado} — Sección ${asignacion.seccion}`;
}

function rangoDe(bloque) {
  return `el ${bloque.dia_semana.toLowerCase()} de ${bloque.inicio} a ${bloque.fin}`;
}

// Explica el primer choque con detalle. Si el bloque que estorba no se ve en la vista actual
// (otro grupo del docente o la clase de otro docente en la sección), incluye cómo previsualizarlo.
export default function explicarConflicto(bloques, asignacion, rango, excluir, vista) {
  const lista = conflictos(bloques, asignacion, rango, excluir);
  if (lista.length === 0) return null;

  // Primero el choque que se ve en pantalla; si no hay, el que requiere vista previa.
  const visible = lista.find((c) => (vista === 'seccion' ? c.mismaSeccion : c.mismoDocente));
  const { bloque, mismaSeccion } = visible || lista[0];
  const otra = bloque.asignacion;

  if (visible) {
    const mensaje = vista === 'seccion'
      ? `La sección ya tiene ${otra.asignatura} con ${otra.docente} ${rangoDe(bloque)}.`
      : `El docente ya tiene ${otra.asignatura} con ${seccionDe(otra)} ${rangoDe(bloque)}.`;
    return { mensaje, corto: 'ocupado', previa: null };
  }

  if (!mismaSeccion) {
    return {
      mensaje: `El docente ${otra.docente} ya tiene otra clase: ${otra.asignatura} con ${seccionDe(otra)} ${rangoDe(bloque)}.`,
      corto: `docente ocupado (${otra.grado} ${otra.seccion})`,
      previa: {
        tipo: 'docente',
        titulo: `Horario de ${otra.docente}`,
        filtro: (b) => b.asignacion.id_docente === otra.id_docente,
        dia: rango.dia,
        resaltados: lista.map((c) => c.bloque.id),
        intento: { ...rango, etiqueta: `${asignacion.asignatura} (${seccionDe(asignacion)})` },
      },
    };
  }

  return {
    mensaje: `La sección ${seccionDe(otra)} ya tiene ${otra.asignatura} con ${otra.docente} ${rangoDe(bloque)}.`,
    corto: `sección ocupada (${otra.asignatura})`,
    previa: {
      tipo: 'seccion',
      titulo: `Horario de ${seccionDe(otra)}`,
      filtro: (b) => b.asignacion.id_seccion === otra.id_seccion,
      dia: rango.dia,
      resaltados: lista.map((c) => c.bloque.id),
      intento: { ...rango, etiqueta: `${asignacion.asignatura} (${asignacion.docente})` },
    },
  };
}
