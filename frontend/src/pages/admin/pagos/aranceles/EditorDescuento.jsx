import { MOTIVOS_DESCUENTO, calcularDescuento } from '../../../../services/aranceles';
import { dinero } from '../../../../utils/formato';

export function descuentoVacio() {
  return {
    modo: 'porcentaje', valor: '', motivo: MOTIVOS_DESCUENTO[0], motivoOtro: '',
  };
}

export function descuentoDesde(registro) {
  if (!registro) return descuentoVacio();
  const motivo = String(registro.motivo || '').trim();
  const conocido = MOTIVOS_DESCUENTO.includes(motivo);
  return {
    modo: 'porcentaje',
    valor: String(Number(registro.porcentaje_descuento)),
    motivo: conocido ? motivo : 'Otro',
    motivoOtro: conocido ? '' : motivo,
  };
}

export function motivoDe(descuento) {
  return (descuento.motivo === 'Otro' ? descuento.motivoOtro : descuento.motivo).trim();
}

export function validarDescuento(descuento) {
  const numero = Number(descuento.valor);
  if (descuento.valor === '' || Number.isNaN(numero) || numero < 0) return 'Ingrese el descuento.';
  if (descuento.modo === 'porcentaje' && numero > 100) return 'El porcentaje no puede ser mayor que 100.';
  if (!motivoDe(descuento)) return 'Indique el motivo del descuento.';
  return '';
}

// Datos que espera la API: el valor elegido (porcentaje o monto final) y el motivo.
export function datosDescuento(descuento) {
  const valor = Number(descuento.valor);
  return {
    ...(descuento.modo === 'monto' ? { monto_fijo_ajustado: valor } : { porcentaje_descuento: valor }),
    motivo: motivoDe(descuento),
  };
}

// Editor compacto de un descuento: porcentaje o monto final, motivo y vista previa del resultado.
export default function EditorDescuento({
  id, estandar, descuento, onChange,
}) {
  const resultado = descuento.valor === '' ? null : calcularDescuento(estandar, descuento);

  function cambiar(campo, valor) {
    onChange({ ...descuento, [campo]: valor });
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 flex gap-1 rounded-lg border border-line bg-base p-1 text-[11px]">
        {[['porcentaje', 'Porcentaje (%)'], ['monto', 'Monto final (USD)']].map(([modo, texto]) => (
          <button
            key={modo}
            type="button"
            aria-pressed={descuento.modo === modo}
            onClick={() => onChange({ ...descuento, modo, valor: '' })}
            className={`flex-1 rounded-md py-1 font-semibold ${descuento.modo === modo ? 'bg-brand text-white' : 'text-gray-500'}`}
          >
            {texto}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor={`${id}-valor`} className="mb-1 block text-[10px] text-gray-500">
          {descuento.modo === 'porcentaje' ? 'Descuento (%)' : 'Pagará por cuota (USD)'}
        </label>
        <input
          id={`${id}-valor`}
          type="number"
          min="0"
          max={descuento.modo === 'porcentaje' ? 100 : estandar}
          step="0.01"
          className="input-field"
          value={descuento.valor}
          onChange={(e) => cambiar('valor', e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${id}-motivo`} className="mb-1 block text-[10px] text-gray-500">Motivo</label>
        <select id={`${id}-motivo`} className="input-field" value={descuento.motivo} onChange={(e) => cambiar('motivo', e.target.value)}>
          {[...MOTIVOS_DESCUENTO, 'Otro'].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {descuento.motivo === 'Otro' && (
        <input
          aria-label="Otro motivo"
          className="input-field col-span-2"
          maxLength={255}
          placeholder="Describa el motivo"
          value={descuento.motivoOtro}
          onChange={(e) => cambiar('motivoOtro', e.target.value)}
        />
      )}
      {resultado && (
        <p className="col-span-2 text-[11px] text-[#10B981]">
          {`Pagará ${dinero(resultado.monto)} en lugar de ${dinero(estandar)} (${resultado.porcentaje}% de descuento).`}
        </p>
      )}
    </div>
  );
}
