import { useState } from 'react';
import { Plus, Star, X } from 'lucide-react';
import Buscador from '../../../components/ui/Buscador';
import { iniciales, nombreCompleto } from '../../../utils/formato';

// Lista de estudiantes a cargo del responsable, con buscador para agregar más (ej. varios hijos).
export default function SelectorEstudiantes({ estudiantes, seleccionados, onChange }) {
  const [buscar, setBuscar] = useState('');
  const elegidos = new Set(seleccionados.map((s) => s.id));
  const termino = buscar.trim().toLowerCase();
  const candidatos = termino
    ? estudiantes
      .filter((e) => !elegidos.has(e.id))
      .filter((e) => nombreCompleto(e).toLowerCase().includes(termino) || e.codigo_nie.toLowerCase().includes(termino))
      .slice(0, 6)
    : [];

  function agregar(estudiante) {
    onChange([...seleccionados, { ...estudiante, es_contacto_principal: seleccionados.length === 0 }]);
    setBuscar('');
  }

  function alternarPrincipal(id) {
    onChange(seleccionados.map((s) => (s.id === id ? { ...s, es_contacto_principal: !s.es_contacto_principal } : s)));
  }

  return (
    <div className="col-span-2 space-y-2">
      {seleccionados.length === 0 && (
        <p className="rounded-lg border border-dashed border-line px-3 py-3 text-center text-xs text-gray-500">
          Aún no tiene estudiantes asociados. Búsquelos por nombre o NIE para agregarlos.
        </p>
      )}
      {seleccionados.map((s) => (
        <div key={s.id} className="flex items-center gap-3 rounded-lg border border-line bg-base px-3 py-2">
          <div className="bg-brand-dark flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
            {iniciales(s.nombres, s.apellidos)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xs font-semibold text-white">{nombreCompleto(s)}</p>
            <p className="font-mono text-[10px] text-gray-500">{s.codigo_nie}</p>
          </div>
          <button
            type="button"
            onClick={() => alternarPrincipal(s.id)}
            aria-pressed={s.es_contacto_principal}
            title="El contacto principal recibe los avisos del colegio sobre este estudiante"
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition-colors ${s.es_contacto_principal
              ? 'bg-[#F59E0B20] text-[#F59E0B]' : 'bg-line text-gray-500 hover:text-gray-300'}`}
          >
            <Star size={10} fill={s.es_contacto_principal ? 'currentColor' : 'none'} />Contacto principal
          </button>
          <button
            type="button"
            onClick={() => onChange(seleccionados.filter((x) => x.id !== s.id))}
            aria-label={`Quitar a ${nombreCompleto(s)}`}
            className="rounded-lg p-1 text-gray-500 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
          >
            <X size={13} />
          </button>
        </div>
      ))}

      <Buscador
        id="buscar-estudiante-responsable"
        etiqueta="Buscar estudiante para asociar"
        placeholder="Agregar estudiante: buscar por nombre o NIE..."
        valor={buscar}
        onChange={setBuscar}
      />
      {termino && (
        <div className="overflow-hidden rounded-lg border border-line">
          {candidatos.length === 0 && <p className="px-3 py-3 text-center text-xs text-gray-500">Sin resultados</p>}
          {candidatos.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => agregar(e)}
              className="flex w-full items-center gap-2 border-b border-line bg-card px-3 py-2 text-left text-xs last:border-b-0 hover:bg-line/50"
            >
              <Plus size={12} className="text-brand-soft" />
              <span className="flex-1 text-gray-200">{nombreCompleto(e)}</span>
              <span className="font-mono text-[10px] text-gray-500">{e.codigo_nie}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
