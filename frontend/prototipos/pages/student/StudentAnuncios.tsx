import { useState } from "react";
import { Megaphone, ChevronRight, X, Calendar, User, Globe, BookOpen, FileText, AlertTriangle } from "lucide-react";

interface Anuncio {
  id: string;
  titulo: string;
  fecha: string;
  autor: string;
  categoria: string;
  prioridad: "normal" | "importante" | "urgente";
  resumen: string;
  contenido: string;
  color: string;
}

const PRIORIDAD_STYLE = {
  normal:     {color:"#9CA3AF", bg:"#37415118", dot:"#6B7280", label:"Normal"},
  importante: {color:"#FBBF24", bg:"#F59E0B18", dot:"#F59E0B", label:"Importante"},
  urgente:    {color:"#F87171", bg:"#EF444418", dot:"#EF4444", label:"Urgente"},
};

const CATEGORIA_ICONS: Record<string,React.ComponentType<{size?:number;style?:React.CSSProperties}>> = {
  "General":        Globe,
  "Académico":      BookOpen,
  "Administrativo": FileText,
  "Evento":         Calendar,
  "Urgente":        AlertTriangle,
};

const ANUNCIOS: Anuncio[] = [
  {id:"a1",titulo:"Protocolo de emergencias actualizado — Lectura obligatoria",fecha:"2026-09-05",autor:"Directora Gral. — Lic. Carmen Paredes",categoria:"Urgente",prioridad:"urgente",color:"#EF4444",
   resumen:"Se ha actualizado el protocolo de emergencias conforme a la normativa vigente. Lectura obligatoria para toda la comunidad.",
   contenido:"AVISO URGENTE\n\nSe ha actualizado el protocolo de emergencias de la institución conforme a la normativa vigente de seguridad escolar. Es de carácter OBLIGATORIO que todo estudiante y encargado legal lo conozca.\n\nEn caso de emergencia:\n• Mantener la calma y seguir las instrucciones del docente\n• Dirigirse al punto de reunión asignado (patio central)\n• No regresar al aula hasta recibir autorización\n• Comunicarse con los encargados según el protocolo acordado\n\nEl documento completo está disponible en recepción y en el portal institucional."},
  {id:"a2",titulo:"Evaluaciones del I Bimestre — Información importante",fecha:"2026-09-01",autor:"Coordinación Académica",categoria:"Académico",prioridad:"importante",color:"#00ADEB",
   resumen:"Las evaluaciones del I Bimestre se realizarán del 28 de septiembre al 2 de octubre. Revisa el horario de evaluaciones.",
   contenido:"Estimados estudiantes y padres de familia,\n\nLes informamos que las evaluaciones del I Bimestre se llevarán a cabo del 28 de septiembre al 2 de octubre de 2026. Durante este período no habrá clases regulares; cada franja horaria corresponderá a una evaluación específica según el horario publicado.\n\nRecomendaciones:\n• Revisar el horario de evaluaciones publicado en el sistema\n• Presentarse 10 minutos antes de cada evaluación\n• Portar el material permitido: lápiz, borrador, regla\n• Respetar el silencio durante los exámenes\n• Ante cualquier duda, consultar con el tutor\n\n¡Mucho éxito a todos los estudiantes!"},
  {id:"a3",titulo:"Actividad deportiva interescolar — Convocatoria",fecha:"2026-09-07",autor:"Lic. Pedro Luna",categoria:"Evento",prioridad:"normal",color:"#10B981",
   resumen:"Convocatoria para el campeonato deportivo interescolar 2026. Inscripciones hasta el 19 de septiembre.",
   contenido:"Nos complace anunciar que nuestra institución participará en el campeonato deportivo interescolar 2026.\n\nSe convoca a los estudiantes de 3°, 4°, 5° y 6° grado a inscribirse en las siguientes disciplinas:\n• Fútbol mixto\n• Voleibol femenino\n• Básquetbol masculino\n• Atletismo (individual)\n\nFecha límite de inscripción: 19 de septiembre de 2026.\nComunicarse directamente con el Prof. Pedro Luna para más información y requisitos de participación.\n\n¡Anímate a representar a tu institución!"},
  {id:"a4",titulo:"Reunión general de padres de familia — I Bimestre",fecha:"2026-03-12",autor:"Lic. Admin. Principal",categoria:"Evento",prioridad:"importante",color:"#F59E0B",
   resumen:"Reunión el viernes 20 de septiembre a las 6:00 p.m. en el auditorio. Confirmar asistencia antes del 18/09.",
   contenido:"Se convoca a todos los padres de familia y encargados legales a la reunión general del I Bimestre.\n\nFecha: Viernes 20 de septiembre de 2026\nHora: 6:00 p.m. – 8:00 p.m.\nLugar: Auditorio principal\n\nTemas a tratar:\n• Informe de rendimiento académico por grado\n• Resultados de asistencia del período\n• Presentación del cronograma de evaluaciones\n• Espacio para preguntas y consultas con docentes\n\nSe ruega confirmar asistencia con el tutor antes del 18 de septiembre. En caso de no poder asistir, coordinar una cita individual."},
  {id:"a5",titulo:"Actualización del calendario académico 2026",fecha:"2026-03-01",autor:"Lic. Admin. Principal",categoria:"Administrativo",prioridad:"normal",color:"#8B5CF6",
   resumen:"El calendario académico ha sido actualizado según las disposiciones del Ministerio de Educación.",
   contenido:"Se informa a toda la comunidad educativa que el calendario académico ha sido actualizado en conformidad con las disposiciones del Ministerio de Educación.\n\nPrincipales cambios:\n• Semana de evaluaciones I Bimestre: 28 de septiembre al 2 de octubre\n• Entrega de libretas: 9 de octubre\n• Inicio II Bimestre: 12 de octubre\n• Feriado por fundación institucional: 7 de noviembre\n• Cierre del año escolar: 18 de diciembre\n\nEl calendario completo está disponible en la recepción y en el portal de padres."},
  {id:"a6",titulo:"Bienvenida al Año Escolar 2026",fecha:"2026-02-15",autor:"Lic. Admin. Principal",categoria:"General",prioridad:"normal",color:"#60A5FA",
   resumen:"Les damos la bienvenida al nuevo año escolar. Las clases inician el lunes 2 de marzo a las 7:00 a.m.",
   contenido:"Estimada comunidad educativa,\n\nEs un honor darles la más cordial bienvenida a un nuevo año escolar lleno de aprendizaje, crecimiento y logros.\n\nLes recordamos que las clases inician el lunes 2 de marzo de 2026 a las 7:00 a.m. Se solicita:\n• Puntualidad desde el primer día\n• Uso del uniforme completo\n• Traer los materiales básicos indicados\n\nEsperamos un año productivo y enriquecedor para todos los miembros de nuestra comunidad educativa.\n\n¡Bienvenidos!"},
];

