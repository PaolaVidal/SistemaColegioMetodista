import { obtenerCicloActivo, obtenerSeccionesConGrado } from './catalogos';
import { contar, obtenerRecientes, obtenerTodos } from './recursos';

const ESTADOS_ASISTENCIA = ['Presente', 'Tardanza', 'Justificado', 'Ausente'];
const ESTADOS_CUENTA = ['pagado', 'pendiente', 'vencido'];

function agrupar(lista, clave) {
  return lista.reduce((acc, item) => ({ ...acc, [clave(item)]: (acc[clave(item)] || 0) + 1 }), {});
}

export default async function obtenerResumenDashboard() {
  const { activo: ciclo } = await obtenerCicloActivo();
  const idCiclo = ciclo?.id;

  const [
    totalEstudiantes, estudiantesActivos, totalDocentes, docentesActivos, totalUsuarios,
    matriculas, { secciones }, asistencias, cuentas, estudiantes, anuncios,
  ] = await Promise.all([
    contar('estudiantes'),
    contar('estudiantes', { activo: true }),
    contar('docentes'),
    contar('docentes', { activo: true }),
    contar('usuarios'),
    idCiclo ? obtenerTodos('matriculas', { id_ciclo: idCiclo, estado: true }) : [],
    obtenerSeccionesConGrado(idCiclo),
    Promise.all(ESTADOS_ASISTENCIA.map((estado) => contar('asistencias', { estado }))),
    obtenerTodos('cuentas-por-cobrar'),
    obtenerTodos('estudiantes'),
    obtenerRecientes('anuncios', 4, {}, 'fecha_publicacion'),
  ]);

  const seccionPorId = Object.fromEntries(secciones.map((s) => [s.id, s]));
  const ordenGrado = Object.fromEntries(secciones.map((s) => [s.grado, s.id_grado]));
  const porGrado = agrupar(matriculas, (m) => seccionPorId[m.id_seccion]?.grado || '—');
  const porSeccion = agrupar(matriculas, (m) => seccionPorId[m.id_seccion]?.nombre?.trim() || '—');

  const asistencia = ESTADOS_ASISTENCIA.map((estado, i) => ({ estado, total: asistencias[i] }));
  const totalAsistencias = asistencias.reduce((a, b) => a + b, 0);
  const asistidas = asistencia.filter((a) => a.estado !== 'Ausente').reduce((a, b) => a + b.total, 0);

  const cuentasPorEstado = agrupar(cuentas, (c) => c.estado);
  const saldoPendiente = cuentas
    .filter((c) => c.estado !== 'pagado')
    .reduce((suma, c) => suma + Number(c.saldo_pendiente || 0), 0);

  const estudiantePorId = Object.fromEntries(estudiantes.map((e) => [e.id, e]));
  const cuentasVencidas = cuentas
    .filter((c) => c.estado === 'vencido')
    .sort((a, b) => String(a.fecha_vencimiento).localeCompare(String(b.fecha_vencimiento)))
    .map((c) => ({ ...c, estudiante: estudiantePorId[c.id_estudiante] }));

  return {
    ciclo,
    indicadores: {
      totalEstudiantes,
      estudiantesActivos,
      totalDocentes,
      docentesActivos,
      totalUsuarios,
      matriculasActivas: matriculas.length,
      asistenciaGeneral: totalAsistencias ? Math.round((asistidas / totalAsistencias) * 1000) / 10 : 0,
      saldoPendiente,
    },
    estudiantesPorGrado: Object.entries(porGrado)
      .map(([grado, total]) => ({ grado, total }))
      .sort((a, b) => (ordenGrado[a.grado] || 0) - (ordenGrado[b.grado] || 0)),
    estudiantesPorSeccion: Object.entries(porSeccion)
      .map(([seccion, total]) => ({ seccion, total }))
      .sort((a, b) => a.seccion.localeCompare(b.seccion)),
    asistencia,
    cuentas: ESTADOS_CUENTA.map((estado) => ({ estado, total: cuentasPorEstado[estado] || 0 })),
    cuentasVencidas,
    anuncios,
  };
}
