import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users, GraduationCap, Briefcase, ClipboardList,
  TrendingUp, DollarSign, Bell, UserPlus, UserCheck,
  BookOpen, CreditCard, Megaphone, FileText,
  Activity, Clock,
} from "lucide-react";

const studentsByGrade = [
  { grade: "1°", students: 148 },
  { grade: "2°", students: 162 },
  { grade: "3°", students: 155 },
  { grade: "4°", students: 141 },
  { grade: "5°", students: 138 },
  { grade: "6°", students: 127 },
];

const studentsBySection = [
  { section: "A", value: 312 },
  { section: "B", value: 298 },
  { section: "C", value: 261 },
];

const academicPerformance = [
  { month: "Mar", promedio: 14.2 },
  { month: "Abr", promedio: 14.8 },
  { month: "May", promedio: 13.9 },
  { month: "Jun", promedio: 15.1 },
  { month: "Jul", promedio: 14.6 },
  { month: "Ago", promedio: 15.4 },
];

const attendanceData = [
  { month: "Mar", asistencia: 94.2 },
  { month: "Abr", asistencia: 92.8 },
  { month: "May", asistencia: 91.5 },
  { month: "Jun", asistencia: 93.7 },
  { month: "Jul", asistencia: 95.1 },
  { month: "Ago", asistencia: 93.4 },
];

const paymentStatus = [
  { name: "Al día", value: 68, color: "#00ADEB" },
  { name: "Pendiente", value: 22, color: "#F59E0B" },
  { name: "Vencido", value: 10, color: "#EF4444" },
];

const alerts = [
  { type: "academic", level: "high", student: "Sebastián Torres", detail: "Promedio 09.4 — bajo rendimiento en Matemáticas y Ciencias", time: "Hace 2 h" },
  { type: "attendance", level: "medium", student: "Valentina Quispe", detail: "5 inasistencias consecutivas sin justificar", time: "Hace 4 h" },
  { type: "academic", level: "high", student: "Diego Mamani", detail: "Promedio 09.1 — riesgo de desaprobación en tres materias", time: "Hace 5 h" },
  { type: "payment", level: "medium", student: "Familia Ramos Vega", detail: "Cuota de agosto vencida hace 12 días", time: "Hace 1 d" },
  { type: "attendance", level: "low", student: "Camila Herrera", detail: "3 tardanzas en el mes de agosto", time: "Hace 1 d" },
  { type: "notice", level: "info", student: "Aviso general", detail: "Reunión de padres programada para el 15 de septiembre", time: "Hace 2 d" },
];

const quickActions = [
  { label: "Registrar estudiante", icon: UserPlus, color: "#00ADEB" },
  { label: "Registrar usuario", icon: UserCheck, color: "#107A9F" },
  { label: "Registrar matrícula", icon: BookOpen, color: "#00ADEB" },
  { label: "Registrar pago", icon: CreditCard, color: "#107A9F" },
  { label: "Crear anuncio", icon: Megaphone, color: "#00ADEB" },
  { label: "Generar reporte", icon: FileText, color: "#107A9F" },
];

