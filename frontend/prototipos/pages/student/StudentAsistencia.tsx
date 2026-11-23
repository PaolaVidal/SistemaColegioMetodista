import { useState, useMemo } from "react";
import { CheckCircle, XCircle, Clock, Calendar, Filter, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

type EstadoAsist = "Presente" | "Ausente" | "Tardanza" | "Justificada";

interface RegistroAsist {
  fecha: string;
  dia: string;
  asignatura: string;
  hora: string;
  estado: EstadoAsist;
}

const ESTADO_STYLE: Record<EstadoAsist, { color:string; bg:string; icon:React.ComponentType<{size?:number}> }> = {
  "Presente":    { color:"#10B981", bg:"#10B98120", icon:CheckCircle },
  "Ausente":     { color:"#EF4444", bg:"#EF444420", icon:XCircle    },
  "Tardanza":    { color:"#F59E0B", bg:"#F59E0B20", icon:Clock      },
  "Justificada": { color:"#60A5FA", bg:"#60A5FA20", icon:Calendar   },
};

const HIST: RegistroAsist[] = [
  {fecha:"2026-09-08",dia:"Mar",asignatura:"Historia y Geografía",hora:"10:30",estado:"Presente"},
  {fecha:"2026-09-08",dia:"Mar",asignatura:"Matemática",          hora:"07:45",estado:"Presente"},
  {fecha:"2026-09-08",dia:"Mar",asignatura:"Comunicación",        hora:"09:00",estado:"Presente"},
  {fecha:"2026-09-05",dia:"Vie",asignatura:"Ed. Física",          hora:"13:30",estado:"Presente"},
  {fecha:"2026-09-05",dia:"Vie",asignatura:"Ciencias Naturales",  hora:"08:30",estado:"Presente"},
  {fecha:"2026-09-04",dia:"Jue",asignatura:"Arte y Cultura",      hora:"14:15",estado:"Tardanza"},
  {fecha:"2026-09-04",dia:"Jue",asignatura:"Matemática",          hora:"07:45",estado:"Presente"},
  {fecha:"2026-09-03",dia:"Mié",asignatura:"Historia y Geografía",hora:"10:30",estado:"Presente"},
  {fecha:"2026-09-03",dia:"Mié",asignatura:"Comunicación",        hora:"09:00",estado:"Presente"},
  {fecha:"2026-09-02",dia:"Mar",asignatura:"Ciencias Naturales",  hora:"08:30",estado:"Presente"},
  {fecha:"2026-09-01",dia:"Lun",asignatura:"Matemática",          hora:"07:45",estado:"Presente"},
  {fecha:"2026-08-29",dia:"Vie",asignatura:"Ed. Física",          hora:"13:30",estado:"Presente"},
  {fecha:"2026-08-28",dia:"Jue",asignatura:"Arte y Cultura",      hora:"14:15",estado:"Presente"},
  {fecha:"2026-08-27",dia:"Mié",asignatura:"Historia y Geografía",hora:"10:30",estado:"Presente"},
  {fecha:"2026-08-26",dia:"Mar",asignatura:"Comunicación",        hora:"09:00",estado:"Presente"},
  {fecha:"2026-08-25",dia:"Lun",asignatura:"Matemática",          hora:"07:45",estado:"Presente"},
  {fecha:"2026-08-22",dia:"Vie",asignatura:"Ciencias Naturales",  hora:"08:30",estado:"Presente"},
  {fecha:"2026-08-21",dia:"Jue",asignatura:"Arte y Cultura",      hora:"14:15",estado:"Presente"},
  {fecha:"2026-08-20",dia:"Mié",asignatura:"Comunicación",        hora:"09:00",estado:"Presente"},
  {fecha:"2026-08-19",dia:"Mar",asignatura:"Matemática",          hora:"07:45",estado:"Presente"},
  {fecha:"2026-08-18",dia:"Lun",asignatura:"Ed. Física",          hora:"13:30",estado:"Presente"},
];

const TREND = [
  {sem:"Ago S1",pct:100},{sem:"Ago S2",pct:100},{sem:"Ago S3",pct:95},
  {sem:"Ago S4",pct:100},{sem:"Sep S1",pct:100},{sem:"Sep S2",pct:96},
];

const ASIGNATURAS_LIST = [...new Set(HIST.map(h=>h.asignatura))].sort();

function fmtDate(iso:string) {
  const [y,m,d]=iso.split("-");
  const mos=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${mos[Number(m)-1]} ${y}`;
}

const CustomTip = ({active,payload,label}:{active?:boolean;payload?:{value:number}[];label?:string}) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 border text-xs" style={{background:"#111616",borderColor:"#1e2c2c"}}>
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="font-bold" style={{color:"#10B981"}}>{payload[0].value}% asistencia</p>
    </div>
  );
};

export default function StudentAsistencia() {
  const [filterAsig, setFilterAsig] = useState("");
  const [filterEstado, setFilterEstado] = useState<EstadoAsist|"">("");

  const presentes   = HIST.filter(h=>h.estado==="Presente").length;
  const ausentes    = HIST.filter(h=>h.estado==="Ausente").length;
  const tardanzas   = HIST.filter(h=>h.estado==="Tardanza").length;
  const justificadas= HIST.filter(h=>h.estado==="Justificada").length;
  const pct = Math.round((presentes/HIST.length)*100);

  const filtered = useMemo(()=>HIST.filter(h=>
    (!filterAsig   || h.asignatura===filterAsig)&&
    (!filterEstado || h.estado===filterEstado)
  ),[filterAsig,filterEstado]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Mi Asistencia</h2>
        <p className="text-xs text-gray-500 mt-0.5">3° Grado · Sección C · Año 2026</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {label:"Asistencia",  value:`${pct}%`,       sub:`${presentes} de ${HIST.length} clases`, color:"#10B981",bg:"#10B98118",icon:CheckCircle},
          {label:"Presentes",   value:String(presentes),sub:"Clases asistidas",                      color:"#10B981",bg:"#10B98118",icon:CheckCircle},
          {label:"Ausencias",   value:String(ausentes+justificadas), sub:`${justificadas} justificadas`,color:"#EF4444",bg:"#EF444418",icon:XCircle},
          {label:"Tardanzas",   value:String(tardanzas),sub:"Llegadas tarde",                         color:"#F59E0B",bg:"#F59E0B18",icon:Clock},
        ].map(({label,value,sub,color,bg,icon:Icon})=>(
          <div key={label} className="rounded-2xl p-5 border" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:bg}}>
              <Icon size={16} style={{color}}/>
            </div>
            <p className="text-2xl font-bold text-white" style={{fontFamily:"var(--font-display)"}}>{value}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="rounded-2xl border p-5" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tendencia de asistencia</p>
        <p className="text-[10px] text-gray-600 mb-4">Porcentaje semanal · Agosto – Septiembre 2026</p>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={TREND}>
            <CartesianGrid stroke="#1e2c2c" vertical={false}/>
            <XAxis dataKey="sem" tick={{fontSize:10,fill:"#6B7280"}} axisLine={false} tickLine={false}/>
            <YAxis domain={[80,100]} tick={{fontSize:10,fill:"#6B7280"}} axisLine={false} tickLine={false} width={28}/>
            <Tooltip content={<CustomTip/>}/>
            <Line type="monotone" dataKey="pct" stroke="#10B981" strokeWidth={2.5} dot={{fill:"#10B981",r:4}} name="Asistencia"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Historial */}
      <div className="rounded-2xl border overflow-hidden" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
        <div className="flex items-center gap-3 px-5 py-3 border-b" style={{borderColor:"#1e2c2c",background:"#1e2525"}}>
          <Filter size={12} className="text-gray-600"/>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex-1">Historial</p>
          <select value={filterAsig} onChange={e=>setFilterAsig(e.target.value)}
            className="bg-transparent outline-none text-xs text-gray-500 border rounded-lg px-2 py-1" style={{borderColor:"#2e3939"}}>
            <option value="" style={{background:"#111616"}}>Todas las asignaturas</option>
            {ASIGNATURAS_LIST.map(a=><option key={a} value={a} style={{background:"#111616"}}>{a}</option>)}
          </select>
          <select value={filterEstado} onChange={e=>setFilterEstado(e.target.value as EstadoAsist|"")}
            className="bg-transparent outline-none text-xs text-gray-500 border rounded-lg px-2 py-1" style={{borderColor:"#2e3939"}}>
            <option value="" style={{background:"#111616"}}>Todos los estados</option>
            {(["Presente","Ausente","Tardanza","Justificada"] as EstadoAsist[]).map(e=><option key={e} value={e} style={{background:"#111616"}}>{e}</option>)}
          </select>
          {(filterAsig||filterEstado) && (
            <button onClick={()=>{setFilterAsig("");setFilterEstado("");}} className="text-gray-600 hover:text-gray-400">
              <RotateCcw size={12}/>
            </button>
          )}
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{background:"#161b1b"}}>
              {["Fecha","Día","Asignatura","Hora","Estado"].map(h=>(
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{borderColor:"#1e2c2c"}}>
            {filtered.map((r,i)=>{
              const s=ESTADO_STYLE[r.estado]; const Icon=s.icon;
              return (
                <tr key={i} style={{background:i%2===0?"#1a1f1f":"#161b1b"}}>
                  <td className="px-5 py-3 text-gray-400">{fmtDate(r.fecha)}</td>
                  <td className="px-5 py-3 text-gray-600">{r.dia}</td>
                  <td className="px-5 py-3 font-medium text-gray-200">{r.asignatura}</td>
                  <td className="px-5 py-3 font-mono text-gray-500">{r.hora}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{background:s.bg,color:s.color}}>
                      <Icon size={10}/>{r.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0&&(
          <div className="text-center py-10 text-gray-600 text-sm">Sin registros para los filtros aplicados</div>
        )}
      </div>
    </div>
  );
}
