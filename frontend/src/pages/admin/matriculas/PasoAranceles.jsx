import { BadgePercent, Check, X } from 'lucide-react';
import { TIPOS_COBRO, calcularDescuento, mesesACobrar } from '../../../services/aranceles';
import { dinero } from '../../../utils/formato';
import EditorDescuento, {
  datosDescuento, descuentoDesde, descuentoVacio, validarDescuento,
} from '../pagos/aranceles/EditorDescuento';

// Estado inicial: todos los aranceles del ciclo incluidos y los descuentos que el estudiante ya tenga.
export function inicializarCobros(aranceles, descuentos, idEstudiante) {
  return Object.fromEntries(aranceles.map((a) => {
    const existente = descuentos.find((d) => d.id_estudiante === idEstudiante && d.id_arancel === a.id);
    return [a.id, {
      incluido: true,
      tieneDescuento: Boolean(existente),
      existente: Boolean(existente),
      descuento: existente ? descuentoDesde(existente) : descuentoVacio(),
    }];
  }));
}

// Monto por cuota, número de cuotas y subtotal de cada arancel incluido.
export function resumenCobros(aranceles, cobros, ciclo) {
  return aranceles.filter((a) => cobros[a.id]?.incluido).map((a) => {
    const cobro = cobros[a.id];
    const estandar = Number(a.monto_estandar);
    const monto = cobro.tieneDescuento && cobro.descuento.valor !== ''
      ? calcularDescuento(estandar, cobro.descuento).monto : estandar;
    const cuotas = mesesACobrar(a, ciclo).length;
    return {
      arancel: a, monto, estandar, cuotas, subtotal: Math.round(monto * cuotas * 100) / 100,
    };
  });
}

export function errorCobros(cobros) {
  const conProblema = Object.values(cobros)
    .find((c) => c.incluido && c.tieneDescuento && validarDescuento(c.descuento));
  return conProblema ? validarDescuento(conProblema.descuento) : '';
}

// Lo que espera /api/inscripciones: aranceles incluidos y, por arancel, el descuento nuevo,
// null para quitar uno existente u omitido para dejarlo como está.
export function datosAranceles(aranceles, cobros) {
  return aranceles.filter((a) => cobros[a.id]?.incluido).map((a) => {
    const cobro = cobros[a.id];
    if (cobro.tieneDescuento) return { id: a.id, descuento: datosDescuento(cobro.descuento) };
    if (cobro.existente) return { id: a.id, descuento: null };
    return { id: a.id };
  });
}

export default function PasoAranceles({
  aranceles, cobros, ciclo, onChange,
}) {
  function cambiar(id, cambios) {
    onChange({ ...cobros, [id]: { ...cobros[id], ...cambios } });
  }

  const resumen = resumenCobros(aranceles, cobros, ciclo);
  const total = resumen.reduce((s, r) => s + r.subtotal, 0);

  if (aranceles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-xs text-gray-500">
        Este ciclo no tiene aranceles. Puede crearlos en Pagos → Aranceles; la matrícula se registrará sin cobros.
      </p>
    );
  }

  return (
    <>
      <p className="text-xs text-gray-400">
        Elija los aranceles que pagará el estudiante. Se crearán sus cuotas pendientes;
        puede aplicar un descuento o beca a cada uno.
      </p>
      {aranceles.map((a) => {
        const cobro = cobros[a.id];
        const cuotas = mesesACobrar(a, ciclo).length;
        return (
          <div key={a.id} className={`rounded-xl border p-3 transition-colors ${cobro.incluido ? 'border-brand/40 bg-brand/5' : 'border-line bg-card opacity-60'}`}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                aria-label={`Cobrar ${a.nombre_concepto}`}
                className="accent-[#c2416b]"
                checked={cobro.incluido}
                onChange={(e) => cambiar(a.id, { incluido: e.target.checked })}
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-white">{a.nombre_concepto}</p>
                <p className="text-[11px] text-gray-500">
                  {`${TIPOS_COBRO[a.tipo_cobro]} · ${dinero(a.monto_estandar)}${a.tipo_cobro === 'mensual' ? ` × ${cuotas} cuota(s)` : ''} · vence el día ${a.dia_vencimiento_mes}`}
                  {Number(a.recargo_mora) > 0 && ` · mora ${dinero(a.recargo_mora)}`}
                </p>
              </div>
              {cobro.incluido && (
                <button
                  type="button"
                  onClick={() => cambiar(a.id, { tieneDescuento: !cobro.tieneDescuento })}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${cobro.tieneDescuento
                    ? 'bg-[#EF444415] text-[#EF4444]' : 'bg-[#10B98115] text-[#10B981]'}`}
                >
                  {cobro.tieneDescuento ? <X size={11} /> : <BadgePercent size={11} />}
                  {cobro.tieneDescuento ? 'Quitar descuento' : 'Agregar descuento'}
                </button>
              )}
            </div>
            {cobro.incluido && cobro.tieneDescuento && (
              <div className="mt-3 border-t border-line pt-3">
                {cobro.existente && <p className="mb-2 text-[10px] text-gray-500">El estudiante ya tenía este descuento registrado.</p>}
                <EditorDescuento
                  id={`desc-${a.id}`}
                  estandar={Number(a.monto_estandar)}
                  descuento={cobro.descuento}
                  onChange={(descuento) => cambiar(a.id, { descuento })}
                />
              </div>
            )}
          </div>
        );
      })}
      <div className="flex items-center justify-between rounded-lg border border-line bg-card px-4 py-2 text-xs">
        <span className="flex items-center gap-1.5 text-gray-400"><Check size={12} className="text-brand-soft" />{`${resumen.reduce((s, r) => s + r.cuotas, 0)} cuota(s) a generar`}</span>
        <span className="font-display font-bold text-white">{`Total del ciclo: ${dinero(total)}`}</span>
      </div>
    </>
  );
}
