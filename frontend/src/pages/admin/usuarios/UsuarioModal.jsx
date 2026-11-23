import { useState } from 'react';
import { Pencil } from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import EstadoBadge from '../../../components/ui/EstadoBadge';
import Field from '../../../components/ui/Field';
import Modal from '../../../components/ui/Modal';
import Pill from '../../../components/ui/Pill';
import { mensajeError } from '../../../services/api';
import { guardarUsuario } from '../../../services/usuarios';
import { fechaCorta, nombreCompleto } from '../../../utils/formato';
import estiloRol from './roles';

function validar(form, esNuevo) {
  if (!form.nombre_usuario.trim()) return 'El nombre de usuario es obligatorio.';
  if (!/^\S+@\S+\.\S+$/.test(form.correo.trim())) return 'Ingrese un correo electrónico válido.';
  if (!form.id_rol) return 'Seleccione un rol.';
  if (esNuevo && !form.contrasena) return 'La contraseña es obligatoria para un usuario nuevo.';
  if (form.contrasena && form.contrasena.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (form.contrasena !== form.confirmacion) return 'Las contraseñas no coinciden.';
  return '';
}

function Detalle({ usuario }) {
  const { color, icono } = estiloRol(usuario.rol);
  const filas = [
    ['Correo electrónico', usuario.correo],
    ['Persona vinculada', usuario.persona ? `${nombreCompleto(usuario.persona)} (${usuario.persona.tipo})` : 'Sin vínculo'],
    ['Teléfono', usuario.persona?.telefono || '—'],
    ['Último acceso', usuario.ultimo_login ? fechaCorta(usuario.ultimo_login) : 'Nunca ha iniciado sesión'],
    ['Fecha de registro', fechaCorta(usuario.created_at)],
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 border-b border-line pb-4">
        <div className="bg-brand-gradient flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white">
          {usuario.nombre_usuario.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-display text-base font-bold text-white">{usuario.nombre_usuario}</p>
          <div className="mt-1"><Pill color={color} icono={icono}>{usuario.rol}</Pill></div>
        </div>
        <div className="ml-auto"><EstadoBadge activo={usuario.activo} /></div>
      </div>
      {filas.map(([etiqueta, valor]) => (
        <div key={etiqueta} className="flex justify-between gap-4 border-b border-line py-2">
          <span className="text-xs text-gray-500">{etiqueta}</span>
          <span className="text-right text-xs font-medium text-white">{valor}</span>
        </div>
      ))}
    </div>
  );
}

export default function UsuarioModal({
  modo, usuario, roles, onClose, onEditar, onGuardado,
}) {
  const esNuevo = modo === 'crear';
  const [form, setForm] = useState({
    nombre_usuario: usuario?.nombre_usuario || '',
    correo: usuario?.correo || '',
    id_rol: usuario ? String(usuario.id_rol) : '',
    activo: usuario ? Boolean(usuario.activo) : true,
    contrasena: '',
    confirmacion: '',
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function alEscribir(evento) {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  async function guardar() {
    const problema = validar(form, esNuevo);
    if (problema) {
      setError(problema);
      return;
    }
    setError('');
    setGuardando(true);
    const datos = {
      nombre_usuario: form.nombre_usuario.trim(),
      correo: form.correo.trim(),
      id_rol: Number(form.id_rol),
      activo: form.activo,
    };
    if (form.contrasena) datos.contrasena = form.contrasena;
    try {
      await guardarUsuario(usuario?.id, datos);
      onGuardado(esNuevo ? 'Usuario registrado correctamente.' : 'Cambios guardados correctamente.');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar el usuario.'));
      setGuardando(false);
    }
  }

  if (modo === 'ver') {
    return (
      <Modal
        titulo="Detalle de usuario"
        subtitulo={`ID #${usuario.id}`}
        ancho="max-w-lg"
        onClose={onClose}
        pie={(
          <>
            <Boton variante="secundario" onClick={onClose}>Cerrar</Boton>
            <Boton onClick={onEditar}><Pencil size={12} />Editar</Boton>
          </>
        )}
      >
        <Detalle usuario={usuario} />
      </Modal>
    );
  }

  return (
    <Modal
      titulo={esNuevo ? 'Nuevo usuario' : 'Editar usuario'}
      subtitulo={esNuevo ? 'Complete los datos para registrar un nuevo usuario' : `Editando: ${usuario.nombre_usuario}`}
      ancho="max-w-lg"
      onClose={onClose}
      pie={(
        <>
          <Boton variante="secundario" onClick={onClose} deshabilitado={guardando}>Cancelar</Boton>
          <Boton onClick={guardar} deshabilitado={guardando}>
            {guardando && 'Guardando...'}
            {!guardando && (esNuevo ? 'Registrar usuario' : 'Guardar cambios')}
          </Boton>
        </>
      )}
    >
      <Alerta>{error}</Alerta>
      <div className="grid grid-cols-2 gap-3">
        <Field id="nombre_usuario" etiqueta="Nombre de usuario *">
          <input
            id="nombre_usuario"
            name="nombre_usuario"
            className="input-field"
            maxLength={50}
            value={form.nombre_usuario}
            onChange={alEscribir}
            placeholder="Ej: mgonzalez"
          />
        </Field>
        <Field id="id_rol" etiqueta="Rol *">
          <select id="id_rol" name="id_rol" className="input-field" value={form.id_rol} onChange={alEscribir}>
            <option value="">Seleccione...</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </Field>
        <Field id="correo-usuario" etiqueta="Correo electrónico *" ancho={2}>
          <input
            id="correo-usuario"
            name="correo"
            type="email"
            className="input-field"
            maxLength={50}
            value={form.correo}
            onChange={alEscribir}
            placeholder="correo@colegiometodista.edu.sv"
          />
        </Field>
        <Field id="contrasena-usuario" etiqueta={esNuevo ? 'Contraseña *' : 'Nueva contraseña'}>
          <input
            id="contrasena-usuario"
            name="contrasena"
            type="password"
            autoComplete="new-password"
            className="input-field"
            value={form.contrasena}
            onChange={alEscribir}
            placeholder={esNuevo ? 'Mínimo 8 caracteres' : 'Dejar vacío para no cambiar'}
          />
        </Field>
        <Field id="confirmacion-usuario" etiqueta="Confirmar contraseña">
          <input
            id="confirmacion-usuario"
            name="confirmacion"
            type="password"
            autoComplete="new-password"
            className="input-field"
            value={form.confirmacion}
            onChange={alEscribir}
          />
        </Field>
        <Field id="activo-usuario" etiqueta="Estado">
          <select
            id="activo-usuario"
            className="input-field"
            value={form.activo ? '1' : '0'}
            onChange={(e) => setForm((actual) => ({ ...actual, activo: e.target.value === '1' }))}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </Field>
      </div>
      {!esNuevo && (
        <p className="text-[11px] text-gray-600">
          Cambiar la contraseña, el rol o el estado cierra las sesiones abiertas de este usuario.
        </p>
      )}
    </Modal>
  );
}
