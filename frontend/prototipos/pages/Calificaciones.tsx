import { useState, useMemo } from "react";
import {
  Search, Filter, X, ChevronLeft, ChevronRight, RotateCcw,
  TrendingUp, TrendingDown, Minus, AlertTriangle, BookOpen,
  GraduationCap, Layers, Calendar, User, Eye, Star,
  Activity, BarChart2, Award, Users,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  LineChart, Line, ReferenceLine,
} from "recharts";

// ── Constants ─────────────────────────────────────────────────────────────────

const CICLOS     = ["Año Escolar 2026", "Año Escolar 2025"];
const GRADOS     = ["1° Grado","2° Grado","3° Grado","4° Grado","5° Grado","6° Grado"];
const SECCIONES  = ["A","B","C"];
const PERIODOS   = ["B1 – I Bimestre","B2 – II Bimestre","B3 – III Bimestre","B4 – IV Bimestre"];
const ASIGNATURAS = [
  "Matemáticas","Comunicación","Historia y Geografía",
  "Ciencias Naturales","Inglés","Educación Física","Arte y Cultura",
];
const DOCENTES: Record<string, string> = {
  "Matemáticas":          "Lic. Carlos Ríos",
  "Comunicación":         "Lic. María Soto",
  "Historia y Geografía": "Lic. Jorge Medina",
  "Ciencias Naturales":   "Lic. Rosa Chávez",
  "Inglés":               "Lic. Ana Torres",
  "Educación Física":     "Lic. Pedro Luna",
  "Arte y Cultura":       "Lic. Sandra Vega",
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface EstudianteBase { id: number; codigo: string; nombre: string; grado: string; seccion: string; }

interface Nota {
  id: number;
  estudianteId: number;
  estudianteNombre: string;
  estudianteCodigo: string;
  grado: string;
  seccion: string;
  ciclo: string;
  asignatura: string;
  docente: string;
  periodo: string;
  calificacion: number;
  promedio: number; // avg of all periods for this subject
}

// ── Seed ─────────────────────────────────────────────────────────────────────

const ESTUDIANTES: EstudianteBase[] = [
  { id:1,  codigo:"EST-00001", nombre:"Lucía F. Paredes Vega",        grado:"3° Grado", seccion:"A" },
  { id:2,  codigo:"EST-00002", nombre:"Diego A. Mamani Quispe",        grado:"3° Grado", seccion:"A" },
  { id:3,  codigo:"EST-00003", nombre:"Valentina Quispe Huanca",        grado:"1° Grado", seccion:"B" },
  { id:4,  codigo:"EST-00004", nombre:"Sebastián R. Torres Cáceres",   grado:"5° Grado", seccion:"A" },
  { id:5,  codigo:"EST-00005", nombre:"Camila A. Herrera Taipe",       grado:"1° Grado", seccion:"A" },
  { id:6,  codigo:"EST-00006", nombre:"Andrés F. Cáceres Puma",        grado:"6° Grado", seccion:"A" },
  { id:8,  codigo:"EST-00008", nombre:"Ricardo A. Soto Aliaga",        grado:"4° Grado", seccion:"A" },
  { id:9,  codigo:"EST-00009", nombre:"Mariana I. Flores Chávez",      grado:"2° Grado", seccion:"B" },
  { id:11, codigo:"EST-00011", nombre:"Sofía V. Cruz Apaza",           grado:"1° Grado", seccion:"A" },
  { id:12, codigo:"EST-00012", nombre:"Mateo J. Ramos Salinas",        grado:"3° Grado", seccion:"B" },
];

// Base scores per student (realistic distributions)
const BASE: Record<number, Record<string, number[]>> = {
  1:  { "Matemáticas":[16,16,null!,null!],"Comunicación":[15,15,null!,null!],"Historia y Geografía":[14,14,null!,null!],"Inglés":[13,12,null!,null!],"Ciencias Naturales":[16,17,null!,null!],"Educación Física":[17,17,null!,null!] },
  2:  { "Matemáticas":[9,10,null!,null!], "Comunicación":[10,11,null!,null!],"Historia y Geografía":[9,9,null!,null!], "Inglés":[8,9,null!,null!],  "Ciencias Naturales":[10,10,null!,null!],"Educación Física":[14,14,null!,null!] },
  3:  { "Matemáticas":[13,14,null!,null!],"Comunicación":[14,14,null!,null!],"Ciencias Naturales":[13,13,null!,null!],"Arte y Cultura":[16,16,null!,null!] },
  4:  { "Matemáticas":[17,17,null!,null!],"Comunicación":[16,16,null!,null!],"Historia y Geografía":[15,16,null!,null!],"Inglés":[14,15,null!,null!],"Educación Física":[18,18,null!,null!] },
  5:  { "Matemáticas":[14,15,null!,null!],"Comunicación":[15,15,null!,null!],"Ciencias Naturales":[14,14,null!,null!],"Arte y Cultura":[17,17,null!,null!] },
  6:  { "Matemáticas":[18,18,null!,null!],"Comunicación":[17,17,null!,null!],"Historia y Geografía":[16,17,null!,null!],"Inglés":[15,16,null!,null!] },
  8:  { "Matemáticas":[11,12,null!,null!],"Comunicación":[12,13,null!,null!],"Historia y Geografía":[11,11,null!,null!],"Inglés":[10,11,null!,null!],"Educación Física":[15,15,null!,null!] },
  9:  { "Matemáticas":[15,15,null!,null!],"Comunicación":[16,15,null!,null!],"Historia y Geografía":[14,14,null!,null!],"Ciencias Naturales":[15,16,null!,null!] },
  11: { "Matemáticas":[13,14,null!,null!],"Comunicación":[14,14,null!,null!],"Ciencias Naturales":[13,14,null!,null!],"Arte y Cultura":[15,16,null!,null!] },
  12: { "Matemáticas":[10,10,null!,null!],"Comunicación":[11,11,null!,null!],"Historia y Geografía":[10,10,null!,null!],"Inglés":[9,9,null!,null!] },
};

function buildNotas(): Nota[] {
  const records: Nota[] = [];
  let id = 1;
  for (const est of ESTUDIANTES) {
    const asigs = BASE[est.id] ?? {};
    for (const [asig, notas] of Object.entries(asigs)) {
      const validNotas = notas.filter((n) => n !== null) as number[];
      const promedio = validNotas.length ? parseFloat((validNotas.reduce((a,b) => a+b,0)/validNotas.length).toFixed(1)) : 0;
      notas.forEach((nota, i) => {
        if (nota === null) return;
        records.push({
          id: id++,
          estudianteId: est.id,
          estudianteNombre: est.nombre,
          estudianteCodigo: est.codigo,
          grado: est.grado,
          seccion: est.seccion,
          ciclo: "Año Escolar 2026",
          asignatura: asig,
          docente: DOCENTES[asig] ?? "—",
          periodo: PERIODOS[i],
          calificacion: nota,
          promedio,
        });
      });
    }
  }
  return records;
}

const ALL_NOTAS = buildNotas();

// ── Helpers ───────────────────────────────────────────────────────────────────

function noteColor(n: number): string {
  if (n >= 17) return "#00ADEB";
  if (n >= 14) return "#10B981";
  if (n >= 11) return "#F59E0B";
  return "#EF4444";
}

function noteLabel(n: number): string {
  if (n >= 17) return "Destacado";
  if (n >= 14) return "Logrado";
  if (n >= 11) return "En proceso";
  return "En inicio";
}

function NoteBadge({ n }: { n: number }) {
  const color = noteColor(n);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: `${color}20`, color }}>
      {n} — {noteLabel(n)}
    </span>
  );
}

