// Selector compacto para las barras de filtros; la primera opción vacía actúa como etiqueta.
export default function SelectFiltro({
  id, etiqueta, icono: Icono, valor, onChange, children,
}) {
  return (
    <div className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-line bg-base px-3 py-2">
      <Icono size={12} className="flex-shrink-0 text-gray-500" />
      <label htmlFor={id} className="sr-only">{etiqueta}</label>
      <select
        id={id}
        className="max-w-40 cursor-pointer bg-transparent text-xs text-gray-300 outline-none"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{etiqueta}</option>
        {children}
      </select>
    </div>
  );
}
