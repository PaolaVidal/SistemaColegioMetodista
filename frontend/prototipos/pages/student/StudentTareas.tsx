import { useState } from "react";
import { X, Clock, CheckCircle, AlertTriangle, Calendar, BookOpen, User, FileText } from "lucide-react";

type TareaEstado = "Pendiente" | "Próxima" | "Vencida" | "Completada";

interface Tarea {
  id: number;
  titulo: string;
  asignatura: string;
  descripcion: string;
  publicacion: string;
  entrega: string;
  estado: TareaEstado;
  docente: string;
  color: string;
}

const ESTADO_STYLE: Record<TareaEstado,{color:string;bg:string;border:string;icon:React.ComponentType<{size?:number}>}> = {
  "Pendiente":  {color:"#F59E0B",bg:"#F59E0B18",border:"#F59E0B30",icon:Clock        },
  "Próxima":    {color:"#00ADEB",bg:"#00ADEB18",border:"#00ADEB30",icon:Calendar     },
  "Vencida":    {color:"#EF4444",bg:"#EF444418",border:"#EF444430",icon:AlertTriangle},
  "Completada": {color:"#10B981",bg:"#10B98118",border:"#10B98130",icon:CheckCircle  },
};

const TAREAS: Tarea[] = [
  {id:1,titulo:"Resumen: La Revolución Industrial",asignatura:"Historia y Geografía",
   descripcion:"Elaborar un resumen de 2 páginas sobre los principales cambios económicos, sociales y tecnológicos de la Revolución Industrial. Incluir línea de tiempo y al menos 3 consecuencias para el mundo actual.",
   publicacion:"2026-09-05",entrega:"2026-09-12",estado:"Pendiente",docente:"Lic. Luis Vera",color:"#F59E0B"},
  {id:2,titulo:"Maqueta del sistema solar",asignatura:"Ciencias Naturales",
   descripcion:"Construir una maqueta en escala del sistema solar utilizando materiales reciclados. Debe incluir los 8 planetas con sus tamaños proporcionales y nombres. Se valorará la creatividad y precisión.",
   publicacion:"2026-09-07",entrega:"2026-09-15",estado:"Próxima",docente:"Prof. Ana Delgado",color:"#8B5CF6"},
  {id:3,titulo:"Ejercicios de álgebra — Capítulo 4",asignatura:"Matemática",
   descripcion:"Resolver todos los ejercicios del capítulo 4 del libro de trabajo (páginas 67–72). Mostrar procedimiento completo. Los ejercicios deben presentarse en papel cuadriculado con nombre y fecha.",
   publicacion:"2026-09-08",entrega:"2026-09-19",estado:"Próxima",docente:"Prof. Carmen López",color:"#00ADEB"},
  {id:4,titulo:"Dibujo: Autorretrato técnico",asignatura:"Arte y Cultura",
   descripcion:"Crear un autorretrato utilizando la técnica de sombreado aprendida en clase. Tamaño A4, lápiz 2B y 4B. Observar proporciones del rostro. Incluir hoja de reflexión sobre el proceso creativo.",
   publicacion:"2026-08-25",entrega:"2026-09-01",estado:"Completada",docente:"Prof. Julia Torres",color:"#10B981"},
  {id:5,titulo:"Lectura: El Principito — Capítulos 1–10",asignatura:"Comunicación",
   descripcion:"Leer los primeros 10 capítulos de El Principito. Preparar 5 preguntas de comprensión lectora y un párrafo de opinión personal sobre el personaje principal.",
   publicacion:"2026-08-18",entrega:"2026-08-28",estado:"Completada",docente:"Prof. Rosa Mamani",color:"#10B981"},
  {id:6,titulo:"Investigación: Ecosistemas del Perú",asignatura:"Ciencias Naturales",
   descripcion:"Investigar sobre los 3 principales ecosistemas del Perú (costa, sierra, selva). Presentar en formato de informe: introducción, desarrollo con características y biodiversidad, conclusiones y bibliografía.",
   publicacion:"2026-08-10",entrega:"2026-08-20",estado:"Vencida",docente:"Prof. Ana Delgado",color:"#EF4444"},
];

const TABS: TareaEstado[] = ["Pendiente","Próxima","Vencida","Completada"];
const ALL_TAB = "Todas";

