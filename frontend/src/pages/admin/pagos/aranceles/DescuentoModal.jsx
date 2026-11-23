import { useState } from 'react';
import { Check } from 'lucide-react';
import Alerta from '../../../../components/ui/Alerta';
import Boton from '../../../../components/ui/Boton';
import Buscador from '../../../../components/ui/Buscador';
import Field from '../../../../components/ui/Field';
import Modal from '../../../../components/ui/Modal';
import { guardarDescuento } from '../../../../services/aranceles';
import { mensajeError } from '../../../../services/api';
import { dinero, nombreCiclo, nombreCompleto } from '../../../../utils/formato';
import EditorDescuento, {
  datosDescuento, descuentoDesde, validarDescuento,
} from './EditorDescuento';

// Crear o editar un descuento o beca de un estudiante sobre un arancel.
export default function DescuentoModal({
  registro, datos, onClose, onGuardado,
}) {
  const [estudiante, setEstudiante] = useState(registro?.estudiante || null);
  const [buscar, setBuscar] = useState('');
  const [idArancel, setIdArancel] = useState(String(registro?.id_arancel || ''));
  const [descuento, setDescuento] = useState(() => descuentoDesde(registro));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const termino = buscar.trim().toLowerCase();
  const candidatos = termino
    ? datos.estudiantes
      .filter((e) => nombreCompleto(e).toLowerCase().includes(termino) || e.codigo_nie.includes(termino))
      .slice(0, 8)
    : [];
  const ocupados = new Set(datos.descuentos
    .filter((d) => d.id_estudiante === estudiante?.id && d.id !== registro?.id).map((d) => d.id_arancel));
  const aranceles = datos.aranceles.filter((a) => a.ciclo?.activo || a.id === registro?.id_arancel);
  const arancel = datos.aranceles.find((a) => String(a.id) === idArancel);
  const pendientes = estudiante && arancel ? datos.pendientes[`${estudiante.id}-${arancel.id}`] || 0 : 0;

  async function guardar() {
    if (!estudiante || !arancel) {
      setError('Seleccione el estudiante y el arancel.');
      return;
    }
    const problema = validarDescuento(descuento);
    if (problema) {
      setError(problema);
      return;
    }
    setError('');
    setGuardando(true);
    try {
      await guardarDescuento(registro?.id, {
        id_estudiante: estudiante.id, id_arancel: arancel.id, ...datosDescuento(descuento),
      });
      onGuardado(`Descuento guardado para ${nombreCompleto(estudiante)}.${pendientes ? ` Se ajustaron ${pendientes} cuota(s) pendientes.` : ''}`);
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar el descuento.'));
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={registro ? 'Editar descuento' : 'Nuevo descuento o beca'}
      subtitulo="Se aplica a las cuotas pendientes y a las que se generen al matricular"
      ancho="max-w-lg"
      onClose={onClose}
      pie={(
        <>
          <Boton variante="secundario" onClick={onClose} deshabilitado={guardando}>Cancelar</Boton>
          <Boton onClick={guardar} deshabilitado={guardando}>{guardando ? 'Guardando...' : 'Guardar descuento'}</Boton>
        </>
      )}
    >
      <Alerta>{error}</Alerta>
      <p className="font-display text-[11px] font-medium text-gray-400">Estudiante *</p>
      {estudiante ? (
        <div className="flex items-center justify-between rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-xs">
          <span className="flex items-center gap-2 text-white"><Check size={13} className="text-brand-soft" />{nombreCompleto(estudiante)}</span>
          {!registro && <button type="button" className="text-gray-400 hover:text-white" onClick={() => setEstudiante(null)}>Cambiar</button>}
        </div>
      ) : (
        <>
          <Buscador id="desc-buscar" etiqueta="Buscar estudiante" placeholder="Buscar por nombre o NIE..." valor={buscar} onChange={setBuscar} />
          <div className="space-y-1">
            {candidatos.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => { setEstudiante(e); setBuscar(''); }}
                className="flex w-full items-center justify-between rounded-lg border border-line bg-card px-3 py-2 text-left text-xs hover:border-brand/40"
              >
                <span className="text-gray-200">{nombreCompleto(e)}</span>
                <span className="font-mono text-[10px] text-gray-500">{e.codigo_nie}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <Field id="desc-arancel" etiqueta="Arancel *">
        <select id="desc-arancel" className="input-field" value={idArancel} onChange={(e) => setIdArancel(e.target.value)} disabled={Boolean(registro)}>
          <option value="">Seleccione...</option>
          {aranceles.map((a) => (
            <option key={a.id} value={a.id} disabled={ocupados.has(a.id)}>
              {`${a.nombre_concepto} — ${dinero(a.monto_estandar)} (${nombreCiclo(a.ciclo)})${ocupados.has(a.id) ? ' · ya tiene descuento' : ''}`}
            </option>
          ))}
        </select>
      </Field>

      {arancel && <EditorDescuento id="desc" estandar={Number(arancel.monto_estandar)} descuento={descuento} onChange={setDescuento} />}
      {arancel && estudiante && (
        <p className="text-[11px] text-gray-500">
          {pendientes ? `Se ajustarán ${pendientes} cuota(s) aún no pagadas de este arancel.` : 'El estudiante no tiene cuotas pendientes de este arancel; se aplicará a las que se generen.'}
        </p>
      )}
    </Modal>
  );
}
