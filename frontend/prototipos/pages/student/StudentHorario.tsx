import { useState } from "react";
import { X, Clock, User, MapPin, BookOpen } from "lucide-react";

interface Bloque {
  asignatura: string;
  docente: string;
  aula: string;
  color: string;
}

type SlotKey = `${number}-${number}`; // `dia-slot`

const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes"];
const DIAS_SHORT = ["Lun","Mar","Mié","Jue","Vie"];

const SLOTS = [
  {idx:0, label:"07:00–07:45"},
  {idx:1, label:"07:45–08:30"},
  {idx:2, label:"08:30–09:15"},
  {idx:3, label:"09:15–10:00"},
  {idx:4, label:"10:00–10:45"},
  {idx:5, label:"10:45–11:30"},
  {idx:6, label:"11:30–12:15"},
  {idx:7, label:"12:15–13:00"},
  {idx:8, label:"13:00–13:45"},
  {idx:9, label:"13:45–14:30"},
  {idx:10,label:"14:30–15:15"},
  {idx:11,label:"15:15–16:00"},
  {idx:12,label:"16:00–16:45"},
];

const COLORS: Record<string,{bg:string;text:string;border:string}> = {
  "Matemática":          {bg:"#00ADEB15",text:"#00ADEB",border:"#00ADEB30"},
  "Comunicación":        {bg:"#10B98115",text:"#10B981",border:"#10B98130"},
  "Ciencias Naturales":  {bg:"#8B5CF615",text:"#8B5CF6",border:"#8B5CF630"},
  "Historia y Geografía":{bg:"#F59E0B15",text:"#F59E0B",border:"#F59E0B30"},
  "Arte y Cultura":      {bg:"#EC489915",text:"#EC4899",border:"#EC489930"},
  "Ed. Física":          {bg:"#10B98115",text:"#34D399",border:"#34D39930"},
  "Hora libre":          {bg:"#37415112",text:"#6B7280",border:"#37415130"},
};

