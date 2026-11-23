import { useEffect, useState } from 'react';
import {
  Check, Copy, KeyRound, RefreshCw, RotateCcw, UserCheck,
} from 'lucide-react';
import Field from '../ui/Field';
import { copiarCredenciales, generarContrasena, sugerirNombreUsuario } from '../../services/cuentas';

// Sección opcional para crear una cuenta de acceso (estudiante o responsable).
// El nombre de usuario se sugiere como año + inicial + primer apellido (ej. 2026wrivas).
export default function CuentaAcceso({
  idUsuario, cargarVinculada, form, cambiar, nombres, apellidos, correoSugerido, correoFijo, rol, descripcion,
}) {
  const [vinculada, setVinculada] = useState(null);
  const [sugiriendo, setSugiriendo] = useState(false);
  const [editandoUsuario, setEditandoUsuario] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!idUsuario || !cargarVinculada) return undefined;
    let vigente = true;
    cargarVinculada()
      .then((cuenta) => { if (vigente) setVinculada(cuenta || { id: idUsuario }); })
      .catch(() => { if (vigente) setVinculada({ id: idUsuario }); });
    return () => { vigente = false; };
  }, [idUsuario, cargarVinculada]);

  const manual = form.usuario_nombre_manual;
  // Con `correoFijo` (estudiante) la cuenta usa el correo de la persona y no se pide uno aparte.
  const usaCorreoFijo = correoFijo !== undefined;
  const correoCuenta = usaCorreoFijo ? correoFijo : form.usuario_correo;
  useEffect(() => {
    if (idUsuario || !form.crearUsuario || manual || !nombres?.trim() || !apellidos?.trim()) return undefined;
    let vigente = true;
    const espera = setTimeout(() => {
      setSugiriendo(true);
      sugerirNombreUsuario(nombres.trim(), apellidos.trim())
        .then((nombre) => { if (vigente) cambiar('usuario_nombre', nombre); })
        .catch(() => {})
        .finally(() => { if (vigente) setSugiriendo(false); });
    }, 350);
    return () => { vigente = false; clearTimeout(espera); };
  }, [idUsuario, form.crearUsuario, manual, nombres, apellidos, cambiar]);

  if (idUsuario) {
    return (
      <div className="col-span-2 flex items-center gap-3 rounded-lg border border-[#10B98140] bg-[#10B98112] p-3 text-xs">
        <UserCheck size={16} className="flex-shrink-0 text-[#10B981]" />
        <div>
          <p className="font-semibold text-[#10B981]">Ya tiene una cuenta de usuario</p>
          <p className="mt-0.5 text-gray-400">
            {vinculada?.nombre_usuario ? `${vinculada.nombre_usuario} · ${vinculada.correo}` : 'Cargando datos de la cuenta...'}
            {' — '}la contraseña y el estado se gestionan desde Usuarios.
          </p>
        </div>
      </div>
    );
  }

  function activar(valor) {
    cambiar('crearUsuario', valor);
    if (valor && !usaCorreoFijo && !form.usuario_correo && correoSugerido) cambiar('usuario_correo', correoSugerido);
    if (valor && !form.usuario_contrasena) cambiar('usuario_contrasena', generarContrasena());
  }

  async function copiar() {
    try {
      await copiarCredenciales({
        usuario: form.usuario_nombre, correo: correoCuenta, contrasena: form.usuario_contrasena,
      });
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  let textoUsuario = form.usuario_nombre;
  if (!textoUsuario) textoUsuario = sugiriendo ? 'Generando...' : 'Escriba nombres y apellidos';

  return (
    <>
      <label
        aria-label="Crear cuenta de acceso"
        className="col-span-2 flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-base p-3"
      >
        <input
          type="checkbox"
          className="mt-0.5 accent-[#c2416b]"
          checked={form.crearUsuario}
          onChange={(e) => activar(e.target.checked)}
        />
        <span>
          <span className="block font-display text-xs font-semibold text-white">Crear cuenta de acceso</span>
          <span className="mt-0.5 block text-[11px] text-gray-500">{descripcion}</span>
        </span>
      </label>

      {form.crearUsuario && (
        <>
          <div className="col-span-2 rounded-xl border border-brand/40 bg-brand/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-[11px] font-semibold tracking-wider text-brand-soft uppercase">Credenciales de acceso</p>
              <button
                type="button"
                onClick={copiar}
                disabled={!form.usuario_nombre || !form.usuario_contrasena}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-gray-400 transition-colors hover:bg-line
                  hover:text-white disabled:opacity-40"
              >
                {copiado ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-[10px] text-gray-500">Nombre de usuario</p>
                {editandoUsuario ? (
                  <input
                    id="usuario_nombre"
                    aria-label="Nombre de usuario"
                    className="input-field font-mono"
                    maxLength={50}
                    value={form.usuario_nombre}
                    onChange={(e) => { cambiar('usuario_nombre', e.target.value.replace(/\s/g, '')); cambiar('usuario_nombre_manual', true); }}
                  />
                ) : (
                  <p id="usuario_nombre_vista" className="font-mono text-base font-bold text-white">{textoUsuario}</p>
                )}
                <div className="mt-1 flex gap-3 text-[10px]">
                  <button type="button" onClick={() => setEditandoUsuario(!editandoUsuario)} className="text-gray-500 hover:text-brand-soft">
                    {editandoUsuario ? 'Listo' : 'Cambiar'}
                  </button>
                  {manual && (
                    <button
                      type="button"
                      onClick={() => { cambiar('usuario_nombre_manual', false); setEditandoUsuario(false); }}
                      className="flex items-center gap-1 text-gray-500 hover:text-brand-soft"
                    >
                      <RotateCcw size={9} />Usar sugerido
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="usuario_contrasena" className="mb-1 block text-[10px] text-gray-500">Contraseña generada</label>
                <div className="flex items-center gap-1">
                  <input
                    id="usuario_contrasena"
                    className="input-field font-mono text-sm font-bold tracking-wider"
                    autoComplete="off"
                    spellCheck={false}
                    value={form.usuario_contrasena}
                    onChange={(e) => cambiar('usuario_contrasena', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => cambiar('usuario_contrasena', generarContrasena())}
                    title="Generar otra contraseña"
                    aria-label="Generar otra contraseña"
                    className="rounded-lg p-2 text-gray-400 hover:bg-line hover:text-brand-soft"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {usaCorreoFijo ? (
            <p
              className={`col-span-2 rounded-lg border px-3 py-2 text-xs ${correoFijo
                ? 'border-line bg-base text-gray-300' : 'border-[#F59E0B40] bg-[#F59E0B15] text-[#F59E0B]'}`}
            >
              {correoFijo
                ? `Inicia sesión con el correo del estudiante: ${correoFijo}`
                : 'Escriba el correo electrónico del estudiante en «Datos personales»: es el mismo con el que iniciará sesión.'}
            </p>
          ) : (
            <Field id="usuario_correo" etiqueta="Correo de acceso (con este se inicia sesión) *" ancho={2}>
              <input
                id="usuario_correo"
                type="email"
                className="input-field"
                maxLength={50}
                value={form.usuario_correo}
                onChange={(e) => cambiar('usuario_correo', e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </Field>
          )}
          <p className="col-span-2 flex items-center gap-1.5 text-[11px] text-gray-500">
            <KeyRound size={11} />
            {`Usuario: año + inicial del nombre + primer apellido. Anote o copie la contraseña antes de guardar. Rol: ${rol}.`}
          </p>
        </>
      )}
    </>
  );
}
