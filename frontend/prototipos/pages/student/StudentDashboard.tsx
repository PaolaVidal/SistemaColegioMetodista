import type { StudentPage } from "../../components/StudentLayout";
import { STUDENT } from "../../components/StudentLayout";
import {
  BookOpen, Calendar, ClipboardList, Clock, FileText,
  DollarSign, ChevronRight, Bell, TrendingUp, AlertTriangle,
  CheckCircle, User, Megaphone, ArrowUpRight,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ASIGNATURAS_RADAR = [
  { asignatura:"Matemática",  nota:20 },
  { asignatura:"Comunicación",nota:18 },
  { asignatura:"Ciencias",    nota:20 },
  { asignatura:"Historia",    nota:18 },
  { asignatura:"Arte",        nota:17 },
  { asignatura:"Ed. Física",  nota:19 },
];

const PROXIMA_CLASE = {
  asignatura: "Historia y Geografía",
  hora:       "10:30 – 11:15",
  docente:    "Lic. Luis Vera",
  aula:       "Aula 8",
  color:      "#F59E0B",
};

const PROXIMA_EVALUACION = {
  asignatura: "Matemática",
  fecha:      "28 sep 2026",
  diasRestantes: 20,
  docente:    "Prof. Carmen López",
  color:      "#00ADEB",
};

const TAREAS_PENDIENTES = [
  { id:1, asignatura:"Ciencias Naturales", titulo:"Maqueta del sistema solar", vence:"15 sep 2026", urgente:false, color:"#8B5CF6" },
  { id:2, asignatura:"Historia y Geografía", titulo:"Resumen: La Revolución Industrial", vence:"12 sep 2026", urgente:true, color:"#F59E0B" },
];

const ALERTAS = [
  { tipo:"tarea",      icono:ClipboardList, color:"#8B5CF6", titulo:"Nueva tarea asignada",        desc:"Ciencias — Maqueta del sistema solar (entrega 15 sep)" },
  { tipo:"evaluacion", icono:FileText,      color:"#00ADEB", titulo:"Evaluación en 20 días",        desc:"Matemática — 28 de septiembre de 2026" },
  { tipo:"ausencia",   icono:Calendar,      color:"#10B981", titulo:"Sin ausencias este mes",        desc:"Asistencia perfecta · 100%" },
  { tipo:"anuncio",    icono:Megaphone,     color:"#F59E0B", titulo:"Reunión de padres",             desc:"Viernes 20 de septiembre · 6:00 p.m. · Auditorio" },
];

const ANUNCIOS = [
  { id:"a1", titulo:"Evaluaciones del I Bimestre — Información importante", fecha:"01 sep 2026", categoria:"Académico", color:"#00ADEB",
    extracto:"Las evaluaciones se llevarán a cabo del 28 de septiembre al 2 de octubre. Presentarse 10 minutos antes." },
  { id:"a2", titulo:"Reunión general de padres de familia — I Bimestre", fecha:"12 mar 2026", categoria:"Evento", color:"#F59E0B",
    extracto:"Viernes 20 de septiembre a las 6:00 p.m. en el auditorio principal. Confirmar asistencia antes del 18/09." },
  { id:"a3", titulo:"Actividad deportiva interescolar — Convocatoria", fecha:"07 sep 2026", categoria:"Evento", color:"#10B981",
    extracto:"Convocatoria para estudiantes de 3°, 4°, 5° y 6° grado. Inscripción hasta el 19 de septiembre." },
];

const ACCESOS = [
  { label:"Calificaciones", icon:BookOpen,      color:"#00ADEB", page:"s-calificaciones" as StudentPage, desc:"Ver mis notas"         },
  { label:"Asistencia",     icon:Calendar,      color:"#10B981", page:"s-asistencia"     as StudentPage, desc:"Mi registro"           },
  { label:"Tareas",         icon:ClipboardList, color:"#8B5CF6", page:"s-tareas"         as StudentPage, desc:`${TAREAS_PENDIENTES.length} pendientes` },
  { label:"Horario",        icon:Clock,         color:"#F59E0B", page:"s-horario"        as StudentPage, desc:"Semana actual"          },
  { label:"Evaluaciones",   icon:FileText,      color:"#EC4899", page:"s-evaluaciones"   as StudentPage, desc:"Próxima: 28 sep"        },
  { label:"Estado de cuenta",icon:DollarSign,   color:"#10B981", page:"s-cuenta"         as StudentPage, desc:"Al día"                },
];

// ─── Custom tooltip ────────────────────────────────────────────────────────────

function RadarTip({ active, payload }: { active?:boolean; payload?:{value:number}[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 border text-xs" style={{ background:"#1a1f1f",borderColor:"#1e2c2c" }}>
      <p className="font-bold text-white">{payload[0].value} / 20</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentDashboard({ onNavigate }: { onNavigate: (p:StudentPage) => void }) {
  const promedioGeneral = (ASIGNATURAS_RADAR.reduce((s,a)=>s+a.nota,0)/ASIGNATURAS_RADAR.length).toFixed(1);

  return (
    <div className="space-y-5">
      {/* ── Bienvenida ── */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background:"linear-gradient(135deg,#0d2c22 0%,#1a3a2a 40%,#0f2d1e 100%)", border:"1px solid #10B98130" }}>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#10B98190] font-medium mb-1">Martes, 8 de septiembre de 2026</p>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>
              ¡Hola, {STUDENT.nombre.split(" ")[0]}! 👋
            </h2>
            <p className="text-sm text-gray-400 mt-1">{STUDENT.grado} · Sección {STUDENT.seccion} · Código {STUDENT.codigo}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <CheckCircle size={14} style={{ color:"#10B981" }} />
              <p className="text-xs font-semibold" style={{ color:"#10B981" }}>Asistencia perfecta este mes</p>
            </div>
            <p className="text-xs text-gray-500">Promedio general: <span className="font-bold text-white">{promedioGeneral} / 20</span></p>
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full opacity-10" style={{ background:"#10B981", filter:"blur(40px)" }} />
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Promedio general",  value:promedioGeneral, sub:"Sobre 20 pts",   icon:TrendingUp,   color:"#10B981", bg:"#10B98118" },
          { label:"Asistencia",        value:"100%",          sub:"Sin ausencias",  icon:Calendar,     color:"#00ADEB", bg:"#00ADEB18" },
          { label:"Tareas pendientes", value:`${TAREAS_PENDIENTES.length}`,sub:"Por entregar",icon:ClipboardList,color:"#F59E0B",bg:"#F59E0B18" },
          { label:"Próxima evaluación",value:"28 sep",        sub:"Matemática",    icon:FileText,     color:"#EC4899", bg:"#EC489918" },
        ].map(({ label, value, sub, icon:Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-5 border" style={{ background:"#1a1f1f", borderColor:"#1e2c2c" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:bg }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white leading-none" style={{ fontFamily:"var(--font-display)" }}>{value}</p>
            <p className="text-xs font-medium text-gray-400 mt-1" style={{ fontFamily:"var(--font-display)" }}>{label}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main content grid ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns:"1fr 1.4fr 1fr" }}>

        {/* Col 1: Próxima clase + Alertas */}
        <div className="space-y-4">
          {/* Próxima clase */}
          <div className="rounded-2xl border overflow-hidden" style={{ background:"#1a1f1f",borderColor:"#1e2c2c" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor:"#1e2c2c",background:"#1e2525" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Próxima clase</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:`${PROXIMA_CLASE.color}18` }}>
                  <BookOpen size={16} style={{ color:PROXIMA_CLASE.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight" style={{ fontFamily:"var(--font-display)" }}>{PROXIMA_CLASE.asignatura}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{PROXIMA_CLASE.hora}</p>
                </div>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-gray-500">
                  <User size={11} className="text-gray-700 flex-shrink-0" />{PROXIMA_CLASE.docente}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={11} className="text-gray-700 flex-shrink-0" />{PROXIMA_CLASE.aula}
                </div>
              </div>
            </div>
          </div>

          {/* Alertas */}
          <div className="rounded-2xl border overflow-hidden" style={{ background:"#1a1f1f",borderColor:"#1e2c2c" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor:"#1e2c2c",background:"#1e2525" }}>
              <div className="flex items-center gap-2">
                <Bell size={12} className="text-gray-500" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Alertas</p>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor:"#1e2c2c" }}>
              {ALERTAS.map((a,i)=>{
                const Icon = a.icono;
                return (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background:`${a.color}18` }}>
                      <Icon size={11} style={{ color:a.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-200 leading-tight">{a.titulo}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">{a.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Col 2: Radar + Tareas */}
        <div className="space-y-4">
          {/* Radar de rendimiento */}
          <div className="rounded-2xl border" style={{ background:"#1a1f1f",borderColor:"#1e2c2c" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor:"#1e2c2c" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Rendimiento académico</p>
                  <p className="text-xs text-gray-600 mt-0.5">I Bimestre 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color:"#10B981",fontFamily:"var(--font-display)" }}>{promedioGeneral}</p>
                  <p className="text-[10px] text-gray-600">promedio / 20</p>
                </div>
              </div>
            </div>
            <div className="px-2 py-2">
              <ResponsiveContainer width="100%" height={210}>
                <RadarChart data={ASIGNATURAS_RADAR} margin={{top:10,right:20,bottom:10,left:20}}>
                  <PolarGrid stroke="#1e2c2c" />
                  <PolarAngleAxis dataKey="asignatura" tick={{ fontSize:10, fill:"#6B7280" }} />
                  <Radar dataKey="nota" stroke="#10B981" fill="#10B981" fillOpacity={0.18} strokeWidth={2} />
                  <Tooltip content={<RadarTip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Notas list */}
            <div className="px-5 pb-4 grid grid-cols-2 gap-2">
              {ASIGNATURAS_RADAR.map(a=>(
                <div key={a.asignatura} className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 truncate">{a.asignatura}</span>
                  <span className="text-[11px] font-bold ml-2" style={{ color: a.nota>=17?"#10B981":a.nota>=14?"#00ADEB":"#F59E0B" }}>
                    {a.nota}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tareas pendientes */}
          <div className="rounded-2xl border overflow-hidden" style={{ background:"#1a1f1f",borderColor:"#1e2c2c" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor:"#1e2c2c",background:"#1e2525" }}>
              <div className="flex items-center gap-2">
                <ClipboardList size={12} className="text-gray-500" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Tareas pendientes</p>
              </div>
              <button onClick={()=>onNavigate("s-tareas")}
                className="text-[10px] font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color:"#10B981" }}>
                Ver todas <ArrowUpRight size={10}/>
              </button>
            </div>
            <div className="divide-y" style={{ borderColor:"#1e2c2c" }}>
              {TAREAS_PENDIENTES.map(t=>(
                <div key={t.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background:t.urgente?"#EF4444":t.color }}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-200 leading-tight">{t.titulo}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{t.asignatura}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background:t.urgente?"#EF444420":"#37415120", color:t.urgente?"#EF4444":"#9CA3AF" }}>
                      {t.urgente?"Urgente":"Pendiente"}
                    </span>
                    <p className="text-[10px] text-gray-600 mt-1">{t.vence}</p>
                  </div>
                </div>
              ))}
              {TAREAS_PENDIENTES.length === 0 && (
                <div className="px-5 py-6 text-center">
                  <CheckCircle size={20} className="text-green-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">¡Sin tareas pendientes!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Col 3: Próxima evaluación + Anuncios */}
        <div className="space-y-4">
          {/* Próxima evaluación */}
          <div className="rounded-2xl border p-5" style={{ background:"#1a1f1f",borderColor:"#1e2c2c" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">Próxima evaluación</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background:`${PROXIMA_EVALUACION.color}18` }}>
                <FileText size={20} style={{ color:PROXIMA_EVALUACION.color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>{PROXIMA_EVALUACION.asignatura}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{PROXIMA_EVALUACION.docente}</p>
              </div>
            </div>
            <div className="rounded-xl p-3 text-center border" style={{ background:`${PROXIMA_EVALUACION.color}10`, borderColor:`${PROXIMA_EVALUACION.color}25` }}>
              <p className="text-lg font-bold" style={{ color:PROXIMA_EVALUACION.color, fontFamily:"var(--font-display)" }}>
                {PROXIMA_EVALUACION.diasRestantes} días
              </p>
              <p className="text-[10px] text-gray-500">{PROXIMA_EVALUACION.fecha}</p>
            </div>
            <button onClick={()=>onNavigate("s-evaluaciones")}
              className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-center transition-all hover:opacity-80 flex items-center justify-center gap-1.5"
              style={{ background:`${PROXIMA_EVALUACION.color}15`, color:PROXIMA_EVALUACION.color, border:`1px solid ${PROXIMA_EVALUACION.color}30`, fontFamily:"var(--font-display)" }}>
              Ver todas las evaluaciones <ChevronRight size={12}/>
            </button>
          </div>

          {/* Anuncios recientes */}
          <div className="rounded-2xl border overflow-hidden" style={{ background:"#1a1f1f",borderColor:"#1e2c2c" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor:"#1e2c2c",background:"#1e2525" }}>
              <div className="flex items-center gap-2">
                <Megaphone size={12} className="text-gray-500" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Comunicados</p>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor:"#1e2c2c" }}>
              {ANUNCIOS.map(a=>(
                <div key={a.id} className="px-5 py-3.5">
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background:a.color }}/>
                    <p className="text-[11px] font-semibold text-gray-200 leading-snug">{a.titulo}</p>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-2 ml-3.5">{a.extracto}</p>
                  <div className="flex items-center gap-2 ml-3.5 mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background:`${a.color}15`, color:a.color }}>{a.categoria}</span>
                    <span className="text-[10px] text-gray-700">{a.fecha}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Accesos rápidos ── */}
      <div className="rounded-2xl border overflow-hidden" style={{ background:"#1a1f1f",borderColor:"#1e2c2c" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor:"#1e2c2c",background:"#1e2525" }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Accesos rápidos</p>
        </div>
        <div className="grid grid-cols-6 gap-0 divide-x" style={{ borderColor:"#1e2c2c" }}>
          {ACCESOS.map(({ label, icon:Icon, color, page, desc }) => (
            <button key={page} onClick={()=>onNavigate(page)}
              className="flex flex-col items-center gap-2.5 px-4 py-5 text-center group transition-all hover:bg-[#1e2525]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background:`${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-300 leading-tight" style={{ fontFamily:"var(--font-display)" }}>{label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
