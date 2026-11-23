import { useEffect } from 'react';
import { X } from 'lucide-react';

// Panel lateral derecho para detalles (historial de pagos, asistencia, etc.).
export default function Drawer({
  titulo, subtitulo, encabezado, onClose, children,
}) {
  useEffect(() => {
    function alPresionar(evento) {
      if (evento.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex bg-black/65">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-line bg-base"
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-6 py-5">
          <div className="flex items-center gap-3">
            {encabezado}
            <div>
              <p className="font-display font-bold text-white">{titulo}</p>
              {subtitulo && <p className="text-xs text-gray-500">{subtitulo}</p>}
            </div>
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
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
