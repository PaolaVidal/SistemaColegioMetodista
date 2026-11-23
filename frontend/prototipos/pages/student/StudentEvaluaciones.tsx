import { useState } from "react";
import { FileText, Clock, User, CheckCircle, X, Calendar } from "lucide-react";

interface Evaluacion {
  id: number;
  nombre: string;
  asignatura: string;
  fecha: string;
  hora: string;
  seccion: string;
  docente: string;
  tipo: string;
  nota?: number;
  color: string;
}

const PROXIMAS: Evaluacion[] = [
  {id:1,nombre:"Examen Unidad 3 — Álgebra",   asignatura:"Matemática",          fecha:"2026-09-28",hora:"07:45",seccion:"C",docente:"Prof. Carmen López",tipo:"Examen escrito",color:"#00ADEB"},
  {id:2,nombre:"Evaluación oral — Lectura",    asignatura:"Comunicación",        fecha:"2026-10-01",hora:"09:00",seccion:"C",docente:"Prof. Rosa Mamani", tipo:"Evaluación oral",color:"#10B981"},
  {id:3,nombre:"Práctica calificada — Lab",    asignatura:"Ciencias Naturales",  fecha:"2026-10-02",hora:"08:30",seccion:"C",docente:"Prof. Ana Delgado", tipo:"Práctica",color:"#8B5CF6"},
  {id:4,nombre:"Prueba Historia Contemporánea",asignatura:"Historia y Geografía",fecha:"2026-10-02",hora:"10:45",seccion:"C",docente:"Lic. Luis Vera",    tipo:"Examen escrito",color:"#F59E0B"},
];

const ANTERIORES: Evaluacion[] = [
  {id:5,nombre:"Examen Unidad 2 — Fracciones", asignatura:"Matemática",          fecha:"2026-08-18",hora:"07:45",seccion:"C",docente:"Prof. Carmen López",tipo:"Examen escrito",nota:20,color:"#00ADEB"},
  {id:6,nombre:"Comprensión de textos I",       asignatura:"Comunicación",        fecha:"2026-08-12",hora:"09:00",seccion:"C",docente:"Prof. Rosa Mamani", tipo:"Evaluación escrita",nota:18,color:"#10B981"},
  {id:7,nombre:"Quiz — Sistema solar",          asignatura:"Ciencias Naturales",  fecha:"2026-08-07",hora:"08:30",seccion:"C",docente:"Prof. Ana Delgado", tipo:"Quiz",nota:20,color:"#8B5CF6"},
  {id:8,nombre:"Evaluación — La Independencia", asignatura:"Historia y Geografía",fecha:"2026-07-25",hora:"10:45",seccion:"C",docente:"Lic. Luis Vera",    tipo:"Examen escrito",nota:18,color:"#F59E0B"},
  {id:9,nombre:"Portafolio Arte — I Bimestre",  asignatura:"Arte y Cultura",      fecha:"2026-07-20",hora:"14:15",seccion:"C",docente:"Prof. Julia Torres",tipo:"Portafolio",nota:17,color:"#EC4899"},
];