// Horario semanal de Valeria Torres — 3°C
// dia(0-4), slot(0-12) → Bloque
const HORARIO: Record<SlotKey, Bloque> = {
  "0-0":  {asignatura:"Matemática",         docente:"Prof. Carmen López", aula:"Aula 5", color:"#00ADEB"},
  "0-1":  {asignatura:"Matemática",         docente:"Prof. Carmen López", aula:"Aula 5", color:"#00ADEB"},
  "0-2":  {asignatura:"Comunicación",       docente:"Prof. Rosa Mamani",  aula:"Aula 5", color:"#10B981"},
  "0-3":  {asignatura:"Comunicación",       docente:"Prof. Rosa Mamani",  aula:"Aula 5", color:"#10B981"},
  "0-4":  {asignatura:"Hora libre",         docente:"—",                  aula:"—",      color:"#6B7280"},
  "0-5":  {asignatura:"Historia y Geografía",docente:"Lic. Luis Vera",    aula:"Aula 8", color:"#F59E0B"},
  "0-6":  {asignatura:"Historia y Geografía",docente:"Lic. Luis Vera",    aula:"Aula 8", color:"#F59E0B"},
  "0-7":  {asignatura:"Ed. Física",         docente:"Prof. Pedro Luna",   aula:"Campo",  color:"#34D399"},
  "0-8":  {asignatura:"Ed. Física",         docente:"Prof. Pedro Luna",   aula:"Campo",  color:"#34D399"},
  "1-0":  {asignatura:"Comunicación",       docente:"Prof. Rosa Mamani",  aula:"Aula 5", color:"#10B981"},
  "1-1":  {asignatura:"Comunicación",       docente:"Prof. Rosa Mamani",  aula:"Aula 5", color:"#10B981"},
  "1-2":  {asignatura:"Ciencias Naturales", docente:"Prof. Ana Delgado",  aula:"Lab. 2", color:"#8B5CF6"},
  "1-3":  {asignatura:"Ciencias Naturales", docente:"Prof. Ana Delgado",  aula:"Lab. 2", color:"#8B5CF6"},
  "1-4":  {asignatura:"Matemática",         docente:"Prof. Carmen López", aula:"Aula 5", color:"#00ADEB"},
  "1-5":  {asignatura:"Matemática",         docente:"Prof. Carmen López", aula:"Aula 5", color:"#00ADEB"},
  "1-6":  {asignatura:"Hora libre",         docente:"—",                  aula:"—",      color:"#6B7280"},
  "1-7":  {asignatura:"Arte y Cultura",     docente:"Prof. Julia Torres", aula:"Aula 11",color:"#EC4899"},
  "1-8":  {asignatura:"Arte y Cultura",     docente:"Prof. Julia Torres", aula:"Aula 11",color:"#EC4899"},
  "2-0":  {asignatura:"Historia y Geografía",docente:"Lic. Luis Vera",    aula:"Aula 8", color:"#F59E0B"},
  "2-1":  {asignatura:"Historia y Geografía",docente:"Lic. Luis Vera",    aula:"Aula 8", color:"#F59E0B"},
  "2-2":  {asignatura:"Matemática",         docente:"Prof. Carmen López", aula:"Aula 5", color:"#00ADEB"},
  "2-3":  {asignatura:"Matemática",         docente:"Prof. Carmen López", aula:"Aula 5", color:"#00ADEB"},
  "2-4":  {asignatura:"Comunicación",       docente:"Prof. Rosa Mamani",  aula:"Aula 5", color:"#10B981"},
  "2-5":  {asignatura:"Ciencias Naturales", docente:"Prof. Ana Delgado",  aula:"Lab. 2", color:"#8B5CF6"},
  "2-6":  {asignatura:"Ciencias Naturales", docente:"Prof. Ana Delgado",  aula:"Lab. 2", color:"#8B5CF6"},
  "2-7":  {asignatura:"Hora libre",         docente:"—",                  aula:"—",      color:"#6B7280"},
  "3-0":  {asignatura:"Ciencias Naturales", docente:"Prof. Ana Delgado",  aula:"Lab. 2", color:"#8B5CF6"},
  "3-1":  {asignatura:"Ciencias Naturales", docente:"Prof. Ana Delgado",  aula:"Lab. 2", color:"#8B5CF6"},
  "3-2":  {asignatura:"Historia y Geografía",docente:"Lic. Luis Vera",    aula:"Aula 8", color:"#F59E0B"},
  "3-3":  {asignatura:"Arte y Cultura",     docente:"Prof. Julia Torres", aula:"Aula 11",color:"#EC4899"},
  "3-4":  {asignatura:"Arte y Cultura",     docente:"Prof. Julia Torres", aula:"Aula 11",color:"#EC4899"},
  "3-5":  {asignatura:"Matemática",         docente:"Prof. Carmen López", aula:"Aula 5", color:"#00ADEB"},
  "3-6":  {asignatura:"Matemática",         docente:"Prof. Carmen López", aula:"Aula 5", color:"#00ADEB"},
  "3-7":  {asignatura:"Comunicación",       docente:"Prof. Rosa Mamani",  aula:"Aula 5", color:"#10B981"},
  "3-8":  {asignatura:"Hora libre",         docente:"—",                  aula:"—",      color:"#6B7280"},
  "4-0":  {asignatura:"Arte y Cultura",     docente:"Prof. Julia Torres", aula:"Aula 11",color:"#EC4899"},
  "4-1":  {asignatura:"Comunicación",       docente:"Prof. Rosa Mamani",  aula:"Aula 5", color:"#10B981"},
  "4-2":  {asignatura:"Comunicación",       docente:"Prof. Rosa Mamani",  aula:"Aula 5", color:"#10B981"},
  "4-3":  {asignatura:"Ed. Física",         docente:"Prof. Pedro Luna",   aula:"Campo",  color:"#34D399"},
  "4-4":  {asignatura:"Ed. Física",         docente:"Prof. Pedro Luna",   aula:"Campo",  color:"#34D399"},
  "4-5":  {asignatura:"Ciencias Naturales", docente:"Prof. Ana Delgado",  aula:"Lab. 2", color:"#8B5CF6"},
  "4-6":  {asignatura:"Hora libre",         docente:"—",                  aula:"—",      color:"#6B7280"},
  "4-7":  {asignatura:"Historia y Geografía",docente:"Lic. Luis Vera",    aula:"Aula 8", color:"#F59E0B"},
  "4-8":  {asignatura:"Historia y Geografía",docente:"Lic. Luis Vera",    aula:"Aula 8", color:"#F59E0B"},
};

