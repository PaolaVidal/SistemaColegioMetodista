import { useState } from "react";
import { TrendingUp, Award, BookOpen, ChevronDown } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend,
} from "recharts";

const PERIODOS = ["I Bimestre","II Bimestre","III Bimestre","IV Bimestre"];

const ASIGNATURAS = ["Matemática","Comunicación","Ciencias Naturales","Historia y Geografía","Arte y Cultura","Ed. Física"];

// Notas por período [I, II, III, IV]
const NOTAS_DATA: Record<string, number[]> = {
  "Matemática":          [20, 19, 18, 20],
  "Comunicación":        [18, 17, 18, 19],
  "Ciencias Naturales":  [20, 19, 19, 20],
  "Historia y Geografía":[18, 18, 17, 18],
  "Arte y Cultura":      [17, 18, 19, 18],
  "Ed. Física":          [19, 20, 19, 20],
};

const DOCENTES: Record<string, string> = {
  "Matemática":          "Prof. Carmen López",
  "Comunicación":        "Prof. Rosa Mamani",
  "Ciencias Naturales":  "Prof. Ana Delgado",
  "Historia y Geografía":"Lic. Luis Vera",
  "Arte y Cultura":      "Prof. Julia Torres",
  "Ed. Física":          "Prof. Pedro Luna",
};

const NIVEL_COLORS: Record<string, { text:string; bg:string; label:string }> = {
  destacado:  { text:"#10B981", bg:"#10B98120", label:"Destacado"  },
  logrado:    { text:"#00ADEB", bg:"#00ADEB20", label:"Logrado"    },
  proceso:    { text:"#F59E0B", bg:"#F59E0B20", label:"En proceso" },
  inicio:     { text:"#EF4444", bg:"#EF444420", label:"En inicio"  },
};
function nivelKey(n:number) { return n>=17?"destacado":n>=14?"logrado":n>=11?"proceso":"inicio"; }

const CHART_COLORS = ["#10B981","#00ADEB","#8B5CF6","#F59E0B","#EC4899","#60A5FA"];

