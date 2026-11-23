import { useCallback, useState } from 'react';
import { GraduationCap, KeyRound, User } from 'lucide-react';
import CuentaAcceso from '../../../components/cuentas/CuentaAcceso';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import Field from '../../../components/ui/Field';
import Modal from '../../../components/ui/Modal';
import { mensajeError } from '../../../services/api';
import { cuentaVacia, datosCuenta, validarCuenta } from '../../../services/cuentas';
import { PARENTESCOS, guardarResponsable, obtenerFamilia } from '../../../services/responsables';
import {
  PATRON_DUI, PATRON_TELEFONO, formatoDui, formatoTelefono,
} from '../../../utils/formato';
import FormSection from '../estudiantes/FormSection';
import SelectorEstudiantes from './SelectorEstudiantes';

function formularioDesde(responsable, estudiantesIniciales) {
  return {
    nombres: responsable?.nombres?.trim() || '',
    apellidos: responsable?.apellidos?.trim() || '',
    dui: responsable?.dui?.trim() || '',
    telefono: responsable?.telefono?.trim() || '',
    correo: responsable?.correo?.trim() || '',
    parentesco: responsable?.parentesco?.trim() || '',
    activo: responsable ? Boolean(responsable.activo) : true,
    estudiantes: responsable?.estudiantes || estudiantesIniciales || [],
    ...cuentaVacia(),
  };
}

function validar(form) {
  if (!form.nombres.trim() || !form.apellidos.trim()) return 'Los nombres y los apellidos son obligatorios.';
  if (!PATRON_DUI.test(form.dui)) return 'El DUI debe tener el formato 00000000-0.';
  if (form.telefono && !PATRON_TELEFONO.test(form.telefono)) return 'El teléfono debe tener el formato 0000-0000.';
  if (form.correo && !/^\S+@\S+\.\S+$/.test(form.correo.trim())) return 'El correo del responsable no es válido.';
  return validarCuenta(form, 'del responsable');
}

export default function ResponsableModal({
  responsable, estudiantes, estudiantesIniciales, onClose, onGuardado,
}) {
  const esNuevo = !responsable;
  const [form, setForm] = useState(() => formularioDesde(responsable, estudiantesIniciales));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiar = useCallback((campo, valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }, []);
  const idResponsable = responsable?.id;
  const cargarCuenta = useCallback(() => obtenerFamilia(idResponsable).then((d) => d.usuario), [idResponsable]);

  function alEscribir(evento) {
    cambiar(evento.target.name, evento.target.value);
  }

  async function guardar() {
    const problema = validar(form);
    if (problema) {
      setError(problema);
      return;
    }
    setError('');
    setGuardando(true);
    const datos = {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      dui: form.dui,
      telefono: form.telefono.trim() || null,
      correo: form.correo.trim() || null,
      parentesco: form.parentesco || null,
      activo: form.activo,
      estudiantes: form.estudiantes.map((e) => ({ id: e.id, es_contacto_principal: Boolean(e.es_contacto_principal) })),
    };
    const usuario = datosCuenta(form);
    if (usuario) datos.usuario = usuario;
    try {
      const familia = await guardarResponsable(responsable?.id, datos);
      const cuenta = usuario ? ' Se creó su cuenta de acceso.' : '';
      onGuardado(
        `${esNuevo ? 'Responsable registrado correctamente.' : 'Cambios guardados correctamente.'}${cuenta}`,
        { ...familia, contrasenaInicial: usuario ? usuario.contrasena : null },
      );
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar el responsable.'));
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={esNuevo ? 'Registrar responsable' : 'Editar responsable'}
      subtitulo={esNuevo ? 'Datos del padre, madre o encargado y estudiantes a su cargo' : `Editando: ${responsable.nombres} ${responsable.apellidos}`}
      onClose={onClose}
      pie={(
        <>
          <Boton variante="secundario" onClick={onClose} deshabilitado={guardando}>Cancelar</Boton>
          <Boton onClick={guardar} deshabilitado={guardando}>
            {guardando && 'Guardando...'}
            {!guardando && (esNuevo ? 'Registrar responsable' : 'Guardar cambios')}
          </Boton>
        </>
      )}
    >
      <Alerta>{error}</Alerta>

      <FormSection titulo="Datos personales" icono={User}>
        <Field id="resp-nombres" etiqueta="Nombres *">
          <input id="resp-nombres" name="nombres" className="input-field" maxLength={30} value={form.nombres} onChange={alEscribir} />
        </Field>
        <Field id="resp-apellidos" etiqueta="Apellidos *">
          <input id="resp-apellidos" name="apellidos" className="input-field" maxLength={30} value={form.apellidos} onChange={alEscribir} />
        </Field>
        <Field id="resp-dui" etiqueta="DUI *">
          <input
            id="resp-dui"
            inputMode="numeric"
            className="input-field"
            value={form.dui}
            onChange={(e) => cambiar('dui', formatoDui(e.target.value))}
            placeholder="00000000-0"
          />
        </Field>
        <Field id="resp-parentesco" etiqueta="Parentesco">
          <select id="resp-parentesco" name="parentesco" className="input-field" value={form.parentesco} onChange={alEscribir}>
            <option value="">Sin especificar</option>
            {[...new Set([...PARENTESCOS, form.parentesco].filter(Boolean))]
              .map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field id="resp-telefono" etiqueta="Teléfono">
          <input
            id="resp-telefono"
            inputMode="numeric"
            className="input-field"
            maxLength={9}
            value={form.telefono}
            onChange={(e) => cambiar('telefono', formatoTelefono(e.target.value))}
            placeholder="0000-0000"
          />
        </Field>
        <Field id="resp-correo" etiqueta="Correo electrónico">
          <input
            id="resp-correo"
            name="correo"
            type="email"
            className="input-field"
            maxLength={50}
            value={form.correo}
            onChange={alEscribir}
            placeholder="Opcional"
          />
        </Field>
        <Field id="resp-activo" etiqueta="Estado">
          <select
            id="resp-activo"
            className="input-field"
            value={form.activo ? '1' : '0'}
            onChange={(e) => cambiar('activo', e.target.value === '1')}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </Field>
      </FormSection>

      <FormSection titulo={`Estudiantes a cargo (${form.estudiantes.length})`} icono={GraduationCap}>
        <SelectorEstudiantes
          estudiantes={estudiantes}
          seleccionados={form.estudiantes}
          onChange={(lista) => cambiar('estudiantes', lista)}
        />
      </FormSection>

      <FormSection titulo="Cuenta de usuario (opcional)" icono={KeyRound} abiertaInicial={false}>
        <CuentaAcceso
          idUsuario={responsable?.id_usuario}
          cargarVinculada={cargarCuenta}
          form={form}
          cambiar={cambiar}
          nombres={form.nombres}
          apellidos={form.apellidos}
          correoSugerido={form.correo}
          rol="Encargado"
          descripcion="Opcional. Con esta cuenta el responsable puede consultar las notas, asistencia y pagos de sus hijos."
        />
      </FormSection>
    </Modal>
  );
}
