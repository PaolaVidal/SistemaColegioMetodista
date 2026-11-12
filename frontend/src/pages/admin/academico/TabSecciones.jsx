import { useState } from 'react';
import {
  Calendar, GraduationCap, Pencil, Plus, Trash2, Users,
} from 'lucide-react';
import BotonIcono from '../../../components/ui/BotonIcono';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Field from '../../../components/ui/Field';
import ModalFormulario from '../../../components/ui/ModalFormulario';
import SelectFiltro from '../../../components/ui/SelectFiltro';
import { mensajeError } from '../../../services/api';
import { actualizar, crear, eliminar } from '../../../services/recursos';
import { nombreCiclo } from '../../../utils/formato';
import { colorOcupacion } from '../matriculas/estados';

function FormularioSeccion({
  seccion, datos, idCicloInicial, onClose, onGuardado,
}) {
  const [form, setForm] = useState({
    id_ciclo: String(seccion?.id_ciclo || idCicloInicial || ''),
    id_grado: String(seccion?.id_grado || datos.grados[0]?.id || ''),
    nombre: seccion?.nombre || '',
    capacidad: seccion?.capacidad ? String(seccion.capacidad) : '30',
  });

  function cambiar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }

  return (
    <ModalFormulario
      titulo={seccion ? 'Editar sección' : 'Nueva sección'}
      textoGuardar={seccion ? 'Guardar cambios' : 'Crear sección'}
      onClose={onClose}
      validar={() => {
        if (!/^[A-Za-z]$/.test(form.nombre.trim())) return 'El nombre de la sección debe ser una letra (A, B, C...).';
        if (form.capacidad && !(Number(form.capacidad) > 0)) return 'La capacidad debe ser mayor que cero.';
        return '';
      }}
      onGuardar={async () => {
        const datosSeccion = {
          id_ciclo: Number(form.id_ciclo),
          id_grado: Number(form.id_grado),
          nombre: form.nombre.trim().toUpperCase(),
          capacidad: form.capacidad ? Number(form.capacidad) : null,
        };
        if (seccion) await actualizar('secciones', seccion.id, datosSeccion);
        else await crear('secciones', datosSeccion);
        onGuardado(seccion ? 'Sección actualizada.' : 'Sección creada.');
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field id="seccion-ciclo" etiqueta="Ciclo" ancho={2}>
          <select id="seccion-ciclo" className="input-field" value={form.id_ciclo} onChange={(e) => cambiar('id_ciclo', e.target.value)}>
            {datos.ciclos.map((c) => <option key={c.id} value={c.id}>{nombreCiclo(c)}</option>)}
          </select>
        </Field>
        <Field id="seccion-grado" etiqueta="Grado">
          <select id="seccion-grado" className="input-field" value={form.id_grado} onChange={(e) => cambiar('id_grado', e.target.value)}>
            {datos.grados.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
          </select>
        </Field>
        <Field id="seccion-nombre" etiqueta="Sección (letra)">
          <input
            id="seccion-nombre"
            className="input-field uppercase"
            maxLength={1}
            value={form.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            placeholder="A"
          />
        </Field>
        <Field id="seccion-capacidad" etiqueta="Capacidad (estudiantes)" ancho={2}>
          <input
            id="seccion-capacidad"
            type="number"
            min="1"
            className="input-field"
            value={form.capacidad}
            onChange={(e) => cambiar('capacidad', e.target.value)}
          />
        </Field>
      </div>
    </ModalFormulario>
  );
}

export default function TabSecciones({
  datos, filtroGrado, onFiltroGrado, onCambio, onError,
}) {
  const [idCiclo, setIdCiclo] = useState(String(datos.cicloActivo?.id || ''));
  const [modal, setModal] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const secciones = datos.secciones
    .filter((s) => !idCiclo || String(s.id_ciclo) === idCiclo)
    .filter((s) => !filtroGrado || String(s.id_grado) === filtroGrado)
    .sort((a, b) => a.id_grado - b.id_grado || a.nombre.localeCompare(b.nombre));
  const cicloPorId = Object.fromEntries(datos.ciclos.map((c) => [c.id, c]));

  async function confirmarEliminar() {
    setProcesando(true);
    try {
      await eliminar('secciones', aEliminar.id);
      await onCambio('Sección eliminada.');
    } catch (e) {
      onError(e?.response?.status === 409
        ? 'No se puede eliminar: la sección tiene matrículas o asignaciones de docentes.'
        : mensajeError(e, 'No se pudo eliminar la sección.'));
    } finally {
      setProcesando(false);
      setAEliminar(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SelectFiltro id="secciones-ciclo" etiqueta="Todos los ciclos" icono={Calendar} valor={idCiclo} onChange={setIdCiclo}>
          {datos.ciclos.map((c) => <option key={c.id} value={c.id}>{nombreCiclo(c)}</option>)}
        </SelectFiltro>
        <SelectFiltro
          id="secciones-grado"
          etiqueta="Todos los grados"
          icono={GraduationCap}
          valor={filtroGrado}
          onChange={onFiltroGrado}
        >
          {datos.grados.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
        </SelectFiltro>
        <span className="text-xs text-gray-500">{`${secciones.length} secciones`}</span>
        <button
          type="button"
          onClick={() => setModal({ seccion: null })}
          className="bg-brand-gradient ml-auto flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold
            text-white hover:opacity-90"
        >
          <Plus size={14} />Nueva sección
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {secciones.map((s) => {
          const docentes = [...new Set(s.asignaciones.map((a) => a.docente))].sort();
          const color = colorOcupacion(s.estudiantes, s.capacidad);
          return (
            <div key={s.id} className="rounded-xl border border-line bg-card p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-bold text-white">
                    {s.nombre}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-white">{`${s.grado} — Sección ${s.nombre}`}</p>
                    <p className="text-[11px] text-gray-500">{nombreCiclo(cicloPorId[s.id_ciclo])}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <BotonIcono icono={Pencil} etiqueta="Editar" color="#F59E0B" tamano={13} onClick={() => setModal({ seccion: s })} />
                  <BotonIcono icono={Trash2} etiqueta="Eliminar" color="#EF4444" tamano={13} onClick={() => setAEliminar(s)} />
                </div>
              </div>

              <div className="mb-3">
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-gray-400"><Users size={11} />Estudiantes</span>
                  <span className="font-semibold text-white">{`${s.estudiantes}/${s.capacidad ?? '∞'}`}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-line">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${s.capacidad ? Math.min(100, (s.estudiantes / s.capacidad) * 100) : 0}%`, background: color }}
                  />
                </div>
              </div>

              <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                {`Docentes (${docentes.length}) · ${s.asignaciones.length} asignaturas`}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {docentes.length === 0 && <span className="text-[11px] text-gray-600">Sin docentes asignados</span>}
                {docentes.map((d) => <span key={d} className="rounded-full bg-line px-2 py-0.5 text-[11px] text-gray-300">{d}</span>)}
              </div>
            </div>
          );
        })}
        {secciones.length === 0 && <p className="py-10 text-center text-xs text-gray-500 md:col-span-2">Sin secciones para los filtros elegidos</p>}
      </div>

      {modal && (
        <FormularioSeccion
          seccion={modal.seccion}
          datos={datos}
          idCicloInicial={idCiclo || datos.cicloActivo?.id}
          onClose={() => setModal(null)}
          onGuardado={async (mensaje) => { setModal(null); await onCambio(mensaje); }}
        />
      )}
      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar sección"
          mensaje={`¿Eliminar ${aEliminar.grado} — Sección ${aEliminar.nombre}? Solo es posible si no tiene matrículas ni docentes.`}
          textoConfirmar="Eliminar"
          procesando={procesando}
          onConfirm={confirmarEliminar}
          onCancel={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
