import { cuentaVacia, datosCuenta, validarCuenta } from '../../../services/cuentas';
import { PATRON_DUI, PATRON_TELEFONO } from '../../../utils/formato';
import { CAMPOS_FICHA } from './camposFicha';

export const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

// Pares (indicador, detalle): si el indicador es "No", el detalle se envía vacío.
const DETALLES_SALUD = [
  ['padece_enfermedad', 'tipo_enfermedad'],
  ['toma_medicamento', 'nombre_medicamento'],
  ['posee_discapacidad', 'tipo_discapacidad'],
  ['alergico_medicamento', 'nombre_medicamento_alergico'],
];

// Valor inicial de los campos opcionales: los Sí/No quedan sin responder (null).
function camposOpcionalesVacios() {
  return Object.fromEntries(CAMPOS_FICHA.map((c) => [c.campo, c.tipo === 'sino' ? null : '']));
}

export function formularioVacio() {
  return {
    ...camposOpcionalesVacios(),
    ...cuentaVacia(),
    tieneCuenta: false,
    codigo_nie: '',
    nombres: '',
    apellidos: '',
    correo: '',
    activo: true,
    fecha_nacimiento: '',
    sexo: 'M',
    nacionalidad: 'Salvadoreña',
    tipo_sangre: 'O+',
    repite_grado: false,
    anio_grado_anterior: '',
    padece_enfermedad: false,
    tipo_enfermedad: '',
    toma_medicamento: false,
    nombre_medicamento: '',
    posee_discapacidad: false,
    tipo_discapacidad: '',
    alergico_medicamento: false,
    nombre_medicamento_alergico: '',
    vacunado_covid: false,
    alimento_alergico: '',
  };
}

export function formularioDesde(estudiante) {
  const base = formularioVacio();
  if (!estudiante) return base;
  const ficha = estudiante.ficha || {};
  const desdeFicha = Object.fromEntries(
    Object.keys(base)
      .filter((campo) => ficha[campo] !== undefined && ficha[campo] !== null)
      .map((campo) => [campo, typeof ficha[campo] === 'string' ? ficha[campo].trim() : ficha[campo]]),
  );
  const fechas = Object.fromEntries(
    CAMPOS_FICHA.filter((c) => c.tipo === 'fecha' && ficha[c.campo]).map((c) => [c.campo, String(ficha[c.campo]).slice(0, 10)]),
  );
  return {
    ...base,
    ...desdeFicha,
    ...fechas,
    fecha_nacimiento: ficha.fecha_nacimiento ? String(ficha.fecha_nacimiento).slice(0, 10) : '',
    anio_grado_anterior: ficha.anio_grado_anterior ? String(ficha.anio_grado_anterior) : '',
    codigo_nie: estudiante.codigo_nie,
    nombres: estudiante.nombres,
    apellidos: estudiante.apellidos,
    correo: estudiante.correo || '',
    activo: Boolean(estudiante.activo),
    tieneCuenta: Boolean(estudiante.id_usuario),
  };
}

export function validarFormulario(form) {
  if (!form.codigo_nie.trim() || !form.nombres.trim() || !form.apellidos.trim()) {
    return 'El NIE, los nombres y los apellidos son obligatorios.';
  }
  if (!form.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
  const correo = form.correo.trim();
  if (correo && !/^\S+@\S+\.\S+$/.test(correo)) return 'El correo electrónico no es válido.';
  if (!correo && (form.crearUsuario || form.tieneCuenta)) {
    return 'El correo electrónico es obligatorio cuando el estudiante tiene cuenta de usuario: es el mismo con el que inicia sesión.';
  }
  if (form.repite_grado && form.anio_grado_anterior && !/^\d{4}$/.test(form.anio_grado_anterior)) {
    return 'El año del grado anterior debe tener cuatro dígitos.';
  }
  const problemaContacto = [['madre', 'de la madre'], ['padre', 'del padre']].map(([p, quien]) => {
    if (form[`telefono_${p}`] && !PATRON_TELEFONO.test(form[`telefono_${p}`])) return `El teléfono ${quien} debe tener el formato 0000-0000.`;
    if (form[`dui_${p}`] && !PATRON_DUI.test(form[`dui_${p}`])) return `El DUI ${quien} debe tener el formato 00000000-0.`;
    return '';
  }).find(Boolean);
  if (problemaContacto) return problemaContacto;
  return validarCuenta(form, 'del estudiante', false);
}

function textoONulo(valor) {
  const limpio = String(valor ?? '').trim();
  return limpio === '' ? null : limpio;
}

// Convierte el formulario al formato que espera /api/expedientes.
export function construirExpediente(form) {
  const ficha = {
    fecha_nacimiento: form.fecha_nacimiento,
    sexo: form.sexo,
    nacionalidad: textoONulo(form.nacionalidad),
    tipo_sangre: textoONulo(form.tipo_sangre),
    repite_grado: form.repite_grado,
    anio_grado_anterior: form.repite_grado && form.anio_grado_anterior ? Number(form.anio_grado_anterior) : null,
    vacunado_covid: form.vacunado_covid,
    alimento_alergico: textoONulo(form.alimento_alergico),
  };
  DETALLES_SALUD.forEach(([indicador, detalle]) => {
    ficha[indicador] = form[indicador];
    ficha[detalle] = form[indicador] ? textoONulo(form[detalle]) : null;
  });
  CAMPOS_FICHA.forEach(({ campo, tipo }) => {
    ficha[campo] = tipo === 'sino' ? form[campo] : textoONulo(form[campo]);
  });

  const expediente = {
    codigo_nie: form.codigo_nie.trim(),
    nombres: form.nombres.trim(),
    apellidos: form.apellidos.trim(),
    correo: textoONulo(form.correo),
    activo: form.activo,
    ficha,
  };
  const usuario = datosCuenta(form, false);
  if (usuario) expediente.usuario = usuario;
  return expediente;
}
