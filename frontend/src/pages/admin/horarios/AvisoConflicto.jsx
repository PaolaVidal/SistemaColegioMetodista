import { CalendarSearch } from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';

// Error de horario traslapado con un enlace a la vista previa del horario que lo causa.
export default function AvisoConflicto({ conflicto, pista, onVer }) {
  if (!conflicto) return null;
  const { mensaje, previa } = conflicto;
  return (
    <Alerta key={mensaje}>
      <span className="block">{`${mensaje}${pista ? ` ${pista}` : ''}`}</span>
      {previa && (
        <button
          type="button"
          onClick={onVer}
          className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-[#EF444460] px-2 py-1 font-semibold
            text-[#FCA5A5] transition-colors hover:bg-[#EF444420]"
        >
          <CalendarSearch size={12} />
          {previa.tipo === 'docente'
            ? `Ver horario del docente el ${previa.dia.toLowerCase()}`
            : `Ver horario de la sección el ${previa.dia.toLowerCase()}`}
        </button>
      )}
    </Alerta>
  );
}
