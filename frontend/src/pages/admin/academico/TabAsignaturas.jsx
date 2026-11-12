import { useState } from 'react';
import {
  BookOpen, Pencil, Plus, Trash2,
} from 'lucide-react';
import BotonIcono from '../../../components/ui/BotonIcono';
import Buscador from '../../../components/ui/Buscador';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Field from '../../../components/ui/Field';
import ModalFormulario from '../../../components/ui/ModalFormulario';
import { mensajeError } from '../../../services/api';
import { actualizar, crear, eliminar } from '../../../services/recursos';

function FormularioAsignatura({ asignatura, onClose, onGuardado }) {
  const [form, setForm] = useState({
    nombre: asignatura?.nombre || '',
    codigo: asignatura?.codigo || '',
    descripcion: asignatura?.descripcion || '',
  });

  function cambiar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }

  return (
    <ModalFormulario
      titulo={asignatura ? 'Editar asignatura' : 'Nueva asignatura'}
      textoGuardar={asignatura ? 'Guardar cambios' : 'Crear asignatura'}
      onClose={onClose}
      validar={() => (!form.nombre.trim() || !form.codigo.trim() ? 'El nombre y el código son obligatorios.' : '')}
      onGuardar={async () => {
        const datos = {
          nombre: form.nombre.trim(),
          codigo: form.codigo.trim().toUpperCase(),
          descripcion: form.descripcion.trim() || null,
        };
        if (asignatura) await actualizar('asignaturas', asignatura.id, datos);
        else await crear('asignaturas', datos);
        onGuardado(asignatura ? 'Asignatura actualizada.' : 'Asignatura creada.');
      }}
    >
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Field id="asignatura-nombre" etiqueta="Nombre">
            <input
              id="asignatura-nombre"
              className="input-field"
              maxLength={20}
              value={form.nombre}
              onChange={(e) => cambiar('nombre', e.target.value)}
              placeholder="Ej: Matemática"
            />
          </Field>
        </div>
        <Field id="asignatura-codigo" etiqueta="Código">
          <input
            id="asignatura-codigo"
            className="input-field uppercase"
            maxLength={20}
            value={form.codigo}
            onChange={(e) => cambiar('codigo', e.target.value)}
            placeholder="MAT"
          />
        </Field>
        <div className="col-span-3">
          <Field id="asignatura-descripcion" etiqueta="Descripción">
            <textarea
              id="asignatura-descripcion"
              rows={3}
              className="input-field resize-none"
              value={form.descripcion}
              onChange={(e) => cambiar('descripcion', e.target.value)}
            />
          </Field>
        </div>
      </div>
    </ModalFormulario>
  );
}

export default function TabAsignaturas({ datos, onCambio, onError }) {
  const [buscar, setBuscar] = useState('');
  const [modal, setModal] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const idCiclo = datos.cicloActivo?.id;
  const termino = buscar.trim().toLowerCase();

  const filas = datos.asignaturas
    .filter((a) => !termino || a.nombre.toLowerCase().includes(termino) || a.codigo.toLowerCase().includes(termino))
    .map((a) => {
      const delCiclo = datos.asignaciones.filter((x) => x.id_asignatura === a.id && x.id_ciclo === idCiclo);
      return {
        ...a,
        docentes: [...new Set(delCiclo.map((x) => x.docente))].sort(),
        grados: [...new Set(delCiclo.map((x) => datos.gradoPorId[x.idGrado]?.nombre).filter(Boolean))],
        secciones: delCiclo.length,
      };
    });

  async function confirmarEliminar() {
    setProcesando(true);
    try {
      await eliminar('asignaturas', aEliminar.id);
      await onCambio('Asignatura eliminada.');
    } catch (e) {
      onError(e?.response?.status === 409
        ? 'No se puede eliminar: la asignatura está asignada a docentes o secciones.'
        : mensajeError(e, 'No se pudo eliminar la asignatura.'));
    } finally {
      setProcesando(false);
      setAEliminar(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Buscador
          id="buscar-asignatura"
          etiqueta="Buscar asignatura"
          placeholder="Buscar por nombre o código..."
          valor={buscar}
          onChange={setBuscar}
        />
        <button
          type="button"
          onClick={() => setModal({ asignatura: null })}
          className="bg-brand-gradient flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold text-white
            hover:opacity-90"
        >
          <Plus size={14} />Nueva asignatura
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-base">
                {['Código', 'Asignatura', 'Docentes (ciclo activo)', 'Grados', 'Secciones', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <BookOpen size={32} className="mx-auto mb-3 opacity-30" />Sin asignaturas
                  </td>
                </tr>
              )}
              {filas.map((a) => (
                <tr key={a.id} className="border-b border-line transition-colors hover:bg-line/40">
                  <td className="px-4 py-3">
                    <span className="rounded bg-line px-2 py-0.5 font-mono text-[11px] text-gray-300">{a.codigo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-display font-semibold text-white">{a.nombre}</p>
                    {a.descripcion && <p className="max-w-64 truncate text-[10px] text-gray-500">{a.descripcion}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {a.docentes.length ? a.docentes.slice(0, 3).join(', ') : <span className="text-gray-600">Sin docente</span>}
                    {a.docentes.length > 3 && <span className="text-gray-500">{` +${a.docentes.length - 3}`}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.grados.map((g) => <span key={g} className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] text-brand-soft">{g}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-display font-semibold text-white">{a.secciones}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <BotonIcono icono={Pencil} etiqueta={`Editar ${a.nombre}`} color="#F59E0B" onClick={() => setModal({ asignatura: a })} />
                      <BotonIcono icono={Trash2} etiqueta={`Eliminar ${a.nombre}`} color="#EF4444" onClick={() => setAEliminar(a)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <FormularioAsignatura
          asignatura={modal.asignatura}
          onClose={() => setModal(null)}
          onGuardado={async (mensaje) => { setModal(null); await onCambio(mensaje); }}
        />
      )}
      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar asignatura"
          mensaje={`¿Eliminar ${aEliminar.nombre}? Solo es posible si no está asignada a ninguna sección.`}
          textoConfirmar="Eliminar"
          procesando={procesando}
          onConfirm={confirmarEliminar}
          onCancel={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