function NoteMini({ n }: { n: number }) {
  const color = noteColor(n);
  return <span className="text-sm font-bold" style={{ color, fontFamily: "var(--font-display)" }}>{n}</span>;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs space-y-1" style={{ background: "#1F2525", border: "1px solid #2e3939", color: "#fff" }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: noteColor(p.value) }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

// ── Student drawer ─────────────────────────────────────────────────────────────

function StudentDrawer({ notas, studentId, onClose }: {
  notas: Nota[]; studentId: number; onClose: () => void;
}) {
  const est = ESTUDIANTES.find((e) => e.id === studentId);
  const estNotas = ALL_NOTAS.filter((n) => n.estudianteId === studentId);

  // Per subject averages
  const byAsig = ASIGNATURAS.map((a) => {
    const sub = estNotas.filter((n) => n.asignatura === a);
    if (!sub.length) return null;
    const avg = parseFloat((sub.reduce((acc, n) => acc + n.calificacion, 0) / sub.length).toFixed(1));
    return { asig: a, avg, notas: sub.map((n) => ({ periodo: n.periodo.slice(0,2), nota: n.calificacion })) };
  }).filter(Boolean) as { asig: string; avg: number; notas: { periodo: string; nota: number }[] }[];

  const generalAvg = byAsig.length
    ? parseFloat((byAsig.reduce((a, b) => a + b.avg, 0) / byAsig.length).toFixed(1)) : 0;

  // Trend data
  const trendData = PERIODOS.slice(0, 2).map((p, i) => {
    const periodNotas = estNotas.filter((n) => n.periodo === p);
    const avg = periodNotas.length
      ? parseFloat((periodNotas.reduce((a, n) => a + n.calificacion, 0) / periodNotas.length).toFixed(1)) : null;
    return { periodo: `B${i+1}`, promedio: avg };
  }).filter((d) => d.promedio !== null);

  // Radar data
  const radarData = byAsig.map((b) => ({ asig: b.asig.split(" ")[0], nota: b.avg, fullMark: 20 }));
  const isBajoRendimiento = generalAvg < 11;

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.65)" }}>
      <div className="ml-auto w-full max-w-2xl h-full flex flex-col border-l overflow-hidden"
        style={{ background: "#1F2525", borderColor: "#2e3939" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: "#2e3939" }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>
              {est?.nombre.split(" ").slice(0, 2).map((n) => n[0]).join("") ?? "?"}
            </div>
            <div>
              <p className="text-white font-bold" style={{ fontFamily: "var(--font-display)" }}>{est?.nombre}</p>
              <p className="text-xs text-gray-500">{est?.grado} — Sección {est?.seccion} · {est?.codigo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Alert */}
          {isBajoRendimiento && (
            <div className="flex items-start gap-2 p-3 rounded-lg text-xs"
              style={{ background: "#EF444415", border: "1px solid #EF444440", color: "#EF4444" }}>
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              <span>Promedio general por debajo del mínimo aprobatorio — <strong>requiere atención inmediata</strong>.</span>
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Promedio general", value: generalAvg, large: true },
              { label: "Asignaturas", value: byAsig.length },
              { label: "Situación", value: noteLabel(generalAvg), isText: true, color: noteColor(generalAvg) },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border p-3 text-center" style={{ background: "#263030", borderColor: "#2e3939" }}>
                <p className={`font-bold ${k.large ? "text-3xl" : "text-xl"}`}
                  style={{ color: k.color ?? noteColor(generalAvg), fontFamily: "var(--font-display)" }}>
                  {k.value}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Radar */}
            <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
              <p className="text-xs font-semibold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>Perfil por asignatura</p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2e3939" />
                  <PolarAngleAxis dataKey="asig" tick={{ fill: "#6B7280", fontSize: 10 }} />
                  <Radar name="Nota" dataKey="nota" stroke="#00ADEB" fill="#00ADEB" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Trend */}
            <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
              <p className="text-xs font-semibold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>Tendencia bimestral</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3939" vertical={false} />
                  <XAxis dataKey="periodo" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 20]} tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                  <ReferenceLine y={11} stroke="#EF4444" strokeDasharray="4 2" label={{ value: "Mín.", fill: "#EF4444", fontSize: 9, position: "right" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="promedio" stroke="#00ADEB" strokeWidth={2.5} dot={{ fill: "#00ADEB", r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per subject table */}
          <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "#2e3939" }}>
              <p className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Calificaciones por asignatura</p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-400" style={{ fontFamily: "var(--font-display)" }}>Asignatura</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-gray-400">B1</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-gray-400">B2</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-gray-400">Promedio</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-gray-400">Estado</th>
                </tr>
              </thead>
              <tbody>
                {byAsig.map((b) => (
                  <tr key={b.asig} className="border-b last:border-b-0" style={{ borderColor: "#2e3939" }}>
                    <td className="px-4 py-2.5 text-gray-200">{b.asig}</td>
                    {["B1","B2"].map((p) => {
                      const n = b.notas.find((x) => x.periodo === p);
                      return (
                        <td key={p} className="px-4 py-2.5 text-center">
                          {n ? <NoteMini n={n.nota} /> : <span className="text-gray-600">—</span>}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-center">
                      <span className="font-bold text-sm" style={{ color: noteColor(b.avg), fontFamily: "var(--font-display)" }}>{b.avg}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${noteColor(b.avg)}20`, color: noteColor(b.avg) }}>
                        {noteLabel(b.avg)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const ROWS = 12;

export default function Calificaciones() {
  const [filterCiclo,    setFilterCiclo]    = useState("Año Escolar 2026");
  const [filterGrado,    setFilterGrado]    = useState("");
  const [filterSeccion,  setFilterSeccion]  = useState("");
  const [filterAsig,     setFilterAsig]     = useState("");
  const [filterPeriodo,  setFilterPeriodo]  = useState("");
  const [filterEstudiante, setFilterEstudiante] = useState("");
  const [search,         setSearch]         = useState("");
  const [page,           setPage]           = useState(1);
  const [drawerEstId,    setDrawerEstId]    = useState<number | null>(null);
  const [showBajoRend,   setShowBajoRend]   = useState(false);

  // Set of student IDs with bajo rendimiento (promedio < 11 in any subject)
  const bajoRendIds = useMemo(() => {
    const result = new Set<number>();
    for (const est of ESTUDIANTES) {
      const asigs = BASE[est.id] ?? {};
      for (const notas of Object.values(asigs)) {
        const valid = (notas as (number|null)[]).filter((n): n is number => n !== null);
        if (valid.length && valid.reduce((a,b) => a+b,0)/valid.length < 11) {
          result.add(est.id);
        }
      }
    }
    return result;
  }, []);

  const filtered = useMemo(() => ALL_NOTAS.filter((n) => {
    const q = search.toLowerCase();
    const matchQ = !q || n.estudianteNombre.toLowerCase().includes(q) || n.estudianteCodigo.toLowerCase().includes(q);
    return matchQ &&
      (!filterCiclo     || n.ciclo === filterCiclo) &&
      (!filterGrado     || n.grado === filterGrado) &&
      (!filterSeccion   || n.seccion === filterSeccion) &&
      (!filterAsig      || n.asignatura === filterAsig) &&
      (!filterPeriodo   || n.periodo === filterPeriodo) &&
      (!filterEstudiante|| n.estudianteId === Number(filterEstudiante)) &&
      (!showBajoRend    || bajoRendIds.has(n.estudianteId));
  }), [filterCiclo, filterGrado, filterSeccion, filterAsig, filterPeriodo, filterEstudiante, search, showBajoRend]);

  // KPIs
  const kpis = useMemo(() => {
    const notas = filtered.map((n) => n.calificacion);
    const avg = notas.length ? parseFloat((notas.reduce((a,b)=>a+b,0)/notas.length).toFixed(1)) : 0;
    const destacados = notas.filter((n) => n >= 17).length;
    const logrados   = notas.filter((n) => n >= 14 && n < 17).length;
    const proceso    = notas.filter((n) => n >= 11 && n < 14).length;
    const inicio     = notas.filter((n) => n < 11).length;
    return { avg, total: notas.length, destacados, logrados, proceso, inicio };
  }, [filtered]);

  // Promedio por asignatura (bar chart data)
  const avgByAsig = useMemo(() => ASIGNATURAS.map((a) => {
    const sub = filtered.filter((n) => n.asignatura === a);
    const avg = sub.length ? parseFloat((sub.reduce((s,n)=>s+n.calificacion,0)/sub.length).toFixed(1)) : null;
    return { asig: a.split(" ")[0], asigFull: a, avg };
  }).filter((d) => d.avg !== null), [filtered]);

  // Promedio por grado
  const avgByGrado = useMemo(() => GRADOS.map((g) => {
    const sub = filtered.filter((n) => n.grado === g);
    const avg = sub.length ? parseFloat((sub.reduce((s,n)=>s+n.calificacion,0)/sub.length).toFixed(1)) : null;
    return { grado: g.slice(0,2), avg };
  }).filter((d) => d.avg !== null), [filtered]);

  // Bajo rendimiento list
  const bajoRendStudents = useMemo(() => ESTUDIANTES.filter((e) => bajoRendIds.has(e.id)), []);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage-1)*ROWS, curPage*ROWS);

  function clearFilters() {
    setFilterCiclo("Año Escolar 2026"); setFilterGrado(""); setFilterSeccion("");
    setFilterAsig(""); setFilterPeriodo(""); setFilterEstudiante(""); setSearch(""); setShowBajoRend(false); setPage(1);
  }
  const hasFilters = filterGrado || filterSeccion || filterAsig || filterPeriodo || filterEstudiante || search || showBajoRend;

  function Sel({ icon, value, onChange, placeholder, options, labelFn }: {
    icon: React.ReactNode; value: string; onChange: (v: string) => void;
    placeholder: string; options: string[]; labelFn?: (s: string) => string;
  }) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg px-3 py-2 flex-shrink-0"
        style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
        <span className="text-gray-500 flex-shrink-0">{icon}</span>
        <select className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer max-w-40"
          value={value} onChange={(e) => { onChange(e.target.value); setPage(1); }}>
          <option value="" style={{ background: "#1F2525" }}>{placeholder}</option>
          {options.map((o) => <option key={o} value={o} style={{ background: "#1F2525" }}>{labelFn ? labelFn(o) : o}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "Promedio general",    value: kpis.avg,        color: noteColor(kpis.avg), icon: Star,        large: true },
          { label: "Total registros",     value: kpis.total,      color: "#9CA3AF",           icon: Activity,    large: false },
          { label: "Destacado (17–20)",   value: kpis.destacados, color: "#00ADEB",           icon: Award,       large: false },
          { label: "Logrado (14–16)",     value: kpis.logrados,   color: "#10B981",           icon: TrendingUp,  large: false },
          { label: "En proceso (11–13)",  value: kpis.proceso,    color: "#F59E0B",           icon: Minus,       large: false },
          { label: "En inicio (<11)",     value: kpis.inicio,     color: "#EF4444",           icon: TrendingDown,large: false },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border p-4 flex items-center gap-3"
            style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${k.color}20` }}>
              <k.icon size={17} style={{ color: k.color }} />
            </div>
            <div>
              <p className={`font-bold text-white leading-none ${k.large ? "text-3xl" : "text-2xl"}`}
                style={{ fontFamily: "var(--font-display)", color: k.color }}>{k.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + bajo rendimiento */}
      <div className="grid grid-cols-4 gap-4">
        {/* Avg by subject */}
        <div className="col-span-2 rounded-xl border p-5" style={{ background: "#263030", borderColor: "#2e3939" }}>
          <p className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Promedio por asignatura</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={avgByAsig} barSize={24} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3939" horizontal={false} />
              <XAxis type="number" domain={[0, 20]} tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="asig" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} width={68} />
              <ReferenceLine x={11} stroke="#EF4444" strokeDasharray="3 2" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" radius={[0,4,4,0]} name="Promedio">
                {avgByAsig.map((d, i) => (
                  <Cell key={i} fill={noteColor(d.avg!)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg by grade */}
        <div className="rounded-xl border p-5" style={{ background: "#263030", borderColor: "#2e3939" }}>
          <p className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Promedio por grado</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={avgByGrado} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3939" vertical={false} />
              <XAxis dataKey="grado" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 20]} tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <ReferenceLine y={11} stroke="#EF4444" strokeDasharray="3 2" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" radius={[4,4,0,0]} name="Promedio">
                {avgByGrado.map((d, i) => <Cell key={i} fill={noteColor(d.avg!)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bajo rendimiento */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#2e3939" }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-[#EF4444]" />
              <p className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Bajo rendimiento</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#EF444420", color: "#EF4444" }}>
              {bajoRendStudents.length}
            </span>
          </div>
          <div className="divide-y max-h-52 overflow-y-auto" style={{ borderColor: "#2e3939" }}>
            {bajoRendStudents.map((e) => {
              const estNotas = ALL_NOTAS.filter((n) => n.estudianteId === e.id);
              const avg = estNotas.length
                ? parseFloat((estNotas.reduce((a,n)=>a+n.calificacion,0)/estNotas.length).toFixed(1)) : 0;
              return (
                <button key={e.id} onClick={() => setDrawerEstId(e.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#2e3939]/50 transition-colors">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: "#EF444430" }}>
                    <TrendingDown size={11} style={{ color: "#EF4444" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate" style={{ fontFamily: "var(--font-display)" }}>{e.nombre}</p>
                    <p className="text-[10px] text-gray-500">{e.grado} — Sec. {e.seccion}</p>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: "#EF4444", fontFamily: "var(--font-display)" }}>{avg}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-52 rounded-lg px-3 py-2"
            style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Search size={13} className="text-gray-500 flex-shrink-0" />
            <input placeholder="Buscar estudiante..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-full" />
            {search && <button onClick={() => setSearch("")}><X size={12} className="text-gray-500" /></button>}
          </div>

          <Sel icon={<Calendar size={12} />} value={filterCiclo} onChange={setFilterCiclo} placeholder="Ciclo" options={CICLOS} />
          <Sel icon={<GraduationCap size={12} />} value={filterGrado} onChange={setFilterGrado} placeholder="Grado" options={GRADOS} />
          <Sel icon={<Layers size={12} />} value={filterSeccion} onChange={setFilterSeccion} placeholder="Sección" options={SECCIONES} labelFn={(s) => `Sección ${s}`} />
          <Sel icon={<BookOpen size={12} />} value={filterAsig} onChange={setFilterAsig} placeholder="Asignatura" options={ASIGNATURAS} />
          <Sel icon={<Filter size={12} />} value={filterPeriodo} onChange={setFilterPeriodo} placeholder="Período" options={PERIODOS} />
          <Sel icon={<User size={12} />} value={filterEstudiante} onChange={setFilterEstudiante} placeholder="Estudiante"
            options={ESTUDIANTES.map((e) => String(e.id))}
            labelFn={(id) => ESTUDIANTES.find((e) => e.id === Number(id))?.nombre ?? id} />

          {/* Bajo rendimiento toggle */}
          <button onClick={() => { setShowBajoRend(!showBajoRend); setPage(1); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all"
            style={{
              background: showBajoRend ? "#EF444415" : "#1F2525",
              borderColor: showBajoRend ? "#EF4444" : "#2e3939",
              color: showBajoRend ? "#EF4444" : "#6B7280",
              fontFamily: "var(--font-display)",
            }}>
            <AlertTriangle size={12} />Bajo rendimiento
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
              {["Estudiante","Grado / Sección","Asignatura","Docente","Período","Calificación","Promedio asig.","Estado",""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                  style={{ fontFamily: "var(--font-display)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center">
                  <Star size={36} className="mx-auto mb-3 text-gray-700" />
                  <p className="text-sm text-gray-500">No se encontraron calificaciones</p>
                  <p className="text-xs text-gray-600 mt-1">Ajusta los filtros para ver otros registros</p>
                </td>
              </tr>
            ) : pageRows.map((n, idx) => {
              const isBajo = bajoRendIds.has(n.estudianteId);
              const color = noteColor(n.calificacion);
              const promColor = noteColor(n.promedio);
              return (
                <tr key={n.id} className="border-b transition-colors hover:bg-[#2e3939]/40 group"
                  style={{ borderColor: "#2e3939" }}>
                  {/* Estudiante */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: idx % 2 === 0 ? "#107A9F" : "#00ADEB" }}>
                          {n.estudianteNombre.split(" ").slice(0,2).map((x)=>x[0]).join("")}
                        </div>
                        {isBajo && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border flex items-center justify-center"
                            style={{ background: "#EF4444", borderColor: "#263030" }}>
                            <AlertTriangle size={7} className="text-white" />
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>
                          {n.estudianteNombre}
                        </p>
                        <p className="text-[10px] font-mono text-gray-600">{n.estudianteCodigo}</p>
                      </div>
                    </div>
                  </td>

                  {/* Grado / Sección */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-300">{n.grado}</span>
                      <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>{n.seccion}</span>
                    </div>
                  </td>

                  {/* Asignatura */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-200">
                      <BookOpen size={11} className="text-[#107A9F] flex-shrink-0" />
                      <span className="whitespace-nowrap">{n.asignatura}</span>
                    </div>
                  </td>

                  {/* Docente */}
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{n.docente}</td>

                  {/* Período */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: "#2e3939", color: "#9CA3AF" }}>
                      {n.periodo.slice(0, 2)}
                    </span>
                  </td>

                  {/* Calificación */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold" style={{ color, fontFamily: "var(--font-display)" }}>{n.calificacion}</span>
                      <div className="w-12 h-1.5 rounded-full" style={{ background: "#2e3939" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${(n.calificacion/20)*100}%`, background: color }} />
                      </div>
                    </div>
                  </td>

                  {/* Promedio */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold" style={{ color: promColor, fontFamily: "var(--font-display)" }}>{n.promedio}</span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${color}20`, color }}>
                      {noteLabel(n.calificacion)}
                    </span>
                  </td>

                  {/* Ver */}
                  <td className="px-4 py-3">
                    <button onClick={() => setDrawerEstId(n.estudianteId)}
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
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-500">
              {filtered.length === 0 ? "0 registros"
                : `Mostrando ${(curPage-1)*ROWS+1}–${Math.min(curPage*ROWS, filtered.length)} de ${filtered.length.toLocaleString()}`}
            </p>
            {/* Scale legend */}
            <div className="flex items-center gap-3 text-[11px]">
              {[
                { label: "Destacado 17–20", color: "#00ADEB" },
                { label: "Logrado 14–16",   color: "#10B981" },
                { label: "En proceso 11–13",color: "#F59E0B" },
                { label: "En inicio <11",   color: "#EF4444" },
              ].map((s) => (
                <span key={s.label} className="flex items-center gap-1" style={{ color: s.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={curPage===1}
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
            <button onClick={() => setPage((p) => Math.min(totalPages,p+1))} disabled={curPage===totalPages}
              className="p-1.5 rounded-lg disabled:opacity-30 text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerEstId !== null && (
        <StudentDrawer notas={filtered} studentId={drawerEstId} onClose={() => setDrawerEstId(null)} />
      )}
    </div>
  );
}
