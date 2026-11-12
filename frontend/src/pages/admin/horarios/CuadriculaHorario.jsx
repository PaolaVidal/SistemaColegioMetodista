import { GripVertical, Plus } from 'lucide-react';
import {
  DIAS, JORNADA_FIN, JORNADA_INICIO, aHora, minutos,
} from '../../../services/horarios';

export const ALTO_HORA = 72; // píxeles por hora

// Rango visible: la jornada completa, ampliada si algún bloque queda fuera de ella.
export function rangoVisible(bloques) {
  const inicios = bloques.map((b) => minutos(b.inicio));
  const fines = bloques.map((b) => minutos(b.fin));
  return {
    desde: Math.floor(Math.min(JORNADA_INICIO, ...inicios) / 60) * 60,
    hasta: Math.ceil(Math.max(JORNADA_FIN, ...fines) / 60) * 60,
  };
}

function aPixeles(minutosDesdeInicio) {
  return (minutosDesdeInicio / 60) * ALTO_HORA;
}

// Firefox exige datos en el dataTransfer para iniciar el arrastre.
export function iniciarArrastre({ dataTransfer }) {
  const transferencia = dataTransfer;
  transferencia.effectAllowed = 'move';
  transferencia.setData('text/plain', '');
}

function Bloque({
  bloque, desde, vista, edicion, arrastrando, onEditar, onArrastrar, onTerminar, onSoltarEncima,
}) {
  const { asignacion } = bloque;
  const inicio = minutos(bloque.inicio);
  const duracion = minutos(bloque.fin) - inicio;
  const compacto = duracion < 40;
  const estilo = {
    top: aPixeles(inicio - desde) + 1,
    height: Math.max(aPixeles(duracion) - 2, 18),
    background: `${asignacion.color}22`,
    borderColor: `${asignacion.color}70`,
  };
  const contenido = (
    <>
      <p className="truncate pr-3 font-display text-[11px] leading-tight font-bold" style={{ color: asignacion.color }}>
        {asignacion.asignatura}
      </p>
      {!compacto && (
        <p className="truncate text-[10px] leading-tight text-gray-300">
          {vista === 'seccion' ? asignacion.docente : `${asignacion.grado} — ${asignacion.seccion}`}
        </p>
      )}
      {!compacto && <p className="mt-auto text-[9px] text-gray-500">{`${bloque.inicio}–${bloque.fin}`}</p>}
    </>
  );
  const clases = 'absolute inset-x-1 z-10 flex flex-col gap-0.5 overflow-hidden rounded-lg border px-2 py-1 text-left';

  if (!edicion) return <div className={clases} style={estilo} title={`${bloque.inicio}–${bloque.fin}`}>{contenido}</div>;

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        iniciarArrastre(e);
        const rect = e.currentTarget.getBoundingClientRect();
        onArrastrar(Math.round(((e.clientY - rect.top) / ALTO_HORA) * 60));
      }}
      onDragEnd={onTerminar}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onSoltarEncima(); }}
      onClick={onEditar}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEditar(); } }}
      aria-label={`${asignacion.asignatura}, ${bloque.dia_semana} ${bloque.inicio} a ${bloque.fin}. Arrastra para mover o pulsa para editar`}
      title="Arrastra para mover; suelta otro bloque encima para intercambiarlos"
      className={`${clases} group cursor-grab transition-all select-none hover:brightness-125 active:cursor-grabbing
        ${arrastrando ? 'opacity-40' : ''}`}
      style={estilo}
    >
      <GripVertical size={11} className="absolute top-1 right-0.5 text-gray-500 opacity-60 group-hover:opacity-100" />
      {contenido}
    </div>
  );
}

