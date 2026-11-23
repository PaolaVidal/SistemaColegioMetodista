// Etiqueta redondeada con color de estado (texto + fondo translúcido).
export default function Pill({ color, icono: Icono, children }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
      style={{ background: `${color}20`, color }}
    >
      {Icono && <Icono size={10} />}
      {children}
    </span>
  );
}
