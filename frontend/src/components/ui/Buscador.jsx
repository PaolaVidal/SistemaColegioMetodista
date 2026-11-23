import { Search, X } from 'lucide-react';

export default function Buscador({
  id, valor, onChange, placeholder, etiqueta = 'Buscar',
}) {
  return (
    <div className="flex min-w-52 flex-1 items-center gap-2 rounded-lg border border-line bg-base px-3 py-2">
      <Search size={13} className="flex-shrink-0 text-gray-500" />
      <label htmlFor={id} className="sr-only">{etiqueta}</label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-xs text-white placeholder-gray-600 outline-none"
      />
      {valor && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange('')}
          className="text-gray-500 hover:text-gray-300"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
