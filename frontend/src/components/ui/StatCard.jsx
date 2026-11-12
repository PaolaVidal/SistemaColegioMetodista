// Tarjeta compacta de indicador, usada en las barras de estadísticas.
export default function StatCard({
  icono: Icono, etiqueta, valor, color,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}20` }}>
        <Icono size={15} style={{ color }} />
      </div>
      <div>
        <p className="font-display text-xl font-bold text-white">{valor}</p>
        <p className="text-[11px] text-gray-400">{etiqueta}</p>
      </div>
    </div>
  );
}
