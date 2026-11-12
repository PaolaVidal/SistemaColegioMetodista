import { obtenerCicloActivo, obtenerSeccionesConGrado } from './catalogos';
import { crear, obtenerTodos } from './recursos';

function redondear(valor) {
  return Math.round(valor * 100) / 100;
}

// Estado visible: la base guarda pendiente/pagado/vencido; "parcial" es una cuenta pendiente con abonos.
function estadoVisible(cuenta, abonado) {
  if (cuenta.estado === 'pagado' || cuenta.estado === 'vencido') return cuenta.estado;
  return abonado > 0 ? 'parcial' : 'pendiente';
}

export async function cargarFinanzas() {
  const { activo: ciclo } = await obtenerCicloActivo();
  const [cuentas, pagos, estudiantes, matriculas, { secciones }] = await Promise.all([
    obtenerTodos('cuentas-por-cobrar'),
    obtenerTodos('pagos'),
    obtenerTodos('estudiantes'),
    ciclo ? obtenerTodos('matriculas', { id_ciclo: ciclo.id }) : [],
    obtenerSeccionesConGrado(ciclo?.id),
  ]);

  const seccionPorId = Object.fromEntries(secciones.map((s) => [s.id, s]));
  const ubicacionPorEstudiante = Object.fromEntries(matriculas.map((m) => {
    const seccion = seccionPorId[m.id_seccion];
    return [m.id_estudiante, {
      grado: seccion?.grado || null, idGrado: seccion?.id_grado || null, seccion: seccion?.nombre?.trim(),
    }];
  }));
  const estudiantesDetalle = estudiantes.map((e) => ({ ...e, ...(ubicacionPorEstudiante[e.id] || {}) }));
  const estudiantePorId = Object.fromEntries(estudiantesDetalle.map((e) => [e.id, e]));

  const abonadoPorCuenta = pagos.reduce((acc, p) => ({
    ...acc, [p.id_cuenta_cobrar]: (acc[p.id_cuenta_cobrar] || 0) + Number(p.monto_pago),
  }), {});

  const listaCuentas = cuentas.map((c) => {
    const abonado = redondear(abonadoPorCuenta[c.id] || 0);
    return {
      ...c,
      estudiante: estudiantePorId[c.id_estudiante] || null,
      total: redondear(Number(c.monto_original) + Number(c.monto_mora || 0)),
      abonado,
      saldo: Number(c.saldo_pendiente),
      estadoVisible: estadoVisible(c, abonado),
    };
  });
  const cuentaPorId = Object.fromEntries(listaCuentas.map((c) => [c.id, c]));

  return {
    estudiantes: estudiantesDetalle,
    cuentas: listaCuentas,
    pagos: pagos.map((p) => ({
      ...p,
      cuenta: cuentaPorId[p.id_cuenta_cobrar] || null,
      estudiante: cuentaPorId[p.id_cuenta_cobrar]?.estudiante || null,
    })),
  };
}

export function registrarPago({
  idCuenta, monto, fecha, comprobante, concepto,
}) {
  return crear('pagos', {
    id_cuenta_cobrar: idCuenta,
    monto_pago: monto,
    fecha_pago: fecha,
    numero_comprobante: comprobante,
    concepto,
  });
}

export function diasVencido(fechaVencimiento) {
  const vence = new Date(`${String(fechaVencimiento).slice(0, 10)}T00:00:00`);
  return Math.max(0, Math.floor((Date.now() - vence.getTime()) / 86400000));
}