// Cuadrícula semanal con escala de tiempo real: cada bloque se ubica y dimensiona según su hora.
export default function CuadriculaHorario({
  bloques, vista, edicion, arrastre, vistaPrevia, onArrastrarBloque, onTerminar, onSobreDia, onSoltarDia,
  onSoltarSobreBloque, onEditarBloque, onAgregar,
}) {
  const { desde, hasta } = rangoVisible(bloques);
  const horas = Array.from({ length: (hasta - desde) / 60 + 1 }, (_, i) => desde + i * 60);
  const medias = Array.from({ length: (hasta - desde) / 30 }, (_, i) => desde + i * 30);
  const alto = aPixeles(hasta - desde);

  return (
    <div className="min-w-[760px]">
      <div className="grid border-b border-line bg-base" style={{ gridTemplateColumns: '64px repeat(5, minmax(0, 1fr))' }}>
        <div className="px-2 py-3 text-[10px] font-semibold text-gray-500 uppercase">Hora</div>
        {DIAS.map((d) => (
          <div key={d} className="border-l border-line px-3 py-3 text-center font-display text-xs font-semibold text-gray-300">{d}</div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '64px repeat(5, minmax(0, 1fr))' }}>
        <div className="relative" style={{ height: alto }}>
          {horas.map((h) => (
            <span
              key={h}
              className="absolute right-2 -translate-y-1/2 font-mono text-[10px] text-gray-500"
              style={{ top: Math.min(Math.max(aPixeles(h - desde), 8), alto - 8) }}
            >
              {aHora(h)}
            </span>
          ))}
        </div>

        {DIAS.map((dia) => {
          const delDia = bloques.filter((b) => b.dia_semana === dia);
          const previa = vistaPrevia?.dia === dia ? vistaPrevia : null;
          return (
            <div
              key={dia}
              className="relative border-l border-line"
              style={{ height: alto }}
              onDragOver={(e) => {
                if (!arrastre) return;
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                onSobreDia(dia, desde + ((e.clientY - rect.top) / ALTO_HORA) * 60, desde, hasta);
              }}
              onDrop={(e) => { e.preventDefault(); onSoltarDia(); }}
            >
              {medias.map((m) => (
                <div
                  key={m}
                  className={`pointer-events-none absolute inset-x-0 border-t ${m % 60 === 0 ? 'border-line' : 'border-line/40 border-dashed'}`}
                  style={{ top: aPixeles(m - desde) }}
                />
              ))}

              {edicion && medias.map((m) => (
                <button
                  key={`agregar-${m}`}
                  type="button"
                  aria-label={`Agregar clase el ${dia} a las ${aHora(m)}`}
                  onClick={() => onAgregar(dia, m)}
                  className="group absolute inset-x-0 flex items-center justify-center text-[10px] text-transparent hover:bg-brand/10
                    hover:text-brand-soft"
                  style={{ top: aPixeles(m - desde), height: aPixeles(30) }}
                >
                  <Plus size={10} className="mr-0.5" />{aHora(m)}
                </button>
              ))}

              {previa && (
                <div
                  className={`pointer-events-none absolute inset-x-1 z-20 flex items-start rounded-lg border-2 border-dashed px-2 py-1 text-[10px]
                    font-semibold ${previa.valido ? 'border-brand bg-brand/15 text-brand-soft' : 'border-[#EF4444] bg-[#EF444415] text-[#EF4444]'}`}
                  style={{
                    top: aPixeles(minutos(previa.inicio) - desde),
                    height: aPixeles(minutos(previa.fin) - minutos(previa.inicio)),
                  }}
                >
                  {`${previa.inicio}–${previa.fin}${previa.valido ? '' : ' · ocupado'}`}
                </div>
              )}

              {delDia.map((b) => (
                <Bloque
                  key={b.id}
                  bloque={b}
                  desde={desde}
                  vista={vista}
                  edicion={edicion}
                  arrastrando={arrastre?.bloque?.id === b.id}
                  onEditar={() => onEditarBloque(b)}
                  onArrastrar={(desfase) => onArrastrarBloque(b, desfase)}
                  onTerminar={onTerminar}
                  onSoltarEncima={() => onSoltarSobreBloque(b)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
