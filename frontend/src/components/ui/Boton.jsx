const VARIANTES = {
  primario: 'bg-brand-gradient text-white hover:opacity-90',
  secundario: 'border border-line text-gray-400 hover:text-white hover:bg-line',
  peligro: 'bg-[#EF4444] text-white hover:opacity-90',
};

export default function Boton({
  children, onClick, variante = 'primario', tipo = 'button', deshabilitado = false, className = '',
}) {
  return (
    <button
      // eslint-disable-next-line react/button-has-type
      type={tipo}
      onClick={onClick}
      disabled={deshabilitado}
      className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 font-display text-xs font-semibold
        transition-all disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </button>
  );
}