function KPICard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-3 border transition-all duration-150 hover:-translate-y-0.5"
      style={{ background: accent ? "linear-gradient(135deg,#00ADEB 0%,#107A9F 100%)" : "#263030", borderColor: accent ? "transparent" : "#2e3939" }}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: accent ? "rgba(255,255,255,0.18)" : "#2e3939" }}>
          <Icon size={18} className={accent ? "text-white" : "text-[#00ADEB]"} />
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent ? "bg-white/20 text-white" : "bg-[#2e3939] text-[#00ADEB]"}`}>2026</span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
        <p className={`text-sm mt-0.5 ${accent ? "text-white/80" : "text-gray-400"}`}>{label}</p>
        {sub && <p className={`text-xs mt-1 ${accent ? "text-white/60" : "text-gray-500"}`}>{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4"
      style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}>
      {children}
    </h2>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ background: "#263030", borderColor: "#2e3939" }}>
      <p className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>{title}</p>
      {children}
    </div>
  );
}

function AlertItem({ alert }: { alert: typeof alerts[0] }) {
  const colors: Record<string, string> = { high: "#EF4444", medium: "#F59E0B", low: "#6B7280", info: "#00ADEB" };
  const icons: Record<string, React.ReactNode> = {
    academic: <TrendingUp size={14} />,
    attendance: <Clock size={14} />,
    payment: <DollarSign size={14} />,
    notice: <Bell size={14} />,
  };
  const color = colors[alert.level];
  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0" style={{ borderColor: "#2e3939" }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}22`, color }}>{icons[alert.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>{alert.student}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{alert.detail}</p>
        <p className="text-xs mt-1" style={{ color: "#107A9F" }}>{alert.time}</p>
      </div>
      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: color }} />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "#1F2525", border: "1px solid #2e3939", color: "#fff" }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: "#00ADEB" }}>{p.value}</p>)}
    </div>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "charts" | "alerts">("overview");

  return (
    <div className="space-y-6">
      {/* Tab bar inside content */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Lunes, 01 de septiembre de 2026</p>
        <div className="flex rounded-lg p-0.5" style={{ background: "#263030" }}>
          {(["overview", "charts", "alerts"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
              style={{ fontFamily: "var(--font-display)", background: activeTab === tab ? "#00ADEB" : "transparent", color: activeTab === tab ? "#fff" : "#9CA3AF" }}>
              {tab === "overview" ? "Resumen" : tab === "charts" ? "Gráficos" : "Alertas"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div>
            <SectionTitle>Indicadores generales</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <KPICard icon={GraduationCap} label="Total estudiantes" value="871" sub="↑ 3.2% vs 2025" accent />
              <KPICard icon={Briefcase} label="Total docentes" value="64" sub="8 a tiempo parcial" />
              <KPICard icon={Users} label="Personal" value="28" sub="Administrativo y servicio" />
              <KPICard icon={ClipboardList} label="Matrículas activas" value="846" sub="25 en proceso" />
              <KPICard icon={Activity} label="Asistencia general" value="93.4%" sub="Meta: 95%" />
              <KPICard icon={TrendingUp} label="Promedio académico" value="14.7" sub="Escala vigesimal" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="rounded-xl border p-5 xl:col-span-1" style={{ background: "#263030", borderColor: "#2e3939" }}>
              <SectionTitle>Estado de pagos</SectionTitle>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={paymentStatus} cx="50%" cy="50%" innerRadius={36} outerRadius={55} dataKey="value" strokeWidth={0}>
                      {paymentStatus.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {paymentStatus.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-gray-300">{s.name}</span>
                      <span className="text-xs font-semibold text-white ml-auto">{s.value}%</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t" style={{ borderColor: "#2e3939" }}>
                    <p className="text-xs text-gray-500">Pagos pendientes</p>
                    <p className="text-xl font-bold text-white mt-0.5" style={{ fontFamily: "var(--font-display)" }}>S/ 42,300</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border p-5 xl:col-span-2" style={{ background: "#263030", borderColor: "#2e3939" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Rendimiento académico</p>
                <span className="text-xs px-2 py-0.5 rounded-full text-[#00ADEB]" style={{ background: "#00ADEB18" }}>Mar — Ago 2026</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={academicPerformance}>
                  <defs>
                    <linearGradient id="gradAcad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ADEB" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00ADEB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3939" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[12, 17]} tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="promedio" stroke="#00ADEB" strokeWidth={2} fill="url(#gradAcad)" dot={{ fill: "#00ADEB", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <SectionTitle>Acciones rápidas</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              {quickActions.map((action) => (
                <button key={action.label}
                  className="rounded-xl border p-4 flex flex-col items-center gap-3 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-[#00ADEB]/40"
                  style={{ background: "#263030", borderColor: "#2e3939" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}22` }}>
                    <action.icon size={18} style={{ color: action.color }} />
                  </div>
                  <span className="text-xs font-medium text-gray-300 leading-tight" style={{ fontFamily: "var(--font-display)" }}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Alertas recientes</SectionTitle>
              <button className="text-xs text-[#00ADEB] hover:underline" onClick={() => setActiveTab("alerts")}>Ver todas →</button>
            </div>
            <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
              {alerts.slice(0, 3).map((a, i) => <AlertItem key={i} alert={a} />)}
            </div>
          </div>
        </>
      )}

      {activeTab === "charts" && (
        <div className="space-y-4">
          <SectionTitle>Estadísticas y gráficos</SectionTitle>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ChartCard title="Estudiantes por grado">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={studentsByGrade} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3939" vertical={false} />
                  <XAxis dataKey="grade" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="students" fill="#00ADEB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Estudiantes por sección">
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={220}>
                  <PieChart>
                    <Pie data={studentsBySection} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                      label={({ section, percent }: { section: string; percent: number }) => `${section} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false} fontSize={11} strokeWidth={0}>
                      {studentsBySection.map((_e, i) => <Cell key={i} fill={["#00ADEB", "#107A9F", "#2e3939"][i]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {studentsBySection.map((s, i) => (
                    <div key={s.section}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Sección {s.section}</span>
                        <span className="text-white font-semibold">{s.value}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: "#2e3939" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${s.value / 871 * 100}%`, background: ["#00ADEB", "#107A9F", "#4B5563"][i] }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t text-xs text-gray-500" style={{ borderColor: "#2e3939" }}>
                    Total: <span className="text-white font-semibold">871</span> estudiantes
                  </div>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Rendimiento académico mensual">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={academicPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3939" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[12, 17]} tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="promedio" stroke="#00ADEB" strokeWidth={2.5} dot={{ fill: "#00ADEB", r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Porcentaje de asistencia mensual">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={attendanceData}>
                  <defs>
                    <linearGradient id="gradAtt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#107A9F" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#107A9F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3939" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[88, 98]} tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="asistencia" stroke="#107A9F" strokeWidth={2} fill="url(#gradAtt)" dot={{ fill: "#107A9F", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="xl:col-span-2">
              <ChartCard title="Estado de pagos — distribución">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={paymentStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0} paddingAngle={3}>
                        {paymentStatus.map((e) => <Cell key={e.name} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    {paymentStatus.map((s) => (
                      <div key={s.name} className="rounded-lg p-4 text-center border" style={{ background: "#1F2525", borderColor: "#2e3939" }}>
                        <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: s.color }} />
                        <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{s.value}%</p>
                        <p className="text-xs text-gray-400 mt-1">{s.name}</p>
                        <p className="text-xs mt-2 font-semibold" style={{ color: s.color }}>{Math.round(846 * s.value / 100)} estudiantes</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="space-y-4">
          <SectionTitle>Centro de alertas</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Bajo rendimiento", count: 12, color: "#EF4444", icon: TrendingUp },
              { label: "Inasistencias", count: 8, color: "#F59E0B", icon: Clock },
              { label: "Pagos pendientes", count: 187, color: "#F59E0B", icon: DollarSign },
              { label: "Avisos importantes", count: 3, color: "#00ADEB", icon: Bell },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border p-4 flex items-center gap-3" style={{ background: "#263030", borderColor: "#2e3939" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.color}20` }}>
                  <item.icon size={16} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{item.count}</p>
                  <p className="text-[11px] text-gray-400">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border p-1" style={{ background: "#263030", borderColor: "#2e3939" }}>
            {alerts.map((a, i) => (
              <div key={i} className="px-3 hover:bg-[#2e3939] rounded-lg transition-colors">
                <AlertItem alert={a} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
