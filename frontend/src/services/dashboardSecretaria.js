import { cargarFinanzas, diasVencido } from './pagos';
import { obtenerRecientes } from './recursos';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function hoyIso() {
  const fecha = new Date();
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
  return fecha.toISOString().slice(0, 10);
}

function sumar(lista, campo) {
  return Math.round(lista.reduce((s, x) => s + Number(x[campo] || 0), 0) * 100) / 100;
}

// Indicadores de cobro para el panel de secretaría (todo se calcula sobre cuentas y pagos reales).
export default async function obtenerResumenSecretaria() {
  const [finanzas, anuncios] = await Promise.all([cargarFinanzas(), obtenerRecientes('anuncios', 6, {}, 'fecha_publicacion')]);
  const { cuentas, pagos } = finanzas;
  const hoy = hoyIso();
  const mes = hoy.slice(0, 7);
  const enQuinceDias = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

  const pagosHoy = pagos.filter((p) => String(p.fecha_pago).slice(0, 10) === hoy);
  const pagosMes = pagos.filter((p) => String(p.fecha_pago).startsWith(mes));
  const pendientes = cuentas.filter((c) => c.estado !== 'pagado');
  const vencidas = cuentas.filter((c) => c.estado === 'vencido');

  // Recaudación de los últimos 6 meses.
  const actual = new Date();
  const recaudacion = Array.from({ length: 6 }, (_, i) => {
    const fecha = new Date(actual.getFullYear(), actual.getMonth() - 5 + i, 1);
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    return { mes: `${MESES[fecha.getMonth()]} ${String(fecha.getFullYear()).slice(2)}`, total: sumar(pagos.filter((p) => String(p.fecha_pago).startsWith(clave)), 'monto_pago') };
  });

  const estados = ['pagado', 'parcial', 'pendiente', 'vencido'].map((estado) => {
    const lista = cuentas.filter((c) => c.estadoVisible === estado);
    return { estado, cuentas: lista.length, saldo: sumar(lista, 'saldo') };
  });

  return {
    indicadores: {
      recaudadoHoy: sumar(pagosHoy, 'monto_pago'),
      pagosHoy: pagosHoy.length,
      recaudadoMes: sumar(pagosMes, 'monto_pago'),
      pagosMes: pagosMes.length,
      porCobrar: sumar(pendientes, 'saldo'),
      cuentasPorCobrar: pendientes.length,
      vencido: sumar(vencidas, 'saldo'),
      cuentasVencidas: vencidas.length,
      estudiantesConMora: new Set(vencidas.map((c) => c.id_estudiante)).size,
    },
    recaudacion,
    estados,
    morosos: [...vencidas].sort((a, b) => b.saldo - a.saldo).slice(0, 6)
      .map((c) => ({ ...c, dias: diasVencido(c.fecha_vencimiento) })),
    proximos: pendientes
      .filter((c) => c.estado === 'pendiente' && String(c.fecha_vencimiento) >= hoy && String(c.fecha_vencimiento) <= enQuinceDias)
      .sort((a, b) => String(a.fecha_vencimiento).localeCompare(String(b.fecha_vencimiento)))
      .slice(0, 6),
    ultimosPagos: [...pagos]
      .sort((a, b) => String(b.fecha_pago).localeCompare(String(a.fecha_pago)) || b.id - a.id)
      .slice(0, 6),
    anuncios: anuncios.filter((a) => new Date(a.fecha_publicacion) <= new Date()).slice(0, 3),
  };
}
