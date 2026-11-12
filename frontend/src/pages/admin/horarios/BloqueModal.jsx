import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import Field from '../../../components/ui/Field';
import Modal from '../../../components/ui/Modal';
import {
  DIAS, eliminarBloque, guardarBloque, mensajeHorario,
} from '../../../services/horarios';

// Crear, editar o eliminar un bloque del horario semanal.
export default function BloqueModal({
  bloque, inicial, asignaciones, onClose, onGuardado,
}) {
  const [form, setForm] = useState({
    idAsignacion: String(bloque?.id_asignacion_curso || inicial?.idAsignacion || ''),
    dia: bloque?.dia_semana || inicial?.dia || DIAS[0],
    inicio: bloque?.inicio || inicial?.inicio || '07:30',
    fin: bloque?.fin || inicial?.fin || '08:20',
  });
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  function cambiar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }

  async function ejecutar(accion, mensaje) {
    setError('');
    setProcesando(true);
    try {
      await accion();
      onGuardado(mensaje);
    } catch (e) {
      setError(mensajeHorario(e));
      setProcesando(false);
    }
  }

  function guardar() {
    if (!form.idAsignacion) {
      setError('Seleccione la asignatura y el docente.');
      return;
    }
    if (form.inicio >= form.fin) {
      setError('La hora final debe ser posterior a la inicial.');
      return;
    }
    ejecutar(() => guardarBloque(bloque?.id, {
      id_asignacion_curso: Number(form.idAsignacion),
      dia_semana: form.dia,
      hora_inicio: form.inicio,
      hora_fin: form.fin,
    }), bloque ? 'Bloque actualizado.' : 'Bloque agregado al horario.');
  }

  return (
    <Modal
      titulo={bloque ? 'Editar bloque' : 'Nuevo bloque'}
      subtitulo="La base valida que el docente no tenga dos clases al mismo tiempo"
      ancho="max-w-lg"
      onClose={onClose}
      pie={(
        <>
          {bloque && (
            <Boton
              variante="secundario"
              className="mr-auto text-[#EF4444]"
              deshabilitado={procesando}
              onClick={() => ejecutar(() => eliminarBloque(bloque.id), 'Bloque eliminado.')}
            >
              <Trash2 size={12} />Eliminar
            </Boton>
          )}
          <Boton variante="secundario" onClick={onClose} deshabilitado={procesando}>Cancelar</Boton>
          <Boton onClick={guardar} deshabilitado={procesando}>{procesando ? 'Guardando...' : 'Guardar'}</Boton>
        </>
      )}
    >
      <Alerta>{error}</Alerta>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <Field id="bloque-asignacion" etiqueta="Asignatura — docente — sección">
            <select
              id="bloque-asignacion"
              className="input-field"
              value={form.idAsignacion}
              onChange={(e) => cambiar('idAsignacion', e.target.value)}
            >
              <option value="">Seleccione...</option>
              {asignaciones.map((a) => (
                <option key={a.id} value={a.id}>{`${a.asignatura} — ${a.docente} — ${a.grado} ${a.seccion}`}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field id="bloque-dia" etiqueta="Día">
          <select id="bloque-dia" className="input-field" value={form.dia} onChange={(e) => cambiar('dia', e.target.value)}>
            {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field id="bloque-inicio" etiqueta="Inicio">
          <input id="bloque-inicio" type="time" className="input-field" value={form.inicio} onChange={(e) => cambiar('inicio', e.target.value)} />
        </Field>
        <Field id="bloque-fin" etiqueta="Fin">
          <input id="bloque-fin" type="time" className="input-field" value={form.fin} onChange={(e) => cambiar('fin', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
