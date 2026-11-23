import { ChevronLeft, ChevronRight } from 'lucide-react';

const VISIBLES = 7;

// Pie de tabla con el rango mostrado y botones de página (máximo 7 visibles).
export default function Paginacion({
  pagina, totalPaginas, total, porPagina, onCambiar, unidad = 'resultados',
}) {
  const inicio = Math.max(1, Math.min(pagina - 3, totalPaginas - VISIBLES + 1));
  const paginas = Array.from({ length: Math.min(totalPaginas, VISIBLES) }, (_, i) => inicio + i);

  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3">
      <p className="text-xs text-gray-500">
        {total === 0
          ? `0 ${unidad}`
          : `Mostrando ${(pagina - 1) * porPagina + 1}–${Math.min(pagina * porPagina, total)} de ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          onClick={() => onCambiar(Math.max(1, pagina - 1))}
          disabled={pagina === 1}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-line hover:text-white disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        {paginas.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onCambiar(p)}
            aria-current={p === pagina ? 'page' : undefined}
            className={`h-7 w-7 rounded-lg font-display text-xs font-medium transition-all
              ${p === pagina ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          aria-label="Página siguiente"
          onClick={() => onCambiar(Math.min(totalPaginas, pagina + 1))}
          disabled={pagina === totalPaginas}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-line hover:text-white disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// Calcula la página válida y las filas visibles de una lista.
export function paginar(lista, pagina, porPagina) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
  const actual = Math.min(pagina, totalPaginas);
  return {
    pagina: actual,
    totalPaginas,
    filas: lista.slice((actual - 1) * porPagina, actual * porPagina),
  };
}
