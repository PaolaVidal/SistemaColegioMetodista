// Contenedor de etiqueta para controles de formulario. `id` debe coincidir con el del control.
export default function Field({
  id, etiqueta, children, ancho = 1,
}) {
  const columnas = { 1: '', 2: 'col-span-2' };
  return (
    <div className={columnas[ancho]}>
      <label htmlFor={id} className="mb-1.5 block font-display text-[11px] font-medium text-gray-400">
        {etiqueta}
      </label>
      {children}
    </div>
  );
}