const HOY_DIA = 1; // Martes

export default function StudentHorario() {
  const [selected, setSelected] = useState<{dia:number;slot:number;bloque:Bloque}|null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Mi Horario</h2>
          <p className="text-xs text-gray-500 mt-0.5">3° Grado · Sección C · Semana actual</p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(COLORS).filter(([k])=>k!=="Hora libre").map(([asig,c])=>(
            <span key={asig} className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border"
              style={{background:c.bg,color:c.text,borderColor:c.border}}>
              <span className="w-1.5 h-1.5 rounded-full" style={{background:c.text}}/>
              {asig.split(" ")[0]}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Grid */}
        <div className="flex-1 rounded-2xl border overflow-hidden" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
          <table className="w-full" style={{borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#161b1b"}}>
                <th className="px-3 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-28">Hora</th>
                {DIAS.map((d,i)=>(
                  <th key={d} className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wider"
                    style={{color:i===HOY_DIA?"#10B981":"#6B7280",
                            background:i===HOY_DIA?"#10B98108":"transparent"}}>
                    <p>{DIAS_SHORT[i]}</p>
                    {i===HOY_DIA&&<p className="text-[9px] font-normal mt-0.5 text-[#10B98180]">Hoy</p>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map(({idx,label})=>(
                <tr key={idx} style={{borderTop:"1px solid #1e2c2c"}}>
                  <td className="px-3 py-1.5 text-[10px] font-mono text-gray-700 whitespace-nowrap w-28">{label}</td>
                  {DIAS.map((_,diaIdx)=>{
                    const key:SlotKey=`${diaIdx}-${idx}`;
                    const bloque=HORARIO[key];
                    const c=bloque?COLORS[bloque.asignatura]:null;
                    const isSelected=selected?.dia===diaIdx&&selected?.slot===idx;
                    const isToday=diaIdx===HOY_DIA;
                    return (
                      <td key={diaIdx} className="px-1.5 py-1" style={{background:isToday?"#10B98105":"transparent"}}>
                        {bloque?(
                          <button onClick={()=>setSelected(isSelected?null:{dia:diaIdx,slot:idx,bloque})}
                            className="w-full rounded-lg px-2 py-2 text-left transition-all hover:opacity-90"
                            style={{background:isSelected?`${bloque.color}25`:c!.bg,border:`1px solid ${isSelected?bloque.color:c!.border}`}}>
                            <p className="text-[10px] font-bold leading-tight truncate" style={{color:bloque.color,fontFamily:"var(--font-display)"}}>{bloque.asignatura.split(" ")[0]}</p>
                            {bloque.asignatura!=="Hora libre"&&<p className="text-[9px] text-gray-600 mt-0.5 truncate">{bloque.aula}</p>}
                          </button>
                        ):(
                          <div className="h-8"/>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="flex-shrink-0 rounded-2xl border overflow-hidden flex flex-col" style={{width:300,background:"#1a1f1f",borderColor:selected.bloque.color}}>
            <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{borderColor:"#1e2c2c"}}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detalle de clase</p>
              <button onClick={()=>setSelected(null)} className="text-gray-600 hover:text-white transition-colors"><X size={13}/></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{background:`${selected.bloque.color}18`}}>
                  <BookOpen size={16} style={{color:selected.bloque.color}}/>
                </div>
                <div>
                  <p className="text-sm font-bold text-white" style={{fontFamily:"var(--font-display)"}}>{selected.bloque.asignatura}</p>
                  <p className="text-[11px] text-gray-500">{DIAS[selected.dia]}</p>
                </div>
              </div>
              {[
                {icon:Clock,   label:"Horario", value:SLOTS[selected.slot].label},
                {icon:User,    label:"Docente",  value:selected.bloque.docente},
                {icon:MapPin,  label:"Aula",     value:selected.bloque.aula},
              ].map(({icon:Icon,label,value})=>(
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl border" style={{background:"#161b1b",borderColor:"#1e2c2c"}}>
                  <Icon size={13} className="text-gray-600 flex-shrink-0"/>
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">{label}</p>
                    <p className="text-xs text-gray-300 mt-0.5 font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
