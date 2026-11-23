import { useState } from 'react';
import {
  Calendar, Clock, Copy, Edit3, Megaphone, Save, Send, Trash2, X,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import Field from '../../../components/ui/Field';
import Pill from '../../../components/ui/Pill';
import { mensajeError } from '../../../services/api';
import { guardarAnuncio } from '../../../services/comunicados';
import { fechaCorta } from '../../../utils/formato';

export const ESTADOS_ANUNCIO = {
  publicado: { etiqueta: 'Publicado', color: '#10B981', icono: Send },
  programado: { etiqueta: 'Programado', color: '#F59E0B', icono: Clock },
};

function aLocal(fecha) {
  const d = fecha ? new Date(fecha) : new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function fechaHora(fecha) {
  return new Date(fecha).toLocaleString('es-SV', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function FormularioAnuncio({
  anuncio, idAutor, onGuardado, onCancel,
}) {
  const esNuevo = !anuncio?.id;
  const [form, setForm] = useState({
    titulo: anuncio?.titulo || '',
    contenido: anuncio?.contenido || '',
    fecha: aLocal(esNuevo ? null : anuncio.fecha_publicacion),
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (!form.titulo.trim() || !form.contenido.trim() || !form.fecha) {
      setError('El título, el contenido y la fecha de publicación son obligatorios.');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      const guardado = await guardarAnuncio(esNuevo ? null : anuncio.id, {
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        fecha_publicacion: form.fecha.replace('T', ' '),
        ...(esNuevo ? { autor_id: idAutor } : {}),
      });
      onGuardado(guardado.id, esNuevo ? 'Comunicado creado.' : 'Comunicado actualizado.');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar el comunicado.'));
      setGuardando(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-7 py-5">
        <div>
          <p className="font-display text-base font-bold text-white">{esNuevo ? 'Nuevo comunicado' : 'Editar comunicado'}</p>
          <p className="mt-0.5 text-xs text-gray-500">Visible para toda la comunidad educativa desde la fecha indicada</p>
        </div>
        <button type="button" onClick={onCancel} aria-label="Cancelar" className="rounded-lg p-2 text-gray-400 hover:bg-line">
          <X size={15} />
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-7 py-6">
        <Alerta>{error}</Alerta>
        <Field id="anuncio-titulo" etiqueta="Título *">
          <input
            id="anuncio-titulo"
            className="input-field py-2.5 text-sm"
            maxLength={150}
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ej: Reunión de padres de familia"
          />
        </Field>
        <Field id="anuncio-fecha" etiqueta="Fecha y hora de publicación *">
          <input
            id="anuncio-fecha"
            type="datetime-local"
            className="input-field py-2.5 text-sm"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />
        </Field>
        <Field id="anuncio-contenido" etiqueta="Contenido *">
          <textarea
            id="anuncio-contenido"
            rows={10}
            className="input-field resize-y py-2.5 text-sm leading-6"
            value={form.contenido}
            onChange={(e) => setForm({ ...form, contenido: e.target.value })}
          />
        </Field>
        <p className="text-[11px] text-gray-600">Si la fecha es futura, el comunicado quedará programado hasta ese momento.</p>
      </div>
      <div className="flex flex-shrink-0 items-center justify-between border-t border-line px-7 py-4">
        <Boton variante="secundario" onClick={onCancel} deshabilitado={guardando}>Cancelar</Boton>
        <Boton onClick={guardar} deshabilitado={guardando}>
          <Save size={12} />{guardando ? 'Guardando...' : 'Guardar comunicado'}
        </Boton>
      </div>
    </div>
  );
}

export function DetalleAnuncio({
  anuncio, onEditar, onDuplicar, onEliminar,
}) {
  const estado = ESTADOS_ANUNCIO[anuncio.estado];
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line px-7 py-4">
        <Pill color={estado.color} icono={estado.icono}>{estado.etiqueta}</Pill>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEditar}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white"
          >
            <Edit3 size={12} />Editar
          </button>
          <button
            type="button"
            onClick={onDuplicar}
            title="Duplicar"
            aria-label="Duplicar comunicado"
            className="rounded-lg border border-line p-1.5 text-gray-500 transition-colors hover:text-gray-300"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            onClick={onEliminar}
            title="Eliminar"
            aria-label="Eliminar comunicado"
            className="rounded-lg border border-line p-1.5 text-gray-500 transition-colors hover:border-[#EF4444] hover:text-[#EF4444]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-7 py-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand/15">
            <Megaphone size={18} className="text-brand-soft" />
          </div>
          <h2 className="font-display text-2xl leading-snug font-bold text-white">{anuncio.titulo}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-5 border-b border-line pb-5 text-xs">
          <div className="flex items-center gap-2">
            <div className="bg-brand-gradient flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white">
              {anuncio.autor.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-display font-semibold text-white">{anuncio.autor}</p>
              <p className="text-[10px] text-gray-500">Autor</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-gray-400">
            <Calendar size={12} className="text-gray-600" />
            {`${anuncio.estado === 'programado' ? 'Se publicará' : 'Publicado'}: ${fechaHora(anuncio.fecha_publicacion)}`}
          </span>
        </div>
        <div className="rounded-2xl border border-line bg-base p-6">
          <p className="text-sm leading-7 whitespace-pre-line text-gray-200">{anuncio.contenido}</p>
        </div>
        <p className="text-[11px] text-gray-600">{`Registrado el ${fechaCorta(anuncio.fecha_publicacion)} · ID ${anuncio.id}`}</p>
      </div>
    </div>
  );
}
