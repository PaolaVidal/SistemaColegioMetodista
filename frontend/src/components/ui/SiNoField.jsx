// Selector Sí/No con el estilo de los prototipos.
export default function SiNoField({
  etiqueta, valor, onChange, deshabilitado = false,
}) {
  return (
    <fieldset disabled={deshabilitado}>
      <legend className="mb-1.5 block font-display text-[11px] font-medium text-gray-400">{etiqueta}</legend>
      <div className="flex gap-2">
        {[true, false].map((opcion) => {
          const activo = valor === opcion;
          const color = opcion ? '#10B981' : '#EF4444';
          return (
            <button
              key={String(opcion)}
              type="button"
              onClick={() => onChange(opcion)}
              aria-pressed={activo}
              className="flex-1 rounded-lg border py-2 font-display text-xs font-medium transition-all disabled:opacity-60"
              style={{
                background: activo ? `${color}20` : 'var(--color-base)',
                borderColor: activo ? color : 'var(--color-line)',
                color: activo ? color : '#6B7280',
              }}
            >
              {opcion ? 'Sí' : 'No'}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
