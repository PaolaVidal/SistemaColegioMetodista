import { useState } from 'react';
import {
  BookOpen, Calendar, CheckCircle, Clock, CreditCard, Edit3, GraduationCap, Mail, Phone, Trash2, User, XCircle,
} from 'lucide-react';
import { fechaCorta, iniciales, nombreCompleto } from '../../../utils/formato';
import AsignacionesDocente from './AsignacionesDocente';
import {
  codigoDocente, colorDocente, grados, horasSemanales, materias,
} from './utilidades';

const PESTANAS = [
  { id: 'perfil', etiqueta: 'Perfil' },
  { id: 'asignaturas', etiqueta: 'Asignaturas' },
];

function Etiquetas({ titulo, valores, color }) {
  return (
    <div className="rounded-xl border border-line bg-base p-4">
      <p className="mb-3 text-[10px] font-semibold tracking-wider text-gray-600 uppercase">{titulo}</p>
      {valores.length === 0 && <p className="text-xs text-gray-500">Sin asignaciones en el ciclo activo</p>}
      <div className="flex flex-wrap gap-2">
        {valores.map((v) => (
          <span
            key={v}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={color ? { background: `${color}18`, color } : { background: '#3d262d', color: '#9CA3AF' }}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DocentePerfil({
  docente, ciclo, secciones, asignaturas, asignacionesCiclo, procesando,
  onEditar, onCambiarEstado, onEliminar, onCambio,
}) {
  const [pestana, setPestana] = useState('perfil');
  const color = colorDocente(docente);
  const listaMaterias = materias(docente);
  const listaGrados = grados(docente);

  const indicadores = [
    {
      icono: BookOpen, etiqueta: 'Materias', valor: listaMaterias.length, color: '#c2416b',
    },
    {
      icono: GraduationCap, etiqueta: 'Grados', valor: listaGrados.length, color: '#8B5CF6',
    },
    {
      icono: Clock, etiqueta: 'Horas/sem', valor: `${horasSemanales(docente)}h`, color: '#10B981',
    },
    {
      icono: Calendar, etiqueta: 'Registro', valor: fechaCorta(docente.created_at), color: '#F59E0B',
    },
  ];

  const contacto = [
    { icono: User, etiqueta: 'DUI', valor: docente.dui },
    { icono: Mail, etiqueta: 'Correo de usuario', valor: docente.correo || 'Sin usuario vinculado' },
    { icono: Phone, etiqueta: 'Teléfono', valor: docente.telefono },
    { icono: CreditCard, etiqueta: 'ISSS / AFP', valor: `${docente.numero_isss || '—'} / ${docente.afp || '—'}` },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b border-line px-7 py-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
              style={{ background: `linear-gradient(135deg,${color},${color}99)` }}
            >
              {iniciales(docente.nombres, docente.apellidos)}
            </div>
            <div>
              <h2 className="font-display text-xl leading-tight font-bold text-white">{nombreCompleto(docente)}</h2>
              <p className="mt-0.5 text-sm text-gray-400">{listaMaterias.join(', ') || 'Sin asignaturas asignadas'}</p>
              <p className="mt-0.5 text-[11px] text-gray-600">{codigoDocente(docente)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={docente.activo ? { background: '#10B98120', color: '#10B981' } : { background: '#EF444420', color: '#EF4444' }}
            >
              {docente.activo ? <CheckCircle size={11} /> : <XCircle size={11} />}
              {docente.activo ? 'Activo' : 'Inactivo'}
            </span>
            <button
              type="button"
              onClick={onEditar}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-gray-400
                transition-colors hover:text-white"
            >
              <Edit3 size={12} />Editar
            </button>
            <button
              type="button"
              onClick={onCambiarEstado}
              disabled={procesando}
              className={`flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium
                transition-colors disabled:opacity-40 ${docente.activo ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}
            >
              {docente.activo ? 'Desactivar' : 'Activar'}
            </button>
            <button
              type="button"
              onClick={onEliminar}
              aria-label="Eliminar docente"
              title="Eliminar docente"
              className="rounded-lg border border-line p-1.5 text-gray-600 transition-colors hover:border-[#EF4444]
                hover:text-[#EF4444]"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {indicadores.map((item) => (
            <div key={item.etiqueta} className="rounded-xl border border-line bg-base p-3">
              <div className="mb-1 flex items-center gap-2">
                <item.icono size={12} style={{ color: item.color }} />
                <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">{item.etiqueta}</p>
              </div>
              <p className="font-display text-sm font-bold text-white">{item.valor}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-shrink-0 border-b border-line px-7" role="tablist">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            onClick={() => setPestana(p.id)}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition-colors
              ${pestana === p.id ? 'border-brand text-brand-soft' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-5">
        {pestana === 'perfil' && (
          <div className="space-y-4">
            {contacto.map((item) => (
              <div key={item.etiqueta} className="flex items-center gap-4 rounded-xl border border-line bg-base p-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-line/60">
                  <item.icono size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-gray-600 uppercase">{item.etiqueta}</p>
                  <p className="mt-0.5 text-sm text-gray-200">{item.valor}</p>
                </div>
              </div>
            ))}
            <Etiquetas titulo="Materias que imparte" valores={listaMaterias} color={color} />
            <Etiquetas titulo="Grados asignados" valores={listaGrados} />
          </div>
        )}

        {pestana === 'asignaturas' && (
          <AsignacionesDocente
            docente={docente}
            ciclo={ciclo}
            secciones={secciones}
            asignaturas={asignaturas}
            asignacionesCiclo={asignacionesCiclo}
            onCambio={onCambio}
          />
        )}
      </div>
    </div>
  );
}
