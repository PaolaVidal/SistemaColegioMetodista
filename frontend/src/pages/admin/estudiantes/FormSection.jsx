import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FormSection({
  titulo, icono: Icono, children, abiertaInicial = true,
}) {
  const [abierta, setAbierta] = useState(abiertaInicial);
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <button
        type="button"
        onClick={() => setAbierta(!abierta)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between bg-base px-4 py-3 transition-colors hover:bg-line/40"
      >
        <span className="flex items-center gap-2.5">
          <Icono size={14} className="text-brand-soft" />
          <span className="font-display text-xs font-semibold text-white">{titulo}</span>
        </span>
        {abierta ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>
      {abierta && <div className="grid grid-cols-2 gap-3 bg-card p-4">{children}</div>}
    </div>
  );
}
