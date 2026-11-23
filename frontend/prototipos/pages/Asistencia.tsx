import { useState, useMemo } from "react";
import {
  Search, Filter, X, ChevronLeft, ChevronRight, CheckCircle,
  XCircle, Clock, Calendar, GraduationCap, Layers, BookOpen,
  User, TrendingDown, AlertTriangle, RotateCcw, Eye,
  Activity, Users, BarChart2, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

type EstadoAsist = "Presente" | "Ausente" | "Tardanza" | "Justificado";

interface Registro {
  id: number;
  estudianteId: number;
  estudianteNombre: string;
  estudianteCodigo: string;
  grado: string;
  seccion: string;
  ciclo: string;
  fecha: string;
  asignatura: string;
  docente: string;
  estado: EstadoAsist;
  observacion: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CICLOS    = ["Año Escolar 2026", "Año Escolar 2025"];
const GRADOS    = ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado", "6° Grado"];
const SECCIONES = ["A", "B", "C"];
const ASIGNATURAS = ["Matemáticas", "Comunicación", "Historia y Geografía", "Ciencias Naturales", "Inglés", "Educación Física", "Arte y Cultura"];

const ESTUDIANTES = [
  { id: 1,  codigo: "EST-00001", nombre: "Lucía F. Paredes Vega",        grado: "3° Grado", seccion: "A" },
  { id: 2,  codigo: "EST-00002", nombre: "Diego A. Mamani Quispe",        grado: "3° Grado", seccion: "A" },
  { id: 3,  codigo: "EST-00003", nombre: "Valentina Quispe Huanca",        grado: "1° Grado", seccion: "B" },
  { id: 4,  codigo: "EST-00004", nombre: "Sebastián R. Torres Cáceres",   grado: "5° Grado", seccion: "A" },
  { id: 5,  codigo: "EST-00005", nombre: "Camila A. Herrera Taipe",       grado: "1° Grado", seccion: "A" },
  { id: 6,  codigo: "EST-00006", nombre: "Andrés F. Cáceres Puma",        grado: "6° Grado", seccion: "A" },
  { id: 8,  codigo: "EST-00008", nombre: "Ricardo A. Soto Aliaga",        grado: "4° Grado", seccion: "A" },
  { id: 9,  codigo: "EST-00009", nombre: "Mariana I. Flores Chávez",      grado: "2° Grado", seccion: "B" },
  { id: 11, codigo: "EST-00011", nombre: "Sofía V. Cruz Apaza",           grado: "1° Grado", seccion: "A" },
  { id: 12, codigo: "EST-00012", nombre: "Mateo J. Ramos Salinas",        grado: "3° Grado", seccion: "B" },
];

const DOCENTES: Record<string, string> = {
  "Matemáticas":         "Lic. Carlos Ríos",
  "Comunicación":        "Lic. María Soto",
  "Historia y Geografía":"Lic. Jorge Medina",
  "Ciencias Naturales":  "Lic. Rosa Chávez",
  "Inglés":              "Lic. Ana Torres",
  "Educación Física":    "Lic. Pedro Luna",
  "Arte y Cultura":      "Lic. Sandra Vega",
};

// Generate seed records (Aug 2026)
function makeSeed(): Registro[] {
  const records: Registro[] = [];
  let id = 1;
  const days = ["2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08",
                 "2026-08-11","2026-08-12","2026-08-13","2026-08-14","2026-08-15",
                 "2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22",
                 "2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-29"];

  // Estado weights per student (to simulate realistic patterns)
  const weights: Record<number, number[]> = {
    1:  [92,4,4,0],   // good attendance
    2:  [75,20,5,0],  // frequent absences
    3:  [88,8,4,0],
    4:  [95,3,2,0],
    5:  [90,6,4,0],
    6:  [98,1,1,0],
    8:  [85,10,5,0],
    9:  [94,4,2,0],
    11: [88,8,4,0],
    12: [80,14,4,2], // some justified
  };

  function pickEstado(w: number[]): EstadoAsist {
    const r = Math.random() * 100;
    if (r < w[0]) return "Presente";
    if (r < w[0] + w[1]) return "Ausente";
    if (r < w[0] + w[1] + w[2]) return "Tardanza";
    return "Justificado";
  }

  const asignaturasByGrado: Record<string, string[]> = {
    "1° Grado": ["Matemáticas","Comunicación","Ciencias Naturales","Arte y Cultura"],
    "2° Grado": ["Matemáticas","Comunicación","Historia y Geografía","Ciencias Naturales"],
    "3° Grado": ["Matemáticas","Comunicación","Historia y Geografía","Inglés"],
    "4° Grado": ["Matemáticas","Comunicación","Historia y Geografía","Inglés","Educación Física"],
    "5° Grado": ["Matemáticas","Comunicación","Historia y Geografía","Inglés","Educación Física"],
    "6° Grado": ["Matemáticas","Comunicación","Historia y Geografía","Inglés"],
  };

  for (const est of ESTUDIANTES) {
    const asigs = asignaturasByGrado[est.grado] ?? ["Matemáticas","Comunicación"];
    const w = weights[est.id] ?? [90,6,4,0];
    for (const dia of days) {
      // only 2 asignaturas per day to keep dataset manageable
      const todayAsigs = asigs.slice(0, 2);
      for (const asig of todayAsigs) {
        const estado = pickEstado(w);
        records.push({
          id: id++,
          estudianteId: est.id,
          estudianteNombre: est.nombre,
          estudianteCodigo: est.codigo,
          grado: est.grado,
          seccion: est.seccion,
          ciclo: "Año Escolar 2026",
          fecha: dia,
          asignatura: asig,
          docente: DOCENTES[asig] ?? "—",
          estado,
          observacion: estado === "Justificado" ? "Certificado médico presentado" :
                       estado === "Ausente" && Math.random() < 0.3 ? "Sin comunicación previa" : "",
        });
      }
    }
  }
  return records;
}

const ALL_RECORDS = makeSeed();

// ── Shared UI ─────────────────────────────────────────────────────────────────

const estadoConf: Record<EstadoAsist, { color: string; bg: string; icon: React.ReactNode; short: string }> = {
  Presente:   { color: "#10B981", bg: "#10B98118", icon: <CheckCircle size={10} />, short: "P" },
  Ausente:    { color: "#EF4444", bg: "#EF444418", icon: <XCircle size={10} />,    short: "A" },
  Tardanza:   { color: "#F59E0B", bg: "#F59E0B18", icon: <Clock size={10} />,      short: "T" },
  Justificado:{ color: "#A78BFA", bg: "#A78BFA18", icon: <CheckCircle size={10} />,short: "J" },
};

function StatusBadge({ estado }: { estado: EstadoAsist }) {
  const c = estadoConf[estado];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: c.bg, color: c.color }}>
      {c.icon}{estado}
    </span>
  );
}

