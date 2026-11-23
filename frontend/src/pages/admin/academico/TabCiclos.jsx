import { useState } from 'react';
import {
  Calendar, Pencil, PlayCircle, Plus, StopCircle, Trash2,
} from 'lucide-react';
import BotonIcono from '../../../components/ui/BotonIcono';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Field from '../../../components/ui/Field';
import ModalFormulario from '../../../components/ui/ModalFormulario';
import Pill from '../../../components/ui/Pill';
import SectionTitle from '../../../components/ui/SectionTitle';
import { activarCiclo } from '../../../services/academico';
import { mensajeError } from '../../../services/api';
import {
  actualizar, crear, eliminar,
} from '../../../services/recursos';
import { fechaCorta, nombreCiclo } from '../../../utils/formato';

const COLOR_ESTADO = { Activo: '#c2416b', Planificado: '#A78BFA', Finalizado: '#6B7280' };

function FormularioCiclo({ ciclo, onClose, onGuardado }) {
  const [form, setForm] = useState({
    fecha_inicio: ciclo ? String(ciclo.fecha_inicio).slice(0, 10) : '',
    fecha_fin: ciclo ? String(ciclo.fecha_fin).slice(0, 10) : '',
  });

  return (
    <ModalFormulario
      titulo={ciclo ? 'Editar ciclo' : 'Nuevo ciclo académico'}
      subtitulo="El nombre del ciclo se toma del año de inicio"
      textoGuardar={ciclo ? 'Guardar cambios' : 'Crear ciclo'}
      onClose={onClose}
      validar={() => (!form.fecha_inicio || !form.fecha_fin ? 'Ingrese ambas fechas.' : '')}
      onGuardar={async () => {
        if (ciclo) await actualizar('ciclos', ciclo.id, form);
        else await crear('ciclos', { ...form, activo: false });
        onGuardado(ciclo ? 'Ciclo actualizado.' : 'Ciclo creado como planificado.');
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field id="ciclo-inicio" etiqueta="Fecha de inicio">
          <input
            id="ciclo-inicio"
            type="date"
            className="input-field"
            value={form.fecha_inicio}
            onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
          />
        </Field>
        <Field id="ciclo-fin" etiqueta="Fecha de finalización">
          <input
            id="ciclo-fin"
            type="date"
            className="input-field"
            value={form.fecha_fin}
            onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
          />
        </Field>
      </div>
    </ModalFormulario>
  );
}

export default function TabCiclos({ datos, onCambio, onError }) {
  const [modal, setModal] = useState(null); // { ciclo } | { ciclo: null }
  const [aEliminar, setAEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);

  async function ejecutar(accion, mensaje) {
    setProcesando(true);
    try {
      await accion();
      await onCambio(mensaje);
    } catch (e) {
      onError(e?.response?.status === 409
        ? 'No se puede eliminar: el ciclo tiene secciones, matrículas u otros registros asociados.'
        : mensajeError(e, 'No se pudo completar la operación.'));
    } finally {
      setProcesando(false);
      setAEliminar(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Ciclos académicos</SectionTitle>
        <button
          type="button"
          onClick={() => setModal({ ciclo: null })}
          className="bg-brand-gradient flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold text-white
            hover:opacity-90"
        >
          <Plus size={14} />Nuevo ciclo
        </button>
      </div>

      <div className="space-y-3">
        {datos.ciclos.map((c) => {
          const color = COLOR_ESTADO[c.estado];
          const secciones = datos.secciones.filter((s) => s.id_ciclo === c.id);
          return (
            <div
              key={c.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-card p-4 transition-all hover:border-brand/30"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}20` }}>
                <Calendar size={18} style={{ color }} />
              </div>
              <div className="min-w-40 flex-1">
                <p className="font-display text-sm font-semibold text-white">{nombreCiclo(c)}</p>
                <p className="mt-0.5 text-xs text-gray-500">{`${fechaCorta(c.fecha_inicio)} — ${fechaCorta(c.fecha_fin)}`}</p>
              </div>
              <div className="text-xs text-gray-400">
                {`${secciones.length} secciones · ${secciones.reduce((s, x) => s + x.estudiantes, 0)} estudiantes`}
              </div>
              <Pill color={color}>{c.estado}</Pill>
              <div className="flex items-center gap-1">
                <BotonIcono icono={Pencil} etiqueta="Editar" color="#F59E0B" onClick={() => setModal({ ciclo: c })} />
                {!c.activo && (
                  <BotonIcono
                    icono={PlayCircle}
                    etiqueta="Activar como ciclo actual"
                    color="#10B981"
                    deshabilitado={procesando}
                    onClick={() => ejecutar(() => activarCiclo(c.id, datos.ciclos), `${nombreCiclo(c)} es ahora el ciclo activo.`)}
                  />
                )}
                {c.activo && (
                  <BotonIcono
                    icono={StopCircle}
                    etiqueta="Finalizar ciclo"
                    color="#EF4444"
                    deshabilitado={procesando}
                    onClick={() => ejecutar(() => actualizar('ciclos', c.id, { activo: false }), `${nombreCiclo(c)} finalizado.`)}
                  />
                )}
                <BotonIcono icono={Trash2} etiqueta="Eliminar" color="#EF4444" onClick={() => setAEliminar(c)} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-600">
        Solo puede haber un ciclo activo: es el que usan matrículas, asistencia, calificaciones y horarios por defecto.
      </p>

      {modal && (
        <FormularioCiclo
          ciclo={modal.ciclo}
          onClose={() => setModal(null)}
          onGuardado={async (mensaje) => { setModal(null); await onCambio(mensaje); }}
        />
      )}
      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar ciclo"
          mensaje={`¿Eliminar el ${nombreCiclo(aEliminar).toLowerCase()}? Solo es posible si no tiene registros asociados.`}
          textoConfirmar="Eliminar"
          procesando={procesando}
          onConfirm={() => ejecutar(() => eliminar('ciclos', aEliminar.id), 'Ciclo eliminado.')}
          onCancel={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
