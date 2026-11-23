import { useState } from 'react';
import {
  Calendar, GraduationCap, Layers, Pencil,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import Field from '../../../components/ui/Field';
import Modal from '../../../components/ui/Modal';
import Pill from '../../../components/ui/Pill';
import { mensajeError } from '../../../services/api';
import { actualizarMatricula } from '../../../services/matriculas';
import {
  fechaCorta, iniciales, nombreCiclo, nombreCompleto,
} from '../../../utils/formato';
import { ESTADOS_MATRICULA, codigoMatricula } from './estados';

function Encabezado({ matricula }) {
  const { color, icono } = ESTADOS_MATRICULA[matricula.estadoTexto];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card p-4">
      <div className="bg-brand-gradient flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white">
        {iniciales(matricula.estudiante?.nombres, matricula.estudiante?.apellidos)}
      </div>
      <div className="flex-1">
        <p className="font-display text-sm font-bold text-white">{nombreCompleto(matricula.estudiante)}</p>
        <p className="font-mono text-[11px] text-gray-500">{matricula.estudiante?.codigo_nie}</p>
      </div>
      <Pill color={color} icono={icono}>{matricula.estadoTexto}</Pill>
    </div>
  );
}

export default function MatriculaModal({
  modo, matricula, secciones, onClose, onEditar, onGuardado,
}) {
  const [idSeccion, setIdSeccion] = useState(String(matricula.id_seccion));
  const [activa, setActiva] = useState(Boolean(matricula.estado));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const seccionesCiclo = secciones
    .filter((s) => s.id_ciclo === matricula.id_ciclo)
    .sort((a, b) => a.id_grado - b.id_grado || a.nombre.localeCompare(b.nombre));

  async function guardar() {
    setError('');
    setGuardando(true);
    try {
      await actualizarMatricula(matricula.id, { id_seccion: Number(idSeccion), estado: activa });
      onGuardado('Matrícula actualizada correctamente.');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo actualizar la matrícula.'));
      setGuardando(false);
    }
  }

  if (modo === 'ver') {
    const filas = [
      { icono: Calendar, etiqueta: 'Ciclo', valor: nombreCiclo(matricula.ciclo) },
      { icono: GraduationCap, etiqueta: 'Grado', valor: matricula.grado },
      { icono: Layers, etiqueta: 'Sección', valor: `Sección ${matricula.seccion}` },
      { icono: Calendar, etiqueta: 'Fecha de matrícula', valor: fechaCorta(matricula.fecha_matricula) },
    ];
    return (
      <Modal
        titulo="Detalle de matrícula"
        subtitulo={codigoMatricula(matricula)}
        ancho="max-w-lg"
        onClose={onClose}
        pie={(
          <>
            <Boton variante="secundario" onClick={onClose}>Cerrar</Boton>
            <Boton onClick={onEditar}><Pencil size={12} />Editar</Boton>
          </>
        )}
      >
        <Encabezado matricula={matricula} />
        <div className="overflow-hidden rounded-xl border border-line">
          {filas.map((fila) => (
            <div key={fila.etiqueta} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
              <fila.icono size={13} className="text-brand-soft" />
              <span className="w-36 flex-shrink-0 text-xs text-gray-500">{fila.etiqueta}</span>
              <span className="text-xs font-medium text-white">{fila.valor}</span>
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      titulo="Editar matrícula"
      subtitulo={codigoMatricula(matricula)}
      ancho="max-w-lg"
      onClose={onClose}
      pie={(
        <>
          <Boton variante="secundario" onClick={onClose} deshabilitado={guardando}>Cancelar</Boton>
          <Boton onClick={guardar} deshabilitado={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Boton>
        </>
      )}
    >
      <Encabezado matricula={matricula} />
      <Alerta>{error}</Alerta>
      <div className="grid grid-cols-2 gap-3">
        <Field id="editar-seccion" etiqueta={`Grado y sección (${nombreCiclo(matricula.ciclo)})`} ancho={2}>
          <select id="editar-seccion" className="input-field" value={idSeccion} onChange={(e) => setIdSeccion(e.target.value)}>
            {seccionesCiclo.map((s) => (
              <option key={s.id} value={s.id}>{`${s.grado} — Sección ${s.nombre} (${s.ocupados}/${s.capacidad ?? '∞'})`}</option>
            ))}
          </select>
        </Field>
        <Field id="editar-estado-matricula" etiqueta="Estado" ancho={2}>
          <select
            id="editar-estado-matricula"
            className="input-field"
            value={activa ? '1' : '0'}
            onChange={(e) => setActiva(e.target.value === '1')}
          >
            <option value="1">{matricula.ciclo?.activo ? 'Activa' : 'Finalizada (vigente)'}</option>
            <option value="0">Anulada</option>
          </select>
        </Field>
      </div>
      <p className="text-[11px] text-gray-600">
        Anular la matrícula retira al estudiante de las listas de asistencia y calificaciones de la sección.
      </p>
    </Modal>
  );
}
