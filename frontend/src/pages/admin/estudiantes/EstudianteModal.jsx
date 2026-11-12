import { useCallback, useState } from 'react';
import {
  GraduationCap, Heart, KeyRound, User,
} from 'lucide-react';
import CuentaAcceso from '../../../components/cuentas/CuentaAcceso';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import Field from '../../../components/ui/Field';
import Modal from '../../../components/ui/Modal';
import SiNoField from '../../../components/ui/SiNoField';
import { mensajeError } from '../../../services/api';
import { guardarEstudiante, obtenerExpediente } from '../../../services/estudiantes';
import CampoFicha from './CampoFicha';
import { SECCIONES_FICHA } from './camposFicha';
import FormSection from './FormSection';
import {
  TIPOS_SANGRE, construirExpediente, formularioDesde, validarFormulario,
} from './formularioEstudiante';

const SALUD = [
  {
    indicador: 'padece_enfermedad', detalle: 'tipo_enfermedad', pregunta: '¿Padece alguna enfermedad?', etiqueta: 'Tipo de enfermedad',
  },
  {
    indicador: 'toma_medicamento', detalle: 'nombre_medicamento', pregunta: '¿Toma algún medicamento?', etiqueta: 'Nombre del medicamento',
  },
  {
    indicador: 'posee_discapacidad', detalle: 'tipo_discapacidad', pregunta: '¿Posee alguna discapacidad?', etiqueta: 'Tipo de discapacidad',
  },
  {
    indicador: 'alergico_medicamento',
    detalle: 'nombre_medicamento_alergico',
    pregunta: '¿Es alérgico a algún medicamento?',
    etiqueta: 'Medicamento que produce alergia',
  },
];