function fmtDate(iso:string){
  const [y,m,d]=iso.split("-");
  const mos=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${mos[Number(m)-1]} ${y}`;
}
function diasRestantes(iso:string){
  const diff=Math.ceil((new Date(iso).getTime()-new Date("2026-09-08").getTime())/(1000*60*60*24));
  return diff===1?"Mañana":diff>0?`En ${diff} días`:diff===0?"Hoy":`Hace ${Math.abs(diff)} días`;
}
function nivelColor(n:number){return n>=17?"#10B981":n>=14?"#00ADEB":n>=11?"#F59E0B":"#EF4444";}

function EvalCard({ev,onClick,selected}:{ev:Evaluacion;onClick:()=>void;selected:boolean}){
  const isProxima=!ev.nota;
  return (
    <div onClick={onClick} className="rounded-2xl border p-4 cursor-pointer transition-all"
      style={{background:selected?`${ev.color}08`:"#1a1f1f",borderColor:selected?ev.color:"#1e2c2c"}}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${ev.color}18`}}>
          <FileText size={15} style={{color:ev.color}}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight" style={{fontFamily:"var(--font-display)"}}>{ev.nombre}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{ev.asignatura} · {ev.tipo}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-600">
            <span className="flex items-center gap-1"><Calendar size={10}/>{fmtDate(ev.fecha)}</span>
            <span className="flex items-center gap-1"><Clock size={10}/>{ev.hora}</span>
          </div>
        </div>
        {isProxima?(
          <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{background:`${ev.color}18`,color:ev.color}}>
            {diasRestantes(ev.fecha)}
          </span>
        ):(
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold" style={{color:nivelColor(ev.nota!),fontFamily:"var(--font-display)"}}>{ev.nota}</p>
            <p className="text-[10px] text-gray-600">/ 20</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentEvaluaciones() {
  const [selected, setSelected] = useState<Evaluacion|null>(null);

  function toggle(ev:Evaluacion){setSelected(s=>s?.id===ev.id?null:ev);}

  return (
    <div className="flex gap-5 h-full" style={{minHeight:0}}>
      <div className="flex-1 min-w-0 space-y-5 overflow-y-auto pr-1">
        <div>
          <h2 className="text-lg font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Mis Evaluaciones</h2>
          <p className="text-xs text-gray-500 mt-0.5">3° Grado · Sección C · 2026</p>
        </div>

        {/* Próximas */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{background:"#00ADEB"}}/>
            <p className="text-sm font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Próximas evaluaciones</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:"#00ADEB18",color:"#00ADEB"}}>{PROXIMAS.length}</span>
          </div>
          <div className="space-y-3">
            {PROXIMAS.map(ev=><EvalCard key={ev.id} ev={ev} onClick={()=>toggle(ev)} selected={selected?.id===ev.id}/>)}
          </div>
        </div>

        {/* Anteriores */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{background:"#10B981"}}/>
            <p className="text-sm font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Evaluaciones anteriores</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:"#10B98118",color:"#10B981"}}>{ANTERIORES.length}</span>
          </div>
          <div className="space-y-3">
            {ANTERIORES.map(ev=><EvalCard key={ev.id} ev={ev} onClick={()=>toggle(ev)} selected={selected?.id===ev.id}/>)}
          </div>
        </div>
      </div>

      {/* Detail */}
      {selected&&(
        <div className="flex-shrink-0 rounded-2xl border overflow-hidden flex flex-col" style={{width:360,background:"#1a1f1f",borderColor:selected.color,minHeight:0}}>
          <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{borderColor:"#1e2c2c"}}>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detalle</span>
            <button onClick={()=>setSelected(null)} className="text-gray-600 hover:text-white"><X size={14}/></button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${selected.color}18`}}>
                <FileText size={18} style={{color:selected.color}}/>
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-snug" style={{fontFamily:"var(--font-display)"}}>{selected.nombre}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selected.asignatura}</p>
              </div>
            </div>

            {selected.nota&&(
              <div className="rounded-2xl border p-4 text-center" style={{background:`${selected.color}10`,borderColor:`${selected.color}30`}}>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Calificación obtenida</p>
                <p className="text-4xl font-bold" style={{color:nivelColor(selected.nota),fontFamily:"var(--font-display)"}}>{selected.nota}</p>
                <p className="text-sm text-gray-500 mt-0.5">de 20 puntos</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <CheckCircle size={13} style={{color:nivelColor(selected.nota)}}/>
                  <span className="text-xs font-semibold" style={{color:nivelColor(selected.nota)}}>
                    {selected.nota>=17?"Destacado":selected.nota>=14?"Logrado":selected.nota>=11?"En proceso":"En inicio"}
                  </span>
                </div>
              </div>
            )}

            {[
              {icon:FileText, label:"Tipo",    value:selected.tipo},
              {icon:User,     label:"Docente", value:selected.docente},
              {icon:Calendar, label:"Fecha",   value:fmtDate(selected.fecha)},
              {icon:Clock,    label:"Hora",    value:selected.hora},
            ].map(({icon:Icon,label,value})=>(
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl border" style={{background:"#161b1b",borderColor:"#1e2c2c"}}>
                <Icon size={13} className="text-gray-600 flex-shrink-0"/>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">{label}</p>
                  <p className="text-xs text-gray-300 mt-0.5 font-medium">{value}</p>
                </div>
              </div>
            ))}

            {!selected.nota&&(
              <div className="rounded-xl border p-4" style={{background:"#10B98110",borderColor:"#10B98130"}}>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Revisa tu horario de evaluaciones y prepárate con anticipación.
                  <span className="font-semibold text-[#10B981]"> {diasRestantes(selected.fecha)}</span> para esta evaluación.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
