import COLORES from './colores';

export function KpiCard({
  icono: Icono, etiqueta, valor, detalle, destacado = false,
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-5 transition-all duration-150 hover:-translate-y-0.5
        ${destacado ? 'bg-brand-gradient border-transparent' : 'border-line bg-card'}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${destacado ? 'bg-white/20' : 'bg-line'}`}>
          <Icono size={18} className={destacado ? 'text-white' : 'text-brand-soft'} />
        </div>
      </div>
      <div>
        <p className="font-display text-2xl font-bold tracking-tight text-white">{valor}</p>
        <p className={`mt-0.5 text-sm ${destacado ? 'text-white/80' : 'text-gray-400'}`}>{etiqueta}</p>
        {detalle && <p className={`mt-1 text-xs ${destacado ? 'text-white/60' : 'text-gray-500'}`}>{detalle}</p>}
      </div>
    </div>
  );
}

export function ChartCard({ titulo, etiqueta, children }) {
  return (
    <div className="rounded-xl border border-line bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-white">{titulo}</p>
        {etiqueta && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand-soft">{etiqueta}</span>}
      </div>
      {children}
    </div>
  );
}

export function TooltipGrafico({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-base px-3 py-2 text-xs text-white">
      <p className="mb-1 font-semibold">{label ?? payload[0].name}</p>
      {payload.map((p) => <p key={p.dataKey ?? p.name} style={{ color: COLORES.brandSuave }}>{p.value}</p>)}
    </div>
  );
}

export function Leyenda({ items }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.nombre} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background: item.color }} />
          <span className="text-xs text-gray-300">{item.nombre}</span>
          <span className="ml-auto pl-3 text-xs font-semibold text-white">{item.valor}</span>
        </div>
      ))}
    </div>
  );
}

export function ItemAlerta({ alerta }) {
  const {
    icono: Icono, color, titulo, detalle, momento,
  } = alerta;
  return (
    <div className="flex gap-3 border-b border-line py-3 last:border-b-0">
      <div
        className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: `${color}22`, color }}
      >
        <Icono size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm leading-tight font-medium text-white">{titulo}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{detalle}</p>
        {momento && <p className="mt-1 text-xs text-brand-soft">{momento}</p>}
      </div>
      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
    </div>
  );
}
