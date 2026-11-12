import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const TIPOS = {
  error: { icono: AlertCircle, color: '#EF4444' },
  exito: { icono: CheckCircle, color: '#10B981' },
};

// Visible dentro de la ventana y de cada contenedor con scroll que lo envuelve (p. ej. el cuerpo de un modal).
function estaVisible(elemento) {
  const { top, bottom } = elemento.getBoundingClientRect();
  if (top < 0 || bottom > window.innerHeight) return false;
  for (let padre = elemento.parentElement; padre; padre = padre.parentElement) {
    if (padre.scrollHeight > padre.clientHeight && /auto|scroll/.test(getComputedStyle(padre).overflowY)) {
      const limites = padre.getBoundingClientRect();
      if (top < limites.top || bottom > limites.bottom) return false;
    }
  }
  return true;
}

// Los errores se desplazan a la vista al aparecer, para que se lean aunque el formulario sea largo.
export default function Alerta({ tipo = 'error', children }) {
  const contenedor = useRef(null);
  const texto = typeof children === 'string' ? children : Boolean(children);

  useEffect(() => {
    const elemento = contenedor.current;
    if (tipo !== 'error' || !texto || !elemento?.scrollIntoView) return undefined;
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    elemento.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'center' });
    // Si el navegador no animó el desplazamiento (pestaña en segundo plano), salta directo al error.
    const respaldo = setTimeout(() => {
      if (!estaVisible(elemento)) elemento.scrollIntoView({ block: 'center' });
    }, 350);
    return () => clearTimeout(respaldo);
  }, [tipo, texto]);

  if (!children) return null;
  const { icono: Icono, color } = TIPOS[tipo];
  return (
    <div
      ref={contenedor}
      role={tipo === 'error' ? 'alert' : 'status'}
      className="flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs"
      style={{ background: `${color}15`, borderColor: `${color}40`, color }}
    >
      <Icono size={14} className="mt-px flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}
