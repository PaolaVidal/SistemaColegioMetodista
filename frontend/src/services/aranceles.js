import api from './api';
import { obtenerCicloActivo } from './catalogos';
import {
  actualizar, crear, eliminar, obtenerTodos,
} from './recursos';

export const TIPOS_COBRO = {
  unico: 'Pago único',
  mensual: 'Mensual',
};

export const MOTIVOS_DESCUENTO = [
  'Beca académica', 'Beca deportiva', 'Beca socioeconómica', 'Descuento por hermanos',
  'Hijo de personal del colegio', 'Convenio institucional',
];

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre',
  'noviembre', 'diciembre'];

function redondear(valor) {
  return Math.round(Number(valor) * 100) / 100;
}

function fechaLocal(texto) {
  return new Date(`${String(texto).slice(0, 10)}T00:00:00`);
}

// Meses que se cobrarán de un arancel mensual (misma regla que el servidor):
// si el ciclo está en curso, desde el mes actual; si no, desde el inicio del ciclo.
export function mesesACobrar(arancel, ciclo) {
  if (!ciclo) return [];
  const inicio = fechaLocal(ciclo.fecha_inicio);
  const fin = fechaLocal(ciclo.fecha_fin);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const desde = hoy >= inicio && hoy <= fin
    ? new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    : new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  if (arancel.tipo_cobro !== 'mensual') return [`${arancel.nombre_concepto} ${inicio.getFullYear()}`];
  const meses = [];
  for (let mes = new Date(desde); mes <= fin; mes = new Date(mes.getFullYear(), mes.getMonth() + 1, 1)) {
    meses.push(`${MESES[mes.getMonth()]} ${mes.getFullYear()}`);
  }
  return meses;
}

// Monto con descuento a partir de un porcentaje o de un monto final.
export function calcularDescuento(estandar, { modo, valor }) {
  const base = Number(estandar);
  const numero = Number(valor);
  if (modo === 'monto') {
    const monto = Math.min(base, Math.max(0, numero));
    return { monto: redondear(monto), porcentaje: base > 0 ? redondear((1 - monto / base) * 100) : 0 };
  }
  const porcentaje = Math.min(100, Math.max(0, numero));
  return { porcentaje: redondear(porcentaje), monto: redondear(base * (1 - porcentaje / 100)) };
}

export async function cargarAranceles() {
  const { ciclos, activo } = await obtenerCicloActivo();
  const [aranceles, descuentos, estudiantes, cuentas] = await Promise.all([
    obtenerTodos('aranceles-base'),
    obtenerTodos('descuentos-alumnos'),
    obtenerTodos('estudiantes'),
    obtenerTodos('cuentas-por-cobrar'),
  ]);
  const cicloPorId = Object.fromEntries(ciclos.map((c) => [c.id, c]));
  const estudiantePorId = Object.fromEntries(estudiantes.map((e) => [e.id, e]));
  const contarPor = (lista, clave) => lista.reduce((acc, x) => ({ ...acc, [clave(x)]: (acc[clave(x)] || 0) + 1 }), {});
  const cuentasPorArancel = contarPor(cuentas, (c) => c.id_arancel);
  const descuentosPorArancel = contarPor(descuentos, (d) => d.id_arancel);

  const listaAranceles = aranceles.map((a) => ({
    ...a,
    ciclo: cicloPorId[a.id_ciclo] || null,
    cuentas: cuentasPorArancel[a.id] || 0,
    descuentos: descuentosPorArancel[a.id] || 0,
  })).sort((a, b) => String(b.ciclo?.fecha_inicio).localeCompare(String(a.ciclo?.fecha_inicio))
    || a.nombre_concepto.localeCompare(b.nombre_concepto));
  const arancelPorId = Object.fromEntries(listaAranceles.map((a) => [a.id, a]));

  // Cuotas aún no pagadas por estudiante y arancel (las que un descuento modificaría).
  const pendientes = contarPor(cuentas.filter((c) => c.estado !== 'pagado'), (c) => `${c.id_estudiante}-${c.id_arancel}`);

  return {
    ciclos,
    cicloActivo: activo,
    pendientes,
    aranceles: listaAranceles,
    estudiantes: [...estudiantes].sort((a, b) => a.apellidos.localeCompare(b.apellidos)
      || a.nombres.localeCompare(b.nombres)),
    descuentos: descuentos.map((d) => ({
      ...d,
      estudiante: estudiantePorId[d.id_estudiante] || null,
      arancel: arancelPorId[d.id_arancel] || null,
    })),
  };
}

export function guardarArancel(id, datos) {
  return id ? actualizar('aranceles-base', id, datos) : crear('aranceles-base', datos);
}

// Si el arancel tiene pagos, el servidor responde 409 y pide repetir con confirmarPagos.
export async function eliminarArancel(id, confirmarPagos = false) {
  await api.delete(`/api/aranceles-base/${id}`, { params: confirmarPagos ? { confirmar_pagos: 1 } : {} });
}

export function guardarDescuento(id, datos) {
  return id ? actualizar('descuentos-alumnos', id, datos) : crear('descuentos-alumnos', datos);
}

export function eliminarDescuento(id) {
  return eliminar('descuentos-alumnos', id);
}

// Matrícula con sus aranceles: crea la matrícula, los descuentos y las cuentas por cobrar.
export async function inscribir(datos) {
  const { data } = await api.post('/api/inscripciones', datos);
  return data;
}