function fmtDate(iso:string){
  const [y,m,d]=iso.split("-");
  const mos=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${mos[Number(m)-1]} ${y}`;
}

export default function StudentAnuncios() {
  const [selected, setSelected] = useState<Anuncio|null>(ANUNCIOS[0]);

  return (
    <div className="flex gap-5 h-full" style={{minHeight:0}}>
      {/* Left: list */}
      <div className="flex flex-col flex-shrink-0 rounded-2xl border overflow-hidden" style={{width:400,background:"#1e2525",borderColor:"#1e2c2c"}}>
        <div className="px-5 py-4 border-b flex-shrink-0" style={{borderColor:"#1e2c2c"}}>
          <div className="flex items-center gap-2">
            <Megaphone size={14} style={{color:"#10B981"}}/>
            <p className="text-sm font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Comunicados</p>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">{ANUNCIOS.length} comunicados institucionales</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y" style={{borderColor:"#1e2c2c"}}>
          {ANUNCIOS.map(a=>{
            const pr=PRIORIDAD_STYLE[a.prioridad];
            const CatIcon=CATEGORIA_ICONS[a.categoria]??Megaphone;
            const isSelected=selected?.id===a.id;
            return (
              <button key={a.id} onClick={()=>setSelected(isSelected?null:a)}
                className="w-full text-left px-4 py-4 transition-all relative"
                style={{background:isSelected?"#1a1f1f":"transparent",borderLeft:`3px solid ${isSelected?a.color:pr.dot}`}}>
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{background:`${a.color}15`}}>
                    <CatIcon size={12} style={{color:a.color}}/>
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs font-bold text-white leading-snug" style={{fontFamily:"var(--font-display)"}}>{a.titulo}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{a.autor}</p>
                  </div>
                  {isSelected&&<ChevronRight size={12} style={{color:a.color,flexShrink:0}}/>}
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 ml-9">{a.resumen}</p>
                <div className="flex items-center gap-2 ml-9 mt-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{background:`${a.color}15`,color:a.color}}>{a.categoria}</span>
                  {a.prioridad!=="normal"&&(
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{background:pr.bg,color:pr.color}}>{pr.label}</span>
                  )}
                  <span className="text-[10px] text-gray-700 ml-auto">{fmtDate(a.fecha)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: detail */}
      {selected ? (
        <div className="flex-1 rounded-2xl border overflow-hidden flex flex-col" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b flex-shrink-0" style={{borderColor:"#1e2c2c"}}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{background:`${selected.color}15`,color:selected.color}}>{selected.categoria}</span>
              {selected.prioridad!=="normal"&&(
                <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{background:PRIORIDAD_STYLE[selected.prioridad].bg,color:PRIORIDAD_STYLE[selected.prioridad].color}}>
                  {PRIORIDAD_STYLE[selected.prioridad].label}
                </span>
              )}
            </div>
            <button onClick={()=>setSelected(null)} className="p-1.5 rounded-lg text-gray-600 hover:text-white transition-colors"><X size={14}/></button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
            <h2 className="text-2xl font-bold text-white leading-snug" style={{fontFamily:"var(--font-display)"}}>{selected.titulo}</h2>

            <div className="flex items-center gap-5 pb-5 border-b" style={{borderColor:"#1e2c2c"}}>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User size={12} className="text-gray-700"/>
                <span>{selected.autor}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} className="text-gray-700"/>
                <span>{fmtDate(selected.fecha)}</span>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{background:"#1e2525",borderColor:"#1e2c2c"}}>
              <p className="text-sm text-gray-200 leading-8 whitespace-pre-line">{selected.contenido}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 rounded-2xl border flex items-center justify-center" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
          <div className="text-center">
            <Megaphone size={32} className="text-gray-700 mx-auto mb-3"/>
            <p className="text-sm text-gray-500">Selecciona un comunicado</p>
          </div>
        </div>
      )}
    </div>
  );
}
