import api from './api';

// Sin caracteres que se confunden al dictarlos o leerlos (0/O, 1/l/I).
const MAYUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const MINUSCULAS = 'abcdefghijkmnpqrstuvwxyz';
const DIGITOS = '23456789';
export const LARGO_CONTRASENA = 8;

function aleatorio(limite) {
  const valor = new Uint32Array(1);
  crypto.getRandomValues(valor);
  return valor[0] % limite;
}

// Contraseña inicial de 8 caracteres con al menos una mayúscula, una minúscula y un dígito.
export function generarContrasena() {
  const todos = MAYUSCULAS + MINUSCULAS + DIGITOS;
  const caracteres = [MAYUSCULAS, MINUSCULAS, DIGITOS].map((grupo) => grupo[aleatorio(grupo.length)]);
  while (caracteres.length < LARGO_CONTRASENA) caracteres.push(todos[aleatorio(todos.length)]);
  for (let i = caracteres.length - 1; i > 0; i -= 1) {
    const j = aleatorio(i + 1);
    [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
  }
  return caracteres.join('');
}

// Campos de la sección "cuenta de usuario" que comparten los formularios de estudiante y responsable.
export function cuentaVacia() {
  return {
    crearUsuario: false,
    usuario_nombre: '',
    usuario_nombre_manual: false,
    usuario_correo: '',
    usuario_contrasena: '',
  };
}

// conCorreo = false cuando la cuenta usa el correo de la persona (estudiante) en lugar de uno propio.
export function validarCuenta(form, quien = 'del estudiante', conCorreo = true) {
  if (!form.crearUsuario) return '';
  if (!form.usuario_nombre.trim()) return 'Espere a que se genere el nombre de usuario o escriba uno.';
  if (conCorreo && !/^\S+@\S+\.\S+$/.test(form.usuario_correo.trim())) return `Ingrese un correo válido para la cuenta ${quien}.`;
  if (form.usuario_contrasena.length < LARGO_CONTRASENA) return 'La contraseña de la cuenta debe tener al menos 8 caracteres.';
  return '';
}

export function datosCuenta(form, conCorreo = true) {
  if (!form.crearUsuario) return null;
  const datos = { nombre_usuario: form.usuario_nombre.trim(), contrasena: form.usuario_contrasena };
  if (conCorreo) datos.correo = form.usuario_correo.trim();
  return datos;
}

export async function sugerirNombreUsuario(nombres, apellidos) {
  const { data } = await api.get('/api/cuentas/sugerir-nombre', { params: { nombres, apellidos } });
  return data.nombre_usuario;
}

// Copia las credenciales al portapapeles para entregarlas al estudiante o responsable.
export function copiarCredenciales({ usuario, correo, contrasena }) {
  const texto = `Usuario: ${usuario}\nCorreo de acceso: ${correo}\nContraseña: ${contrasena}`;
  return navigator.clipboard?.writeText(texto) ?? Promise.reject(new Error('Sin portapapeles'));
}
