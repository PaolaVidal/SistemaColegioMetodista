import { useState } from 'react';
import { Save, X } from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import Field from '../../../components/ui/Field';
import { mensajeError } from '../../../services/api';
import { guardarDocente } from '../../../services/docentes';
import { MASCARAS, PATRON_DUI, PATRON_TELEFONO } from '../../../utils/formato';

const CAMPOS = [
  {
    campo: 'nombres', etiqueta: 'Nombres *', placeholder: 'Nombres', grupo: 'personal',
  },
  {
    campo: 'apellidos', etiqueta: 'Apellidos *', placeholder: 'Apellidos', grupo: 'personal',
  },
  {
    campo: 'dui', etiqueta: 'DUI *', placeholder: '00000000-0', max: 10, grupo: 'personal', mascara: 'dui',
  },
  {
    campo: 'telefono', etiqueta: 'Teléfono *', placeholder: '7000-0000', max: 9, grupo: 'personal', mascara: 'telefono',
  },
  {
    campo: 'numero_isss', etiqueta: 'Número ISSS', placeholder: 'Opcional', max: 15, grupo: 'laboral',
  },
  {
    campo: 'afp', etiqueta: 'AFP (NUP)', placeholder: 'Opcional', max: 15, grupo: 'laboral',
  },
];

function formularioDesde(docente) {
  return {
    nombres: docente?.nombres || '',
    apellidos: docente?.apellidos || '',
    dui: docente?.dui || '',
    telefono: docente?.telefono || '',
    numero_isss: docente?.numero_isss || '',
    afp: docente?.afp || '',
    activo: docente ? Boolean(docente.activo) : true,
  };
}

function validar(form) {
  if (!form.nombres.trim() || !form.apellidos.trim() || !form.dui.trim() || !form.telefono.trim()) {
    return 'Nombres, apellidos, DUI y teléfono son obligatorios.';
  }
  if (!PATRON_DUI.test(form.dui.trim())) return 'El DUI debe tener el formato 00000000-0.';
  if (!PATRON_TELEFONO.test(form.telefono.trim())) return 'El teléfono debe tener el formato 0000-0000.';
  return '';
}

export default function DocenteForm({ docente, onGuardado, onCancel }) {
  const esNuevo = !docente;
  const [form, setForm] = useState(() => formularioDesde(docente));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function alEscribir(evento) {
    const { name, value } = evento.target;
    const mascara = MASCARAS[CAMPOS.find((c) => c.campo === name)?.mascara];
    setForm((actual) => ({ ...actual, [name]: mascara ? mascara(value) : value }));
  }

  async function guardar() {
    const problema = validar(form);
    if (problema) {
      setError(problema);
      return;
    }
    setError('');
    setGuardando(true);
    try {
      const datos = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || null : v]));
      const guardado = await guardarDocente(docente?.id, datos);
      onGuardado(guardado.id, esNuevo ? 'Docente registrado correctamente.' : 'Cambios guardados correctamente.');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar el docente.'));
      setGuardando(false);
    }
  }

  function grupo(nombre) {
    return CAMPOS.filter((c) => c.grupo === nombre).map((c) => (
      <Field key={c.campo} id={`docente-${c.campo}`} etiqueta={c.etiqueta}>
        <input
          id={`docente-${c.campo}`}
          name={c.campo}
          value={form[c.campo]}
          onChange={alEscribir}
          maxLength={c.max}
          inputMode={c.mascara ? 'numeric' : undefined}
          placeholder={c.placeholder}
          className="input-field py-2.5 text-sm"
        />
      </Field>
    ));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-7 py-5">
        <div>
          <p className="font-display text-base font-bold text-white">{esNuevo ? 'Nuevo docente' : 'Editar docente'}</p>
          <p className="mt-0.5 text-xs text-gray-500">Completa los datos del docente</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancelar"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-line"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-7 py-6">
        <Alerta>{error}</Alerta>
        <div>
          <p className="mb-3 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Datos personales</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{grupo('personal')}</div>
        </div>
        <div>
          <p className="mb-3 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Datos laborales</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {grupo('laboral')}
            <Field id="docente-activo" etiqueta="Estado">
              <select
                id="docente-activo"
                value={form.activo ? '1' : '0'}
                onChange={(e) => setForm((actual) => ({ ...actual, activo: e.target.value === '1' }))}
                className="input-field py-2.5 text-sm"
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </Field>
          </div>
        </div>
        <p className="text-[11px] text-gray-600">
          Las asignaturas se asignan desde la pestaña «Asignaturas» del perfil, una vez guardado el docente.
        </p>
      </div>

      <div className="flex flex-shrink-0 items-center justify-between border-t border-line px-7 py-4">
        <Boton variante="secundario" onClick={onCancel} deshabilitado={guardando}>Cancelar</Boton>
        <Boton onClick={guardar} deshabilitado={guardando}>
          <Save size={12} />
          {guardando && 'Guardando...'}
          {!guardando && (esNuevo ? 'Crear docente' : 'Guardar cambios')}
        </Boton>
      </div>
    </div>
  );
}