function fmtDate(iso:string){
  const [y,m,d]=iso.split("-");
  const mos=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${mos[Number(m)-1]} ${y}`;
}
function diasRestantes(iso:string){
  const diff=Math.ceil((new Date(iso).getTime()-new Date("2026-09-08").getTime())/(1000*60*60*24));
  if (diff<0) return `Venció hace ${Math.abs(diff)} días`;
  if (diff===0) return "Vence hoy";
  return `Vence en ${diff} días`;
}

export default function StudentTareas() {
  const [tab, setTab] = useState<TareaEstado|"Todas">("Todas");
  const [selected, setSelected] = useState<Tarea|null>(null);

  const visible = tab==="Todas" ? TAREAS : TAREAS.filter(t=>t.estado===tab);
  const counts: Record<string,number> = Object.fromEntries(
    ([ALL_TAB,...TABS]).map(t=>[t,t===ALL_TAB?TAREAS.length:TAREAS.filter(x=>x.estado===t).length])
  );

  return (
    <div className="flex gap-5 h-full" style={{minHeight:0}}>
      {/* Left: list */}
      <div className="flex flex-col flex-1 min-w-0" style={{minHeight:0}}>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Mis Tareas</h2>
          <p className="text-xs text-gray-500 mt-0.5">3° Grado · Sección C · 2026</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{background:"#1a1f1f",border:"1px solid #1e2c2c"}}>
          {[ALL_TAB,...TABS].map(t=>{
            const active=tab===t;
            const s=t!==ALL_TAB?ESTADO_STYLE[t as TareaEstado]:null;
            return (
              <button key={t} onClick={()=>setTab(t as TareaEstado|"Todas")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{background:active?(s?.bg??("#10B98118")):"transparent",color:active?(s?.color??"#10B981"):"#6B7280"}}>
                {t} {counts[t]>0&&<span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{background:"#37415130"}}>{counts[t]}</span>}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {visible.map(t=>{
            const s=ESTADO_STYLE[t.estado]; const Icon=s.icon;
            const isSelected=selected?.id===t.id;
            return (
              <div key={t.id} onClick={()=>setSelected(isSelected?null:t)}
                className="rounded-2xl border p-4 cursor-pointer transition-all"
                style={{background:isSelected?`${t.color}08`:"#1a1f1f",borderColor:isSelected?t.color:"#1e2c2c"}}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{background:`${t.color}18`}}>
                      <BookOpen size={14} style={{color:t.color}}/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white leading-tight" style={{fontFamily:"var(--font-display)"}}>{t.titulo}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{t.asignatura}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0" style={{background:s.bg,color:s.color}}>
                    <Icon size={10}/>{t.estado}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed mb-3 ml-10">{t.descripcion}</p>
                <div className="flex items-center gap-4 ml-10 text-[10px] text-gray-600">
                  <span className="flex items-center gap-1"><Calendar size={10}/>{fmtDate(t.entrega)}</span>
                  <span className="flex items-center gap-1"><Clock size={10}/>{diasRestantes(t.entrega)}</span>
                </div>
              </div>
            );
          })}
          {visible.length===0&&(
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle size={32} className="text-gray-700 mb-3"/>
              <p className="text-sm text-gray-500">Sin tareas en esta categoría</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: detail */}
      {selected && (
        <div className="flex-shrink-0 rounded-2xl border overflow-hidden flex flex-col" style={{width:420,background:"#1a1f1f",borderColor:selected.color,minHeight:0}}>
          <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{borderColor:"#1e2c2c"}}>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{background:ESTADO_STYLE[selected.estado].bg,color:ESTADO_STYLE[selected.estado].color}}>
              {(() => { const Icon = ESTADO_STYLE[selected.estado].icon; return <Icon size={11}/>; })()}
              {selected.estado}
            </span>
            <button onClick={()=>setSelected(null)} className="p-1.5 rounded-lg text-gray-600 hover:text-white transition-colors"><X size={14}/></button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${selected.color}18`}}>
                <FileText size={18} style={{color:selected.color}}/>
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-snug" style={{fontFamily:"var(--font-display)"}}>{selected.titulo}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selected.asignatura}</p>
              </div>
            </div>
            {[
              {label:"Docente",label2:"",icon:User,value:selected.docente},
              {label:"Publicado",label2:"",icon:Calendar,value:fmtDate(selected.publicacion)},
              {label:"Fecha de entrega",label2:"",icon:Clock,value:`${fmtDate(selected.entrega)} · ${diasRestantes(selected.entrega)}`},
            ].map(({label,icon:Icon,value})=>(
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl border" style={{background:"#161b1b",borderColor:"#1e2c2c"}}>
                <Icon size={13} className="text-gray-600 flex-shrink-0"/>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">{label}</p>
                  <p className="text-xs text-gray-300 mt-0.5 font-medium">{value}</p>
                </div>
              </div>
            ))}
            <div className="rounded-xl border p-4" style={{background:"#161b1b",borderColor:"#1e2c2c"}}>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2">Descripción</p>
              <p className="text-sm text-gray-300 leading-7">{selected.descripcion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
