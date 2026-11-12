import { useState } from 'react';
import {
  ChevronRight, GraduationCap, Layers, Pencil, Plus, Trash2,
} from 'lucide-react';
import BotonIcono from '../../../components/ui/BotonIcono';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Field from '../../../components/ui/Field';
import ModalFormulario from '../../../components/ui/ModalFormulario';
import SectionTitle from '../../../components/ui/SectionTitle';
import { mensajeError } from '../../../services/api';
import { actualizar, crear, eliminar } from '../../../services/recursos';
import { nombreCiclo } from '../../../utils/formato';

function FormularioGrado({ grado, onClose, onGuardado }) {
  const [nombre, setNombre] = useState(grado?.nombre || '');
  return (
    <ModalFormulario
      titulo={grado ? 'Editar grado' : 'Nuevo grado'}
      textoGuardar={grado ? 'Guardar' : 'Crear grado'}
      onClose={onClose}
      validar={() => (nombre.trim() ? '' : 'Ingrese el nombre del grado.')}
      onGuardar={async () => {
        if (grado) await actualizar('grados', grado.id, { nombre: nombre.trim() });
        else await crear('grados', { nombre: nombre.trim() });
        onGuardado(grado ? 'Grado actualizado.' : 'Grado creado.');
      }}
    >
      <Field id="grado-nombre" etiqueta="Nombre del grado">
        <input
          id="grado-nombre"
          className="input-field"
          maxLength={15}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: 6to Básico"
        />
      </Field>
    </ModalFormulario>
  );
}

export default function TabGrados({
  datos, onCambio, onError, onVerSecciones,
}) {
  const [modal, setModal] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const idCiclo = datos.cicloActivo?.id;

  async function confirmarEliminar() {
    setProcesando(true);
    try {
      await eliminar('grados', aEliminar.id);
      await onCambio('Grado eliminado.');
    } catch (e) {
      onError(e?.response?.status === 409
        ? 'No se puede eliminar: el grado tiene secciones asociadas.'
        : mensajeError(e, 'No se pudo eliminar el grado.'));
    } finally {
      setProcesando(false);
      setAEliminar(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>{`Grados — ${nombreCiclo(datos.cicloActivo)}`}</SectionTitle>
        <button
          type="button"
          onClick={() => setModal({ grado: null })}
          className="bg-brand-gradient flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold text-white
            hover:opacity-90"
        >
          <Plus size={14} />Nuevo grado
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {datos.grados.map((g) => {
          const secciones = datos.secciones.filter((s) => s.id_grado === g.id && s.id_ciclo === idCiclo);
          const asignaturas = [...new Set(secciones.flatMap((s) => s.asignaciones.map((a) => a.asignatura)))].sort();
          const estudiantes = secciones.reduce((suma, s) => suma + s.estudiantes, 0);
          return (
            <div key={g.id} className="rounded-xl border border-line bg-card p-4 transition-all hover:border-brand/20">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15">
                    <GraduationCap size={16} className="text-brand-soft" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-white">{g.nombre}</p>
                    <p className="text-[11px] text-gray-500">{`${secciones.length} secciones · ${estudiantes} estudiantes`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <BotonIcono icono={Pencil} etiqueta="Editar" color="#F59E0B" tamano={13} onClick={() => setModal({ grado: g })} />
                  <BotonIcono icono={Trash2} etiqueta="Eliminar" color="#EF4444" tamano={13} onClick={() => setAEliminar(g)} />
                </div>
              </div>

              <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Asignaturas impartidas</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {asignaturas.length === 0 && <span className="text-[11px] text-gray-600">Sin asignaciones en el ciclo activo</span>}
                {asignaturas.map((a) => (
                  <span key={a} className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] text-brand-soft">{a}</span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onVerSecciones(g.id)}
                className="group flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-brand-soft"
              >
                <Layers size={13} />Ver secciones del grado
                <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-600">
        Las asignaturas de cada grado se definen al asignar docentes en Docentes o en la pestaña Secciones.
      </p>

      {modal && (
        <FormularioGrado
          grado={modal.grado}
          onClose={() => setModal(null)}
          onGuardado={async (mensaje) => { setModal(null); await onCambio(mensaje); }}
        />
      )}
      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar grado"
          mensaje={`¿Eliminar ${aEliminar.nombre}? Solo es posible si no tiene secciones.`}
          textoConfirmar="Eliminar"
          procesando={procesando}
          onConfirm={confirmarEliminar}
          onCancel={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
