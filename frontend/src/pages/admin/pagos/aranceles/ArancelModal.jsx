import { useState } from 'react';
import Alerta from '../../../../components/ui/Alerta';
import Boton from '../../../../components/ui/Boton';
import Field from '../../../../components/ui/Field';
import Modal from '../../../../components/ui/Modal';
import { TIPOS_COBRO, guardarArancel, mesesACobrar } from '../../../../services/aranceles';
import { mensajeError } from '../../../../services/api';
import { dinero, nombreCiclo } from '../../../../utils/formato';

function formularioDesde(arancel, cicloActivo) {
  return {
    id_ciclo: String(arancel?.id_ciclo || cicloActivo?.id || ''),
    nombre_concepto: arancel?.nombre_concepto?.trim() || '',
    tipo_cobro: arancel?.tipo_cobro || 'unico',
    monto_estandar: arancel ? String(Number(arancel.monto_estandar)) : '',
    dia_vencimiento_mes: String(arancel?.dia_vencimiento_mes || 10),
    recargo_mora: arancel?.recargo_mora != null ? String(Number(arancel.recargo_mora)) : '0',
  };
}

// Crear o editar un arancel: concepto, monto, tipo de cobro, día de vencimiento y recargo por mora.
export default function ArancelModal({
  arancel, ciclos, cicloActivo, onClose, onGuardado,
}) {
  const [form, setForm] = useState(() => formularioDesde(arancel, cicloActivo));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function alEscribir(evento) {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  const ciclo = ciclos.find((c) => String(c.id) === form.id_ciclo);
  const cuotas = form.tipo_cobro === 'mensual' && ciclo ? mesesACobrar({ ...form, nombre_concepto: 'x' }, ciclo).length : 1;
  const monto = Number(form.monto_estandar) || 0;

  async function guardar() {
    const dia = Number(form.dia_vencimiento_mes);
    if (!form.id_ciclo || !form.nombre_concepto.trim()) {
      setError('Seleccione el ciclo y escriba el nombre del concepto.');
      return;
    }
    if (!(monto > 0)) {
      setError('El monto debe ser mayor que cero.');
      return;
    }
    if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
      setError('El día de vencimiento debe estar entre 1 y 31.');
      return;
    }
    if (Number(form.recargo_mora) < 0) {
      setError('El recargo por mora no puede ser negativo.');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      await guardarArancel(arancel?.id, {
        id_ciclo: Number(form.id_ciclo),
        nombre_concepto: form.nombre_concepto.trim(),
        tipo_cobro: form.tipo_cobro,
        monto_estandar: monto,
        dia_vencimiento_mes: dia,
        recargo_mora: Number(form.recargo_mora) || 0,
      });
      onGuardado(arancel ? 'Arancel actualizado.' : 'Arancel creado.');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar el arancel.'));
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={arancel ? 'Editar arancel' : 'Nuevo arancel'}
      subtitulo="Concepto que se cobra a los estudiantes al matricularlos"
      ancho="max-w-lg"
      onClose={onClose}
      pie={(
        <>
          <Boton variante="secundario" onClick={onClose} deshabilitado={guardando}>Cancelar</Boton>
          <Boton onClick={guardar} deshabilitado={guardando}>{guardando ? 'Guardando...' : 'Guardar arancel'}</Boton>
        </>
      )}
    >
      <Alerta>{error}</Alerta>
      <div className="grid grid-cols-2 gap-3">
        <Field id="ar-concepto" etiqueta="Nombre del concepto *" ancho={2}>
          <input
            id="ar-concepto"
            name="nombre_concepto"
            className="input-field"
            maxLength={30}
            value={form.nombre_concepto}
            onChange={alEscribir}
            placeholder="Ej: Mensualidad, Matrícula, Uniforme"
          />
        </Field>
        <Field id="ar-ciclo" etiqueta="Ciclo *">
          <select id="ar-ciclo" name="id_ciclo" className="input-field" value={form.id_ciclo} onChange={alEscribir}>
            {ciclos.map((c) => <option key={c.id} value={c.id}>{nombreCiclo(c)}</option>)}
          </select>
        </Field>
        <Field id="ar-tipo" etiqueta="Tipo de cobro *">
          <select id="ar-tipo" name="tipo_cobro" className="input-field" value={form.tipo_cobro} onChange={alEscribir}>
            {Object.entries(TIPOS_COBRO).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
          </select>
        </Field>
        <Field id="ar-monto" etiqueta="Monto (USD) *">
          <input id="ar-monto" name="monto_estandar" type="number" min="0" step="0.01" className="input-field" value={form.monto_estandar} onChange={alEscribir} />
        </Field>
        <Field id="ar-dia" etiqueta="Día de vencimiento *">
          <input id="ar-dia" name="dia_vencimiento_mes" type="number" min="1" max="31" className="input-field" value={form.dia_vencimiento_mes} onChange={alEscribir} />
        </Field>
        <Field id="ar-mora" etiqueta="Recargo por mora (USD)" ancho={2}>
          <input id="ar-mora" name="recargo_mora" type="number" min="0" step="0.01" className="input-field" value={form.recargo_mora} onChange={alEscribir} />
        </Field>
      </div>
      <p className="rounded-lg border border-line bg-card px-3 py-2 text-[11px] text-gray-400">
        {form.tipo_cobro === 'mensual'
          ? `Se genera una cuota por mes, que vence el día ${form.dia_vencimiento_mes || '—'}. Para quien se matricule hoy: ${cuotas} cuota(s) de ${dinero(monto)}.`
          : `Se genera un solo cobro de ${dinero(monto)} que vence el día ${form.dia_vencimiento_mes || '—'}.`}
        {' '}Si la cuota vence sin pagarse se le suma una vez el recargo por mora.
        {arancel && ' Las cuentas ya generadas conservan su monto; los descuentos se recalculan con su mismo porcentaje.'}
      </p>
    </Modal>
  );
}
