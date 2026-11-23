import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Modales abiertos, del más antiguo al más reciente: Escape cierra solo el de encima.
const abiertos = [];

export default function Modal({
  titulo, subtitulo, onClose, children, pie, ancho = 'max-w-2xl',
}) {
  const identidad = useRef(Symbol('modal'));
  const cerrar = useRef(onClose);
  cerrar.current = onClose;

  useEffect(() => {
    const propio = identidad.current;
    abiertos.push(propio);
    function alPresionar(evento) {
      if (evento.key === 'Escape' && abiertos[abiertos.length - 1] === propio) cerrar.current();
    }
    window.addEventListener('keydown', alPresionar);
    return () => {
      window.removeEventListener('keydown', alPresionar);
      abiertos.splice(abiertos.indexOf(propio), 1);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`my-6 w-full ${ancho} overflow-hidden rounded-2xl border border-line bg-base shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-base font-bold text-white">{titulo}</h2>
            {subtitulo && <p className="mt-0.5 text-xs text-gray-500">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-line hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">{children}</div>
        {pie && <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">{pie}</div>}
      </div>
    </div>
  );
}