function Sel({ icon, value, onChange, placeholder, options, labelFn }: {
  icon: React.ReactNode; value: string; onChange: (v: string) => void;
  placeholder: string; options: string[]; labelFn?: (s: string) => string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg px-3 py-2 flex-shrink-0"
      style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
      <span className="text-gray-500 flex-shrink-0">{icon}</span>
      <select className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer max-w-36"
        value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" style={{ background: "#1F2525" }}>{placeholder}</option>
        {options.map((o) => <option key={o} value={o} style={{ background: "#1F2525" }}>{labelFn ? labelFn(o) : o}</option>)}
      </select>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs space-y-1" style={{ background: "#1F2525", border: "1px solid #2e3939", color: "#fff" }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.name === "Presentes" ? "#10B981" : p.name === "Ausentes" ? "#EF4444" : "#F59E0B" }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

// ── Student detail drawer ─────────────────────────────────────────────────────

function StudentDrawer({ records, studentId, onClose }: {
  records: Registro[]; studentId: number; onClose: () => void;
}) {
  const est = ESTUDIANTES.find((e) => e.id === studentId);
  const estRecs = records.filter((r) => r.estudianteId === studentId);
  const presentes  = estRecs.filter((r) => r.estado === "Presente").length;
  const ausentes   = estRecs.filter((r) => r.estado === "Ausente").length;
  const tardanzas  = estRecs.filter((r) => r.estado === "Tardanza").length;
  const justificados = estRecs.filter((r) => r.estado === "Justificado").length;
  const total = estRecs.length;
  const pct = total > 0 ? ((presentes + justificados) / total * 100).toFixed(1) : "—";

  const byAsig = ASIGNATURAS.map((a) => {
    const sub = estRecs.filter((r) => r.asignatura === a);
    if (!sub.length) return null;
    const aus = sub.filter((r) => r.estado === "Ausente").length;
    return { asig: a, total: sub.length, ausentes: aus, pct: (((sub.length - aus) / sub.length) * 100).toFixed(0) };
  }).filter(Boolean) as { asig: string; total: number; ausentes: number; pct: string }[];

  const recurrentes = ausentes >= 3;

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="ml-auto w-full max-w-xl h-full flex flex-col border-l overflow-hidden"
        style={{ background: "#1F2525", borderColor: "#2e3939" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: "#2e3939" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>
              {est?.nombre.split(" ").slice(0, 2).map((n) => n[0]).join("") ?? "?"}
            </div>
            <div>
              <p className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>{est?.nombre}</p>
              <p className="text-xs text-gray-500">{est?.grado} — Sección {est?.seccion} · {est?.codigo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Alert */}
          {recurrentes && (
            <div className="flex items-start gap-2 p-3 rounded-lg text-xs"
              style={{ background: "#EF444415", border: "1px solid #EF444440", color: "#EF4444" }}>
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              <span>Este estudiante registra <strong>{ausentes} ausencias</strong> en el período — inasistencia recurrente detectada.</span>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Presentes", value: presentes, color: "#10B981" },
              { label: "Ausentes",  value: ausentes,  color: "#EF4444" },
              { label: "Tardanzas", value: tardanzas, color: "#F59E0B" },
              { label: "% Asist.",  value: `${pct}%`, color: Number(pct) >= 90 ? "#10B981" : Number(pct) >= 80 ? "#F59E0B" : "#EF4444" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border p-3 text-center"
                style={{ background: "#263030", borderColor: "#2e3939" }}>
                <p className="text-xl font-bold" style={{ color: k.color, fontFamily: "var(--font-display)" }}>{k.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {/* By subject */}
          <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "#2e3939" }}>
              <p className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Asistencia por asignatura</p>
            </div>
            <div className="divide-y" style={{ borderColor: "#2e3939" }}>
              {byAsig.map((b) => {
                const p = Number(b.pct);
                const barColor = p >= 90 ? "#10B981" : p >= 75 ? "#F59E0B" : "#EF4444";
                return (
                  <div key={b.asig} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-300">{b.asig}</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        {b.ausentes > 0 && <span style={{ color: "#EF4444" }}>{b.ausentes} ausencias</span>}
                        <span className="font-semibold" style={{ color: barColor }}>{b.pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: "#2e3939" }}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${b.pct}%`, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent records */}
          <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "#2e3939" }}>
              <p className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Registros recientes</p>
            </div>
            <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: "#2e3939" }}>
              {estRecs.slice(-20).reverse().map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-[10px] font-mono text-gray-500 w-20 flex-shrink-0">
                    {new Date(r.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                  </span>
                  <span className="text-xs text-gray-400 flex-1 truncate">{r.asignatura}</span>
                  <StatusBadge estado={r.estado} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const ROWS = 12;

export default function Asistencia() {
  const [filterCiclo,    setFilterCiclo]    = useState("Año Escolar 2026");
  const [filterFecha,    setFilterFecha]    = useState("");
  const [filterGrado,    setFilterGrado]    = useState("");
  const [filterSeccion,  setFilterSeccion]  = useState("");
  const [filterAsig,     setFilterAsig]     = useState("");
  const [filterEstudiante, setFilterEstudiante] = useState("");
  const [filterEstado,   setFilterEstado]   = useState("");
  const [search,         setSearch]         = useState("");
  const [page,           setPage]           = useState(1);
  const [drawerEstId,    setDrawerEstId]    = useState<number | null>(null);
  const [view,           setView]           = useState<"table" | "heatmap">("table");
  const [showRecurrentes, setShowRecurrentes] = useState(false);

  // Apply filters
  const filtered = useMemo(() => ALL_RECORDS.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = !q || r.estudianteNombre.toLowerCase().includes(q) || r.estudianteCodigo.toLowerCase().includes(q);
    return matchQ &&
      (!filterCiclo    || r.ciclo === filterCiclo) &&
      (!filterFecha    || r.fecha === filterFecha) &&
      (!filterGrado    || r.grado === filterGrado) &&
      (!filterSeccion  || r.seccion === filterSeccion) &&
      (!filterAsig     || r.asignatura === filterAsig) &&
      (!filterEstudiante || r.estudianteId === Number(filterEstudiante)) &&
      (!filterEstado   || r.estado === filterEstado) &&
      (!showRecurrentes || recurrentesIds.has(r.estudianteId));
  }), [filterCiclo, filterFecha, filterGrado, filterSeccion, filterAsig, filterEstudiante, filterEstado, search, showRecurrentes]);

  // KPIs from filtered
  const kpis = useMemo(() => ({
    presentes:    filtered.filter((r) => r.estado === "Presente").length,
    ausentes:     filtered.filter((r) => r.estado === "Ausente").length,
    tardanzas:    filtered.filter((r) => r.estado === "Tardanza").length,
    justificados: filtered.filter((r) => r.estado === "Justificado").length,
    total:        filtered.length,
  }), [filtered]);

  const pctAsist = kpis.total > 0 ? (((kpis.presentes + kpis.justificados) / kpis.total) * 100).toFixed(1) : "—";
  const pctColor = Number(pctAsist) >= 90 ? "#10B981" : Number(pctAsist) >= 80 ? "#F59E0B" : "#EF4444";

  // Recurrentes: students with 3+ absences in filtered set
  const recurrentesIds = useMemo(() => {
    const base = filterCiclo ? ALL_RECORDS.filter((r) => r.ciclo === filterCiclo) : ALL_RECORDS;
    const counts: Record<number, number> = {};
    for (const r of base) {
      if (r.estado === "Ausente") counts[r.estudianteId] = (counts[r.estudianteId] ?? 0) + 1;
    }
    return new Set(Object.entries(counts).filter(([, v]) => v >= 3).map(([k]) => Number(k)));
  }, [filterCiclo]);

  // Chart data — by day
  const chartData = useMemo(() => {
    const days = [...new Set(ALL_RECORDS.filter((r) => r.ciclo === (filterCiclo || "Año Escolar 2026")).map((r) => r.fecha))].sort().slice(-10);
    return days.map((d) => {
      const dayRecs = filtered.filter((r) => r.fecha === d);
      return {
        dia: new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
        Presentes:  dayRecs.filter((r) => r.estado === "Presente").length,
        Ausentes:   dayRecs.filter((r) => r.estado === "Ausente").length,
        Tardanzas:  dayRecs.filter((r) => r.estado === "Tardanza").length,
      };
    });
  }, [filtered, filterCiclo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage - 1) * ROWS, curPage * ROWS);

  function clearFilters() {
    setFilterCiclo("Año Escolar 2026"); setFilterFecha(""); setFilterGrado("");
    setFilterSeccion(""); setFilterAsig(""); setFilterEstudiante(""); setFilterEstado(""); setSearch(""); setShowRecurrentes(false); setPage(1);
  }
  const hasFilters = filterFecha || filterGrado || filterSeccion || filterAsig || filterEstudiante || filterEstado || search || showRecurrentes;

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Asistencias",          value: kpis.presentes,    color: "#10B981", icon: CheckCircle, sub: `${pctAsist}% del total` },
          { label: "Ausencias",            value: kpis.ausentes,     color: "#EF4444", icon: XCircle,     sub: `${kpis.total > 0 ? ((kpis.ausentes/kpis.total)*100).toFixed(1) : 0}% del total` },
          { label: "Tardanzas",            value: kpis.tardanzas,    color: "#F59E0B", icon: Clock,       sub: `${kpis.total > 0 ? ((kpis.tardanzas/kpis.total)*100).toFixed(1) : 0}% del total` },
          { label: "Justificados",         value: kpis.justificados, color: "#A78BFA", icon: CheckCircle, sub: "Con certificado" },
          { label: "% Asistencia",         value: `${pctAsist}%`,   color: pctColor,  icon: Activity,    sub: "Meta institucional: 95%" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border p-4 flex items-center gap-3"
            style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${k.color}20` }}>
              <k.icon size={17} style={{ color: k.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-white" style={{ fontFamily: "var(--font-display)", color: k.color }}>{k.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{k.label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + recurrentes side by side */}
      <div className="grid grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="col-span-2 rounded-xl border p-5" style={{ background: "#263030", borderColor: "#2e3939" }}>
          <p className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Tendencia diaria — últimos 10 días hábiles
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={12} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3939" vertical={false} />
              <XAxis dataKey="dia" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Presentes"  fill="#10B981" radius={[3,3,0,0]} />
              <Bar dataKey="Ausentes"   fill="#EF4444" radius={[3,3,0,0]} />
              <Bar dataKey="Tardanzas"  fill="#F59E0B" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recurrentes panel */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#2e3939" }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#EF4444]" />
              <p className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Inasistencias recurrentes</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#EF444420", color: "#EF4444" }}>
              {recurrentesIds.size}
            </span>
          </div>
          <div className="divide-y max-h-52 overflow-y-auto" style={{ borderColor: "#2e3939" }}>
            {ESTUDIANTES.filter((e) => recurrentesIds.has(e.id)).map((e) => {
              const ausCount = ALL_RECORDS.filter((r) => r.estudianteId === e.id && r.estado === "Ausente" && r.ciclo === (filterCiclo || "Año Escolar 2026")).length;
              return (
                <button key={e.id} onClick={() => setDrawerEstId(e.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#2e3939]/50 transition-colors">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{ background: "#EF444430" }}>
                    <TrendingDown size={12} style={{ color: "#EF4444" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate" style={{ fontFamily: "var(--font-display)" }}>{e.nombre}</p>
                    <p className="text-[10px] text-gray-500">{e.grado} — Sec. {e.seccion}</p>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: "#EF4444" }}>{ausCount} falt.</span>
                </button>
              );
            })}
            {recurrentesIds.size === 0 && (
              <p className="px-4 py-6 text-xs text-center text-gray-600">Sin inasistencias recurrentes</p>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-52 rounded-lg px-3 py-2"
            style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Search size={13} className="text-gray-500 flex-shrink-0" />
            <input placeholder="Buscar estudiante..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-full" />
            {search && <button onClick={() => setSearch("")}><X size={12} className="text-gray-500" /></button>}
          </div>

          {/* Ciclo */}
          <Sel icon={<Calendar size={12} />} value={filterCiclo} onChange={(v) => { setFilterCiclo(v); setPage(1); }}
            placeholder="Ciclo" options={CICLOS} />

          {/* Fecha */}
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-2 flex-shrink-0"
            style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Calendar size={12} className="text-gray-500" />
            <input type="date" value={filterFecha} onChange={(e) => { setFilterFecha(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer" />
          </div>

          <Sel icon={<GraduationCap size={12} />} value={filterGrado} onChange={(v) => { setFilterGrado(v); setPage(1); }}
            placeholder="Grado" options={GRADOS} />
          <Sel icon={<Layers size={12} />} value={filterSeccion} onChange={(v) => { setFilterSeccion(v); setPage(1); }}
            placeholder="Sección" options={SECCIONES} labelFn={(s) => `Sección ${s}`} />
          <Sel icon={<BookOpen size={12} />} value={filterAsig} onChange={(v) => { setFilterAsig(v); setPage(1); }}
            placeholder="Asignatura" options={ASIGNATURAS} />
          <Sel icon={<User size={12} />} value={filterEstudiante} onChange={(v) => { setFilterEstudiante(v); setPage(1); }}
            placeholder="Estudiante" options={ESTUDIANTES.map((e) => String(e.id))} labelFn={(id) => ESTUDIANTES.find((e) => e.id === Number(id))?.nombre ?? id} />
          <Sel icon={<Filter size={12} />} value={filterEstado} onChange={(v) => { setFilterEstado(v); setPage(1); }}
            placeholder="Estado" options={["Presente","Ausente","Tardanza","Justificado"]} />

          {/* Recurrentes toggle */}
          <button onClick={() => { setShowRecurrentes(!showRecurrentes); setPage(1); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all"
            style={{
              background: showRecurrentes ? "#EF444415" : "#1F2525",
              borderColor: showRecurrentes ? "#EF4444" : "#2e3939",
              color: showRecurrentes ? "#EF4444" : "#6B7280",
              fontFamily: "var(--font-display)",
            }}>
            <AlertTriangle size={12} />Inasistencias recurrentes
          </button>

          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2">
              <RotateCcw size={11} />Limpiar
            </button>
          )}

          <span className="ml-auto text-xs text-gray-500">{filtered.length.toLocaleString()} registros</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
              {["Estudiante", "Fecha", "Asignatura", "Docente", "Grado / Sección", "Estado", "Observación", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                  style={{ fontFamily: "var(--font-display)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <Activity size={36} className="mx-auto mb-3 text-gray-700" />
                  <p className="text-sm text-gray-500">No se encontraron registros</p>
                  <p className="text-xs text-gray-600 mt-1">Ajusta los filtros para ver otros registros</p>
                </td>
              </tr>
            ) : pageRows.map((r, idx) => {
              const isRecurrente = recurrentesIds.has(r.estudianteId);
              const c = estadoConf[r.estado];
              return (
                <tr key={r.id} className="border-b transition-colors hover:bg-[#2e3939]/40 group"
                  style={{ borderColor: "#2e3939" }}>
                  {/* Estudiante */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: idx % 2 === 0 ? "#107A9F" : "#00ADEB" }}>
                          {r.estudianteNombre.split(" ").slice(0,2).map((n)=>n[0]).join("")}
                        </div>
                        {isRecurrente && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border flex items-center justify-center"
                            style={{ background: "#EF4444", borderColor: "#263030" }}>
                            <AlertTriangle size={7} className="text-white" />
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>
                          {r.estudianteNombre}
                        </p>
                        <p className="text-[10px] font-mono text-gray-600">{r.estudianteCodigo}</p>
                      </div>
                    </div>
                  </td>
                  {/* Fecha */}
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(r.fecha).toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" })}
                  </td>
                  {/* Asignatura */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-200">
                      <BookOpen size={11} className="text-[#107A9F] flex-shrink-0" />
                      {r.asignatura}
                    </div>
                  </td>
                  {/* Docente */}
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{r.docente}</td>
                  {/* Grado / Sección */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-300">{r.grado}</span>
                      <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>{r.seccion}</span>
                    </div>
                  </td>
                  {/* Estado */}
                  <td className="px-4 py-3"><StatusBadge estado={r.estado} /></td>
                  {/* Observación */}
                  <td className="px-4 py-3 text-gray-500 max-w-48">
                    <span className="truncate block">{r.observacion || "—"}</span>
                  </td>
                  {/* Ver */}
                  <td className="px-4 py-3">
                    <button onClick={() => setDrawerEstId(r.estudianteId)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#00ADEB]/10 text-gray-500 hover:text-[#00ADEB] transition-all"
                      title="Ver historial del estudiante">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#2e3939" }}>
          <p className="text-xs text-gray-500">
            {filtered.length === 0 ? "0 registros" :
              `Mostrando ${(curPage-1)*ROWS+1}–${Math.min(curPage*ROWS, filtered.length)} de ${filtered.length.toLocaleString()}`}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={curPage===1}
              className="p-1.5 rounded-lg disabled:opacity-30 text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = curPage <= 4 ? i+1 : curPage + i - 3;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                  style={{ background: p===curPage ? "#00ADEB" : "transparent", color: p===curPage ? "#fff" : "#9CA3AF", fontFamily: "var(--font-display)" }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={curPage===totalPages}
              className="p-1.5 rounded-lg disabled:opacity-30 text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
        <AlertTriangle size={11} className="text-gray-600" />
        El registro de asistencia es responsabilidad del docente. El administrador tiene acceso de solo lectura y supervisión.
      </p>

      {/* Drawer */}
      {drawerEstId !== null && (
        <StudentDrawer records={ALL_RECORDS} studentId={drawerEstId} onClose={() => setDrawerEstId(null)} />
      )}
    </div>
  );
}