export default function EstudianteModal({ estudiante, onClose, onGuardado }) {
  const esNuevo = !estudiante;
  const [form, setForm] = useState(() => formularioDesde(estudiante));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiar = useCallback((campo, valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }, []);
  const idEstudiante = estudiante?.id;
  const cargarCuenta = useCallback(() => obtenerExpediente(idEstudiante).then((d) => d.usuario), [idEstudiante]);

  function alEscribir(evento) {
    cambiar(evento.target.name, evento.target.value);
  }

  async function guardar() {
    const problema = validarFormulario(form);
    if (problema) {
      setError(problema);
      return;
    }
    setError('');
    setGuardando(true);
    try {
      const expediente = await guardarEstudiante(estudiante?.id, construirExpediente(form));
      const conCuenta = form.crearUsuario ? ' Se creó su cuenta de acceso.' : '';
      onGuardado(
        `${esNuevo ? 'Estudiante registrado correctamente.' : 'Cambios guardados correctamente.'}${conCuenta}`,
        { ...expediente, contrasenaInicial: form.crearUsuario ? form.usuario_contrasena : null },
      );
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar el estudiante.'));
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={esNuevo ? 'Registrar estudiante' : 'Editar estudiante'}
      subtitulo={esNuevo ? 'Complete los datos del expediente del estudiante' : `Editando: ${estudiante.nombres} ${estudiante.apellidos}`}
      onClose={onClose}
      pie={(
        <>
          <Boton variante="secundario" onClick={onClose} deshabilitado={guardando}>Cancelar</Boton>
          <Boton onClick={guardar} deshabilitado={guardando}>
            {guardando && 'Guardando...'}
            {!guardando && (esNuevo ? 'Registrar estudiante' : 'Guardar cambios')}
          </Boton>
        </>
      )}
    >
      <Alerta>{error}</Alerta>

      <FormSection titulo="Datos personales" icono={User}>
        <Field id="nombres" etiqueta="Nombres *" ancho={2}>
          <input
            id="nombres"
            name="nombres"
            className="input-field"
            maxLength={30}
            value={form.nombres}
            onChange={alEscribir}
            placeholder="Ej: Lucía Fernanda"
          />
        </Field>
        <Field id="apellidos" etiqueta="Apellidos *" ancho={2}>
          <input
            id="apellidos"
            name="apellidos"
            className="input-field"
            maxLength={30}
            value={form.apellidos}
            onChange={alEscribir}
            placeholder="Ej: Paredes Vega"
          />
        </Field>
        <Field id="codigo_nie" etiqueta="NIE *">
          <input
            id="codigo_nie"
            name="codigo_nie"
            className="input-field"
            maxLength={10}
            value={form.codigo_nie}
            onChange={alEscribir}
            placeholder="Código NIE"
          />
        </Field>
        <Field id="fecha_nacimiento" etiqueta="Fecha de nacimiento *">
          <input
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            type="date"
            className="input-field"
            value={form.fecha_nacimiento}
            onChange={alEscribir}
          />
        </Field>
        <Field id="correo" etiqueta={form.crearUsuario || form.tieneCuenta ? 'Correo electrónico * (inicio de sesión)' : 'Correo electrónico'}>
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="off"
            className="input-field"
            maxLength={50}
            value={form.correo}
            onChange={alEscribir}
            placeholder={form.crearUsuario ? 'Obligatorio para la cuenta' : 'Opcional (vacío si no tiene)'}
          />
        </Field>
        <fieldset>
          <legend className="mb-1.5 block font-display text-[11px] font-medium text-gray-400">Sexo</legend>
          <div className="flex gap-2">
            {[['M', 'Masculino'], ['F', 'Femenino']].map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={form.sexo === valor}
                onClick={() => cambiar('sexo', valor)}
                className={`flex-1 rounded-lg border py-2 font-display text-xs font-semibold transition-all ${form.sexo === valor
                  ? 'border-brand bg-brand/15 text-brand-soft' : 'border-line bg-base text-gray-500'}`}
              >
                {texto}
              </button>
            ))}
          </div>
        </fieldset>
        <Field id="nacionalidad" etiqueta="Nacionalidad">
          <input
            id="nacionalidad"
            name="nacionalidad"
            className="input-field"
            maxLength={30}
            value={form.nacionalidad}
            onChange={alEscribir}
          />
        </Field>
        <Field id="tipo_sangre" etiqueta="Tipo de sangre">
          <select id="tipo_sangre" name="tipo_sangre" className="input-field" value={form.tipo_sangre} onChange={alEscribir}>
            {TIPOS_SANGRE.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </FormSection>

      <FormSection titulo="Datos académicos" icono={GraduationCap}>
        <Field id="activo" etiqueta="Estado">
          <select
            id="activo"
            className="input-field"
            value={form.activo ? '1' : '0'}
            onChange={(e) => cambiar('activo', e.target.value === '1')}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </Field>
        <SiNoField etiqueta="¿Repite grado?" valor={form.repite_grado} onChange={(v) => cambiar('repite_grado', v)} />
        {form.repite_grado && (
          <Field id="anio_grado_anterior" etiqueta="Año en que estudió el grado anterior" ancho={2}>
            <input
              id="anio_grado_anterior"
              name="anio_grado_anterior"
              inputMode="numeric"
              maxLength={4}
              className="input-field"
              value={form.anio_grado_anterior}
              onChange={alEscribir}
              placeholder="Ej: 2025"
            />
          </Field>
        )}
      </FormSection>

      <FormSection titulo="Información de salud (opcional)" icono={Heart} abiertaInicial={false}>
        {SALUD.map((item) => (
          <div key={item.indicador} className="contents">
            <SiNoField
              etiqueta={item.pregunta}
              valor={form[item.indicador]}
              onChange={(v) => cambiar(item.indicador, v)}
            />
            <Field id={item.detalle} etiqueta={item.etiqueta}>
              <input
                id={item.detalle}
                name={item.detalle}
                className="input-field"
                value={form[item.detalle]}
                disabled={!form[item.indicador]}
                onChange={alEscribir}
                placeholder="Describir..."
              />
            </Field>
          </div>
        ))}
        <SiNoField
          etiqueta="¿Vacunado contra el COVID-19?"
          valor={form.vacunado_covid}
          onChange={(v) => cambiar('vacunado_covid', v)}
        />
        <Field id="alimento_alergico" etiqueta="Alimentos que le producen alergia">
          <input
            id="alimento_alergico"
            name="alimento_alergico"
            className="input-field"
            value={form.alimento_alergico}
            onChange={alEscribir}
            placeholder="Opcional"
          />
        </Field>
      </FormSection>

      {SECCIONES_FICHA.map((seccion) => (
        <FormSection key={seccion.titulo} titulo={`${seccion.titulo} (opcional)`} icono={seccion.icono} abiertaInicial={false}>
          {seccion.campos.map((definicion) => (
            <CampoFicha
              key={definicion.campo}
              definicion={definicion}
              valor={form[definicion.campo]}
              onChange={(v) => cambiar(definicion.campo, v)}
            />
          ))}
        </FormSection>
      ))}

      <FormSection titulo="Cuenta de usuario (opcional)" icono={KeyRound} abiertaInicial={false}>
        <CuentaAcceso
          idUsuario={estudiante?.id_usuario}
          cargarVinculada={cargarCuenta}
          form={form}
          cambiar={cambiar}
          nombres={form.nombres}
          apellidos={form.apellidos}
          correoFijo={form.correo.trim()}
          rol="Estudiante"
          descripcion="Opcional. Con esta cuenta el estudiante puede iniciar sesión y ver sus propias notas."
        />
      </FormSection>
    </Modal>
  );
}
