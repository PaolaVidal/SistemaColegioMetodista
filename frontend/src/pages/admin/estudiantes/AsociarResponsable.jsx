import { useEffect, useState } from 'react';
import { Check, UserPlus } from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import Buscador from '../../../components/ui/Buscador';
import Cargando from '../../../components/ui/Cargando';
import Modal from '../../../components/ui/Modal';
import { mensajeError } from '../../../services/api';
import { cargarResponsables, vincularEstudiante } from '../../../services/responsables';
import { iniciales, nombreCompleto } from '../../../utils/formato';

// Busca un responsable ya registrado y le asocia el estudiante.
export default function AsociarResponsable({
  estudiante, onClose, onAsociado, onCrearNuevo,
}) {
  const [responsables, setResponsables] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [elegido, setElegido] = useState(null);
  const [principal, setPrincipal] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vigente = true;
    cargarResponsables()
      .then((d) => { if (vigente) setResponsables(d.responsables); })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudieron cargar los responsables.')); });
    return () => { vigente = false; };
  }, []);

  const termino = buscar.trim().toLowerCase();
  const lista = (responsables || [])
    .filter((r) => !r.estudiantes.some((e) => e.id === estudiante.id))
    .filter((r) => !termino || nombreCompleto(r).toLowerCase().includes(termino) || r.dui.includes(termino)
      || r.estudiantes.some((e) => nombreCompleto(e).toLowerCase().includes(termino)))
    .slice(0, 30);

  async function asociar() {
    setError('');
    setGuardando(true);
    try {
      await vincularEstudiante(elegido.id, estudiante.id, principal);
      onAsociado(nombreCompleto(elegido));
    } catch (e) {
      setError(mensajeError(e, 'No se pudo asociar el responsable.'));
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo="Asociar responsable existente"
      subtitulo={`Estudiante: ${nombreCompleto(estudiante)}`}
      ancho="max-w-xl"
      onClose={onClose}
      pie={(
        <>
          <Boton variante="secundario" className="mr-auto" onClick={onCrearNuevo} deshabilitado={guardando}>
            <UserPlus size={12} />Crear nuevo responsable
          </Boton>
          <Boton variante="secundario" onClick={onClose} deshabilitado={guardando}>Volver</Boton>
          <Boton onClick={asociar} deshabilitado={!elegido || guardando}>{guardando ? 'Asociando...' : 'Asociar'}</Boton>
        </>
      )}
    >
      <Alerta>{error}</Alerta>
      <Buscador
        id="buscar-responsable-asociar"
        etiqueta="Buscar responsable"
        placeholder="Buscar por nombre, DUI o nombre de otro hijo..."
        valor={buscar}
        onChange={setBuscar}
      />
      {!responsables && !error && <Cargando texto="Cargando responsables..." />}
      <div className="max-h-72 space-y-1.5 overflow-y-auto">
        {responsables && lista.length === 0 && (
          <p className="py-6 text-center text-xs text-gray-500">No hay coincidencias. Puede crear un nuevo responsable.</p>
        )}
        {lista.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={elegido?.id === r.id}
            onClick={() => setElegido(r)}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all
              ${elegido?.id === r.id ? 'border-brand bg-brand/10' : 'border-line bg-card hover:border-brand/40'}`}
          >
            <div className="bg-brand-dark flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
              {iniciales(r.nombres, r.apellidos)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xs font-semibold text-white">
                {nombreCompleto(r)}
                <span className="ml-2 font-mono text-[10px] font-normal text-gray-500">{r.dui}</span>
              </p>
              <p className="truncate text-[10px] text-gray-500">
                {r.estudiantes.length ? `A cargo de: ${r.estudiantes.map(nombreCompleto).join(', ')}` : 'Sin estudiantes asociados'}
              </p>
            </div>
            {elegido?.id === r.id && <Check size={14} className="text-brand-soft" />}
          </button>
        ))}
      </div>
      {elegido && (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300">
          <input type="checkbox" className="accent-[#c2416b]" checked={principal} onChange={(e) => setPrincipal(e.target.checked)} />
          Marcar como contacto principal del estudiante
        </label>
      )}
    </Modal>
  );
}
