import Boton from '../../../components/ui/Boton';
import Modal from '../../../components/ui/Modal';
import {
  JORNADA_FIN, JORNADA_INICIO, aHora, minutos,
} from '../../../services/horarios';

const ALTO_HORA = 56;

function aPixeles(minutosDesdeInicio) {
  return (minutosDesdeInicio / 60) * ALTO_HORA;
}

// Un día del horario de un docente o una sección: el bloque que choca en rojo
// y, punteado, el lugar donde se intentó colocar la clase.
export default function VistaPreviaConflicto({ previa, bloques, onClose }) {
  const delDia = bloques.filter((b) => previa.filtro(b) && b.dia_semana === previa.dia)
    .sort((a, b) => minutos(a.inicio) - minutos(b.inicio));
  const extremos = [...delDia, previa.intento].flatMap((b) => [minutos(b.inicio), minutos(b.fin)]);
  const desde = Math.floor(Math.min(JORNADA_INICIO, ...extremos) / 60) * 60;
  const hasta = Math.ceil(Math.max(JORNADA_FIN, ...extremos) / 60) * 60;
  const horas = Array.from({ length: (hasta - desde) / 60 + 1 }, (_, i) => desde + i * 60);
  const alto = aPixeles(hasta - desde);
  const posicion = (b) => ({
    top: aPixeles(minutos(b.inicio) - desde) + 1,
    height: Math.max(aPixeles(minutos(b.fin) - minutos(b.inicio)) - 2, 16),
  });

  return (
    <Modal
      titulo={previa.titulo}
      subtitulo={`${previa.dia} · por qué no se puede colocar la clase en ese horario`}
      ancho="max-w-lg"
      onClose={onClose}
      pie={<Boton onClick={onClose}>Entendido</Boton>}
    >
      <div className="flex flex-wrap gap-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#EF4444]" />Clase que choca</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm border border-dashed border-brand-soft" />Horario que intentó usar</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-line" />Otras clases del día</span>
      </div>
      <div className="grid rounded-xl border border-line bg-card" style={{ gridTemplateColumns: '56px 1fr' }}>
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
        <div className="relative border-l border-line" style={{ height: alto }}>
          {horas.slice(0, -1).map((h) => (
            <div key={h} className="pointer-events-none absolute inset-x-0 border-t border-line" style={{ top: aPixeles(h - desde) }} />
          ))}
          {delDia.map((b) => {
            const choca = previa.resaltados.includes(b.id);
            return (
              <div
                key={b.id}
                className="absolute inset-x-2 overflow-hidden rounded-lg border px-2 py-1"
                style={{
                  ...posicion(b),
                  background: choca ? '#EF444430' : `${b.asignacion.color}18`,
                  borderColor: choca ? '#EF4444' : `${b.asignacion.color}50`,
                }}
              >
                <p className="truncate text-[11px] font-bold" style={{ color: choca ? '#FCA5A5' : b.asignacion.color }}>
                  {`${b.asignacion.asignatura} · ${b.inicio}–${b.fin}`}
                </p>
                <p className="truncate text-[10px] text-gray-300">
                  {previa.tipo === 'docente' ? `${b.asignacion.grado} — Sección ${b.asignacion.seccion}` : b.asignacion.docente}
                </p>
              </div>
            );
          })}
          <div
            className="pointer-events-none absolute right-2 left-1/2 z-10 rounded-lg border-2 border-dashed border-brand-soft bg-brand/10 px-2 py-1"
            style={posicion(previa.intento)}
          >
            <p className="truncate text-[10px] font-semibold text-brand-soft">{`${previa.intento.inicio}–${previa.intento.fin}`}</p>
            <p className="truncate text-[10px] text-gray-300">{previa.intento.etiqueta}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
