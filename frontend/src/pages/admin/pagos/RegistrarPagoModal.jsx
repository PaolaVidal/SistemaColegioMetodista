import { useState } from 'react';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import Field from '../../../components/ui/Field';
import Modal from '../../../components/ui/Modal';
import { mensajeError } from '../../../services/api';
import { registrarPago } from '../../../services/pagos';
import { dinero, nombreCompleto } from '../../../utils/formato';

function hoy() {
  const fecha = new Date();
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
  return fecha.toISOString().slice(0, 10);
}

export default function RegistrarPagoModal({ cuenta, onClose, onRegistrado }) {
  const [form, setForm] = useState({
    monto: String(cuenta.saldo.toFixed(2)),
    fecha: hoy(),
    concepto: `Pago de ${cuenta.concepto.toLowerCase()}`.slice(0, 255),
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function alEscribir(evento) {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  async function guardar() {
    const monto = Number(form.monto);
    if (!(monto > 0)) {
      setError('Ingrese un monto mayor que cero.');
      return;
    }
    if (monto > cuenta.saldo) {
      setError(`El monto no puede superar el saldo pendiente (${dinero(cuenta.saldo)}).`);
      return;
    }
    if (!form.concepto.trim() || !form.fecha) {
      setError('Complete la fecha y el concepto.');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      const pago = await registrarPago({
        idCuenta: cuenta.id,
        monto,
        fecha: form.fecha,
        concepto: form.concepto.trim(),
      });
      onRegistrado(`Pago de ${dinero(monto)} registrado para ${nombreCompleto(cuenta.estudiante)} con el comprobante ${pago.numero_comprobante}.`);
    } catch (e) {
      setError(mensajeError(e, 'No se pudo registrar el pago.'));
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo="Registrar pago"
      subtitulo={`${nombreCompleto(cuenta.estudiante)} · ${cuenta.concepto}`}
      ancho="max-w-lg"
      onClose={onClose}
      pie={(
        <>
          <Boton variante="secundario" onClick={onClose} deshabilitado={guardando}>Cancelar</Boton>
          <Boton onClick={guardar} deshabilitado={guardando}>{guardando ? 'Registrando...' : 'Registrar pago'}</Boton>
        </>
      )}
    >
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Total', cuenta.total, '#9CA3AF'],
          ['Abonado', cuenta.abonado, '#10B981'],
          ['Saldo', cuenta.saldo, '#F59E0B'],
        ].map(([etiqueta, valor, color]) => (
          <div key={etiqueta} className="rounded-xl border border-line bg-card p-3 text-center">
            <p className="font-display text-sm font-bold" style={{ color }}>{dinero(valor)}</p>
            <p className="mt-0.5 text-[10px] text-gray-500">{etiqueta}</p>
          </div>
        ))}
      </div>
      <Alerta>{error}</Alerta>
      <div className="grid grid-cols-2 gap-3">
        <Field id="pago-monto" etiqueta="Monto a pagar (USD) *">
          <input
            id="pago-monto"
            name="monto"
            type="number"
            min="0.01"
            step="0.01"
            className="input-field"
            value={form.monto}
            onChange={alEscribir}
          />
        </Field>
        <Field id="pago-fecha" etiqueta="Fecha de pago *">
          <input id="pago-fecha" name="fecha" type="date" className="input-field" value={form.fecha} onChange={alEscribir} />
        </Field>
        <div className="col-span-2 rounded-lg border border-line bg-card px-3 py-2">
          <p className="font-display text-[11px] font-medium text-gray-400">N.º de comprobante</p>
          <p className="mt-0.5 text-xs text-gray-300">
            Se asigna automáticamente al guardar:
            <span className="ml-1 font-mono text-brand-soft">{`REC-${hoy().replace(/-/g, '')}-####`}</span>
            <span className="text-gray-500"> (fecha de registro + correlativo del día)</span>
          </p>
        </div>
        <Field id="pago-concepto" etiqueta="Concepto *" ancho={2}>
          <input
            id="pago-concepto"
            name="concepto"
            className="input-field"
            maxLength={255}
            value={form.concepto}
            onChange={alEscribir}
          />
        </Field>
      </div>
      <p className="text-[11px] text-gray-600">
        Al registrar el pago se recalcula el saldo de la cuenta y se notifica al encargado si está configurado n8n.
      </p>
    </Modal>
  );
}
