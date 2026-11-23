// Botón cuadrado con solo ícono para acciones de fila (editar, eliminar, activar...).
export default function BotonIcono({
  icono: Icono, etiqueta, color = '#9CA3AF', onClick, deshabilitado = false, tamano = 14,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      title={etiqueta}
      aria-label={etiqueta}
      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
      onMouseEnter={(e) => { e.currentTarget.style.color = color; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
    >
      <Icono size={tamano} />
    </button>
  );
}
