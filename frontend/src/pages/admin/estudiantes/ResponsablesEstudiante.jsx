import { useEffect, useState } from 'react';
import {
  Plus, Star, UserPlus, X,
} from 'lucide-react';
import Buscador from '../../../components/ui/Buscador';
import Cargando from '../../../components/ui/Cargando';
import { mensajeError } from '../../../services/api';
import { obtenerExpediente } from '../../../services/estudiantes';
import { cargarResponsables } from '../../../services/responsables';
import { iniciales, nombreCompleto } from '../../../utils/formato';

// Responsables del estudiante dentro del formulario de edición: asociar existentes, quitar,
// elegir el contacto principal o crear uno nuevo. Los cambios se guardan junto con el estudiante.
export default function ResponsablesEstudiante({
  idEstudiante, seleccionados, onChange, onCrearNuevo, recargar,
}) {
  const [disponibles, setDisponibles] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [error, setError] = useState('');

  // Responsables registrados (para el buscador) y, la primera vez, los ya asociados al estudiante.
  useEffect(() => {
    let vigente = true;
    const actuales = seleccionados === null && idEstudiante
      ? obtenerExpediente(idEstudiante).then((d) => d.responsables)
      : Promise.resolve(null);
    Promise.all([cargarResponsables(), actuales])
      .then(([{ responsables }, asociados]) => {
        if (!vigente) return;
        setDisponibles(responsables);
        if (seleccionados === null) {
          onChange((asociados || []).map((r) => ({ ...r, es_contacto_principal: Boolean(r.es_contacto_principal) })));
        }
      })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudieron cargar los responsables.')); });
    return () => { vigente = false; };
    // Solo al abrir la sección o tras crear un responsable nuevo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEstudiante, recargar]);

  if (error) return <p className="col-span-2 text-xs text-[#EF4444]">{error}</p>;
  if (!disponibles || seleccionados === null) return <div className="col-span-2"><Cargando texto="Cargando responsables..." /></div>;

  const elegidos = new Set(seleccionados.map((r) => r.id));
  const termino = buscar.trim().toLowerCase();
  const candidatos = termino
    ? disponibles.filter((r) => !elegidos.has(r.id))
      .filter((r) => nombreCompleto(r).toLowerCase().includes(termino) || r.dui.includes(termino)
        || r.estudiantes.some((e) => nombreCompleto(e).toLowerCase().includes(termino)))
      .slice(0, 6)
    : [];

  function agregar(responsable) {
    onChange([...seleccionados, { ...responsable, es_contacto_principal: seleccionados.length === 0 }]);
    setBuscar('');
  }

  // Solo uno puede ser contacto principal del estudiante.
  function marcarPrincipal(id) {
    onChange(seleccionados.map((r) => ({
      ...r, es_contacto_principal: r.id === id ? !r.es_contacto_principal : false,
    })));
  }

  return (
    <div className="col-span-2 space-y-2">
      {seleccionados.length === 0 && (
        <p className="rounded-lg border border-dashed border-line px-3 py-3 text-center text-xs text-gray-500">
          Sin responsables asociados. Busque uno registrado o cree uno nuevo.
        </p>
      )}
      {seleccionados.map((r) => (
        <div key={r.id} className="flex items-center gap-3 rounded-lg border border-line bg-base px-3 py-2">
          <div className="bg-brand-dark flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
            {iniciales(r.nombres, r.apellidos)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xs font-semibold text-white">{nombreCompleto(r)}</p>
            <p className="text-[10px] text-gray-500">{[r.parentesco?.trim(), r.telefono, r.dui].filter(Boolean).join(' · ')}</p>
          </div>
          <button
            type="button"
            onClick={() => marcarPrincipal(r.id)}
            aria-pressed={r.es_contacto_principal}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${r.es_contacto_principal
              ? 'bg-[#F59E0B20] text-[#F59E0B]' : 'bg-line text-gray-500 hover:text-gray-300'}`}
          >
            <Star size={10} fill={r.es_contacto_principal ? 'currentColor' : 'none'} />Contacto principal
          </button>
          <button
            type="button"
            onClick={() => onChange(seleccionados.filter((x) => x.id !== r.id))}
            aria-label={`Quitar a ${nombreCompleto(r)}`}
            className="rounded-lg p-1 text-gray-500 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
          >
            <X size={13} />
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <Buscador
          id="buscar-responsable-estudiante"
          etiqueta="Buscar responsable"
          placeholder="Asociar responsable: nombre, DUI o nombre de un hermano..."
          valor={buscar}
          onChange={setBuscar}
        />
        <button
          type="button"
          onClick={onCrearNuevo}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/10 px-3 font-display text-[11px]
            font-semibold text-brand-soft hover:bg-brand/20"
        >
          <UserPlus size={12} />Crear nuevo
        </button>
      </div>
      {termino && (
        <div className="overflow-hidden rounded-lg border border-line">
          {candidatos.length === 0 && <p className="px-3 py-3 text-center text-xs text-gray-500">Sin resultados. Puede crear un responsable nuevo.</p>}
          {candidatos.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => agregar(r)}
              className="flex w-full items-center gap-2 border-b border-line bg-card px-3 py-2 text-left text-xs last:border-b-0 hover:bg-line/50"
            >
              <Plus size={12} className="text-brand-soft" />
              <span className="flex-1 text-gray-200">{nombreCompleto(r)}</span>
              <span className="truncate text-[10px] text-gray-500">
                {r.estudiantes.length ? `A cargo de ${r.estudiantes.map(nombreCompleto).join(', ')}` : r.dui}
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="text-[10px] text-gray-500">Los cambios se guardan al guardar el estudiante.</p>
    </div>
  );
}
