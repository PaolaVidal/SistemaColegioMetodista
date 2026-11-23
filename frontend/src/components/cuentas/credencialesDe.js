// Credenciales recién creadas a partir de la respuesta del servidor (null si no se creó cuenta).
export default function credencialesDe(respuesta) {
  if (!respuesta?.contrasenaInicial || !respuesta.usuario) return null;
  return {
    usuario: respuesta.usuario.nombre_usuario,
    correo: respuesta.usuario.correo,
    contrasena: respuesta.contrasenaInicial,
  };
}