const CustomTip = ({ active, payload, label }: {active?:boolean;payload?:{value:number;name:string;color:string}[];label?:string}) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 border text-xs space-y-1" style={{background:"#111616",borderColor:"#1e2c2c"}}>
      {label && <p className="text-gray-400 mb-1 font-medium">{label}</p>}
      {payload.map((p,i)=><p key={i} style={{color:p.color}} className="font-semibold">{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function StudentRendimiento() {
  const [periodo, setPeriodo] = useState(0);

  const notas = ASIGNATURAS.map((a,i) => ({
    asignatura: a,
    nota: NOTAS_DATA[a][periodo],
    docente: DOCENTES[a],
    color: CHART_COLORS[i],
  }));

  const promedio = +(notas.reduce((s,n)=>s+n.nota,0)/notas.length).toFixed(1);
  const mejor = [...notas].sort((a,b)=>b.nota-a.nota)[0];
  const nivel = NIVEL_COLORS[nivelKey(promedio)];

  // Trend across periods
  const tendencia = PERIODOS.map((p,i) => {
    const avg = ASIGNATURAS.reduce((s,a)=>s+NOTAS_DATA[a][i],0)/ASIGNATURAS.length;
    return { periodo: p.split(" ")[0], promedio: +avg.toFixed(1) };
  });

  // Radar data
  const radarData = notas.map(n => ({ asignatura: n.asignatura.split(" ")[0], nota: n.nota }));

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Rendimiento académico</h2>
          <p className="text-xs text-gray-500 mt-0.5">3° Grado · Sección C · 2026</p>
        </div>
        <div className="relative">
          <select value={periodo} onChange={e=>setPeriodo(Number(e.target.value))}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-semibold text-white outline-none"
            style={{background:"#1a1f1f",border:"1px solid #1e2c2c",fontFamily:"var(--font-display)"}}>
            {PERIODOS.map((p,i)=><option key={i} value={i} style={{background:"#111616"}}>{p}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {label:"Promedio general", value:`${promedio}`, sub:"Sobre 20 pts", icon:TrendingUp, color:"#10B981", bg:"#10B98118"},
          {label:"Nivel académico",  value:nivel.label,  sub:"Calificación", icon:Award,     color:nivel.text, bg:nivel.bg},
          {label:"Mejor asignatura", value:mejor.nota.toString(), sub:mejor.asignatura.split(" ")[0], icon:BookOpen, color:"#00ADEB", bg:"#00ADEB18"},
          {label:"Asignaturas",      value:`${notas.filter(n=>n.nota>=14).length}/${notas.length}`, sub:"Con nota aprobatoria", icon:BookOpen, color:"#8B5CF6",bg:"#8B5CF620"},
        ].map(({label,value,sub,icon:Icon,color,bg})=>(
          <div key={label} className="rounded-2xl p-5 border" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:bg}}>
              <Icon size={16} style={{color}}/>
            </div>
            <p className="text-2xl font-bold text-white leading-none" style={{fontFamily:"var(--font-display)"}}>{value}</p>
            <p className="text-xs font-medium text-gray-400 mt-1">{label}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Radar */}
        <div className="rounded-2xl border p-5" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{PERIODOS[periodo]}</p>
          <p className="text-[10px] text-gray-600 mb-3">Perfil por asignatura</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e2c2c"/>
              <PolarAngleAxis dataKey="asignatura" tick={{fontSize:9,fill:"#6B7280"}}/>
              <Radar dataKey="nota" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2}/>
              <Tooltip content={<CustomTip/>}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar by asig */}
        <div className="rounded-2xl border p-5" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notas por asignatura</p>
          <p className="text-[10px] text-gray-600 mb-3">{PERIODOS[periodo]}</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={notas.map(n=>({asig:n.asignatura.split(" ")[0].slice(0,5),nota:n.nota,fill:n.color}))} barSize={18}>
              <CartesianGrid stroke="#1e2c2c" vertical={false}/>
              <XAxis dataKey="asig" tick={{fontSize:9,fill:"#6B7280"}} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,20]} tick={{fontSize:9,fill:"#6B7280"}} axisLine={false} tickLine={false} width={22}/>
              <Tooltip content={<CustomTip/>}/>
              <Bar dataKey="nota" radius={[4,4,0,0]}>
                {notas.map((n,i)=><rect key={i} fill={n.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line trend */}
        <div className="rounded-2xl border p-5" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tendencia</p>
          <p className="text-[10px] text-gray-600 mb-3">Promedio general por bimestre</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tendencia}>
              <CartesianGrid stroke="#1e2c2c" vertical={false}/>
              <XAxis dataKey="periodo" tick={{fontSize:9,fill:"#6B7280"}} axisLine={false} tickLine={false}/>
              <YAxis domain={[15,20]} tick={{fontSize:9,fill:"#6B7280"}} axisLine={false} tickLine={false} width={22}/>
              <Tooltip content={<CustomTip/>}/>
              <Line type="monotone" dataKey="promedio" stroke="#10B981" strokeWidth={2.5} dot={{fill:"#10B981",r:4}} name="Promedio"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail table */}
      <div className="rounded-2xl border overflow-hidden" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
        <div className="px-5 py-3 border-b" style={{borderColor:"#1e2c2c",background:"#1e2525"}}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detalle de calificaciones · {PERIODOS[periodo]}</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{background:"#161b1b"}}>
              {["Asignatura","Docente","I Bim","II Bim","III Bim","IV Bim","Promedio","Nivel"].map(h=>(
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{borderColor:"#1e2c2c"}}>
            {notas.map((n,i)=>{
              const prom = +(NOTAS_DATA[n.asignatura].reduce((s,v)=>s+v,0)/4).toFixed(1);
              const nv = NIVEL_COLORS[nivelKey(prom)];
              return (
                <tr key={i} className="transition-colors hover:bg-[#1e2525]"
                  style={{background:i%2===0?"#1a1f1f":"#161b1b"}}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:n.color}}/>
                      <span className="font-semibold text-gray-200">{n.asignatura}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{n.docente}</td>
                  {NOTAS_DATA[n.asignatura].map((nota,pi)=>(
                    <td key={pi} className="px-5 py-3.5">
                      <span className="font-bold" style={{color:pi===periodo?n.color:"#9CA3AF"}}>{nota}</span>
                    </td>
                  ))}
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-white">{prom}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{background:nv.bg,color:nv.text}}>{nv.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{background:"#1e2c2c"}}>
              <td colSpan={2} className="px-5 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Promedio general</td>
              {PERIODOS.map((_,pi)=>{
                const avg = +(ASIGNATURAS.reduce((s,a)=>s+NOTAS_DATA[a][pi],0)/ASIGNATURAS.length).toFixed(1);
                return <td key={pi} className="px-5 py-2.5 font-bold" style={{color:pi===periodo?"#10B981":"#9CA3AF"}}>{avg}</td>;
              })}
              <td className="px-5 py-2.5 font-bold text-[#10B981]">{promedio}</td>
              <td className="px-5 py-2.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{background:nivel.bg,color:nivel.text}}>{nivel.label}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
