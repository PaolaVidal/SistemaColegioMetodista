import { useState, useMemo } from "react";
import {
  Search, X, ChevronLeft, ChevronRight, RotateCcw,
  DollarSign, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Eye, Calendar, GraduationCap, Layers, Shield, BookOpen,
  Activity, Wallet, Users, Filter,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = "2026-09-08";

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pagado:    { bg: "#10B98120", text: "#10B981", dot: "#10B981", label: "Pagado"    },
  pendiente: { bg: "#F59E0B20", text: "#F59E0B", dot: "#F59E0B", label: "Pendiente" },
  vencido:   { bg: "#EF444420", text: "#EF4444", dot: "#EF4444", label: "Vencido"   },
  parcial:   { bg: "#00ADEB20", text: "#00ADEB", dot: "#00ADEB", label: "Parcial"   },
};

const CONCEPTO_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  "Matrícula 2026":      GraduationCap,
  "Material didáctico":  BookOpen,
  "Seguro escolar":      Shield,
  "Excursión escolar":   Activity,
};

const CONCEPTOS = [
  "Matrícula 2026", "Mensualidad Mar", "Mensualidad Abr", "Mensualidad May",
  "Mensualidad Jun", "Mensualidad Jul", "Mensualidad Ago", "Mensualidad Sep",
  "Material didáctico", "Seguro escolar", "Excursión escolar",
];

const GRADOS = ["1° Grado","2° Grado","3° Grado","4° Grado","5° Grado","6° Grado"];

// ─── Types ────────────────────────────────────────────────────────────────────

type Estado = "pagado" | "pendiente" | "vencido" | "parcial";

interface Pago {
  id: string;
  estudianteId: number;
  estudianteNombre: string;
  estudianteCodigo: string;
  grado: string;
  seccion: string;
  concepto: string;
  fecha: string;
  monto: number;
  estado: Estado;
  montoPagado?: number;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

const ESTUDIANTES = [
  { id:1,  nombre:"Lucía F. Paredes Vega",        codigo:"EST-00001", grado:"3° Grado", seccion:"A" },
  { id:2,  nombre:"Diego A. Mamani Quispe",        codigo:"EST-00002", grado:"3° Grado", seccion:"A" },
  { id:3,  nombre:"Valentina Quispe Huanca",        codigo:"EST-00003", grado:"1° Grado", seccion:"B" },
  { id:4,  nombre:"Sebastián R. Torres Cáceres",   codigo:"EST-00004", grado:"5° Grado", seccion:"A" },
  { id:5,  nombre:"Camila A. Herrera Taipe",       codigo:"EST-00005", grado:"1° Grado", seccion:"A" },
  { id:6,  nombre:"Andrés F. Cáceres Puma",        codigo:"EST-00006", grado:"6° Grado", seccion:"A" },
  { id:7,  nombre:"Ricardo A. Soto Aliaga",        codigo:"EST-00008", grado:"4° Grado", seccion:"A" },
  { id:8,  nombre:"Mariana I. Flores Chávez",      codigo:"EST-00009", grado:"2° Grado", seccion:"B" },
  { id:9,  nombre:"Sofía V. Cruz Apaza",           codigo:"EST-00011", grado:"1° Grado", seccion:"A" },
  { id:10, nombre:"Mateo J. Ramos Salinas",        codigo:"EST-00012", grado:"3° Grado", seccion:"B" },
];

const MONTHLY = [
  { label:"Mensualidad Mar", fecha:"2026-03-05" },
  { label:"Mensualidad Abr", fecha:"2026-04-05" },
  { label:"Mensualidad May", fecha:"2026-05-05" },
  { label:"Mensualidad Jun", fecha:"2026-06-05" },
  { label:"Mensualidad Jul", fecha:"2026-07-05" },
  { label:"Mensualidad Ago", fecha:"2026-08-05" },
  { label:"Mensualidad Sep", fecha:"2026-09-05" },
];

type Pattern = { matricula: Estado; meses: Estado[]; material: Estado; seguro: Estado; excursion?: Estado };
const PATTERNS: Record<number, Pattern> = {
  1:  { matricula:"pagado", meses:["pagado","pagado","pagado","pagado","pagado","pagado","pendiente"], material:"pagado",    seguro:"pagado", excursion:"pagado" },
  2:  { matricula:"pagado", meses:["pagado","pagado","pagado","vencido","vencido","vencido","vencido"], material:"pagado",   seguro:"pagado", excursion:"pendiente" },
  3:  { matricula:"pagado", meses:["pagado","pagado","pagado","pagado","pagado","pendiente","pendiente"], material:"pendiente", seguro:"pagado" },
  4:  { matricula:"pagado", meses:["pagado","pagado","pagado","pagado","pagado","pagado","pagado"], material:"pagado",       seguro:"pagado", excursion:"pagado" },
  5:  { matricula:"pagado", meses:["pagado","pagado","pagado","pagado","pagado","pagado","pendiente"], material:"pagado",    seguro:"pagado" },
  6:  { matricula:"pagado", meses:["pagado","pagado","pagado","pagado","pagado","pagado","pagado"], material:"pagado",       seguro:"pagado", excursion:"pagado" },
  7:  { matricula:"pagado", meses:["pagado","pagado","vencido","vencido","vencido","vencido","vencido"], material:"vencido", seguro:"pagado" },
  8:  { matricula:"pagado", meses:["pagado","pagado","pagado","pagado","parcial","parcial","pendiente"], material:"pagado",  seguro:"pagado" },
  9:  { matricula:"pagado", meses:["pagado","pagado","pagado","pagado","pagado","pagado","pendiente"], material:"pagado",    seguro:"pagado", excursion:"pendiente" },
  10: { matricula:"pagado", meses:["pagado","pagado","pagado","vencido","vencido","vencido","vencido"], material:"pendiente",seguro:"pagado" },
};

let _pid = 1;
function buildPagos(): Pago[] {
  const all: Pago[] = [];
  for (const est of ESTUDIANTES) {
    const p = PATTERNS[est.id]!;
    const push = (concepto: string, fecha: string, monto: number, estado: Estado, montoPagado?: number) =>
      all.push({ id:`p${_pid++}`, estudianteId:est.id, estudianteNombre:est.nombre, estudianteCodigo:est.codigo, grado:est.grado, seccion:est.seccion, concepto, fecha, monto, estado, montoPagado });

    push("Matrícula 2026", "2026-02-01", 150, p.matricula);
    MONTHLY.forEach((m, i) => {
      const estado = p.meses[i] ?? "pendiente";
      push(m.label, m.fecha, 80, estado, estado === "parcial" ? 40 : undefined);
    });
    push("Material didáctico", "2026-03-10", 45, p.material);
    push("Seguro escolar",     "2026-02-15", 25, p.seguro);
    if (p.excursion) push("Excursión escolar", "2026-08-20", 35, p.excursion);
  }
  return all;
}

const ALL_PAGOS = buildPagos();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysOverdue(fecha: string): number {
  const due = new Date(fecha);
  const now = new Date(TODAY);
  return Math.max(0, Math.floor((now.getTime() - due.getTime()) / 86400000));
}

function fmt(n: number): string {
  return `S/ ${n.toFixed(2)}`;
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${months[Number(m)-1]} ${y}`;
}

function StatusBadge({ estado }: { estado: Estado }) {
  const s = STATUS_COLORS[estado];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />{s.label}
    </span>
  );
}

function ConceptoIcon({ concepto }: { concepto: string }) {
  const Icon = CONCEPTO_ICONS[concepto] ?? Calendar;
  return <Icon size={13} style={{ color: "#9CA3AF" }} />;
}

function montoEfectivo(p: Pago): number {
  if (p.estado === "pagado") return p.monto;
  if (p.estado === "parcial") return p.montoPagado ?? 0;
  return 0;
}

function montoPendiente(p: Pago): number {
  if (p.estado === "pagado") return 0;
  if (p.estado === "parcial") return p.monto - (p.montoPagado ?? 0);
  return p.monto;
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function EstudianteDrawer({ estudianteId, onClose }: { estudianteId: number; onClose: () => void }) {
  const est = ESTUDIANTES.find((e) => e.id === estudianteId);
  const pagos = ALL_PAGOS.filter((p) => p.estudianteId === estudianteId).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const totalMonto   = pagos.reduce((s, p) => s + p.monto, 0);
  const totalPagado  = pagos.reduce((s, p) => s + montoEfectivo(p), 0);
  const totalPend    = pagos.filter((p) => p.estado === "pendiente" || p.estado === "parcial").reduce((s, p) => s + montoPendiente(p), 0);
  const totalVencido = pagos.filter((p) => p.estado === "vencido").reduce((s, p) => s + p.monto, 0);
  const pct = totalMonto > 0 ? (totalPagado / totalMonto) * 100 : 0;
  const initials = est?.nombre.split(" ").slice(0,2).map((n)=>n[0]).join("") ?? "?";

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.65)" }}>
      <div className="ml-auto w-full max-w-xl h-full flex flex-col border-l overflow-hidden"
        style={{ background: "#1F2525", borderColor: "#2e3939" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0" style={{ borderColor: "#2e3939" }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>{initials}</div>
            <div>
              <p className="text-white font-bold" style={{ fontFamily: "var(--font-display)" }}>{est?.nombre}</p>
              <p className="text-xs text-gray-500">{est?.grado} — Sección {est?.seccion} · {est?.codigo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#2e3939" }}>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {[
              { label:"Total",     value: fmt(totalMonto),   color: "#9CA3AF" },
              { label:"Pagado",    value: fmt(totalPagado),  color: "#10B981" },
              { label:"Pendiente", value: fmt(totalPend),    color: "#F59E0B" },
              { label:"Vencido",   value: fmt(totalVencido), color: "#EF4444" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border p-3 text-center" style={{ background: "#263030", borderColor: "#2e3939" }}>
                <p className="text-sm font-bold" style={{ color: k.color, fontFamily: "var(--font-display)" }}>{k.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#2e3939" }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? "#10B981" : "#00ADEB" }} />
          </div>
          <p className="text-[10px] text-gray-500 mt-1">{pct.toFixed(0)}% cancelado</p>
        </div>

        {/* Historial */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-3 border-b" style={{ borderColor: "#2e3939" }}>
            <p className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Historial de movimientos</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "#263030", borderBottom: "1px solid #2e3939" }}>
                {["Concepto","Fecha","Monto","Estado"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-400" style={{ fontFamily: "var(--font-display)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id} className="border-b" style={{ borderColor: "#2e3939" }}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <ConceptoIcon concepto={p.concepto} />
                      <span className="text-gray-200">{p.concepto}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{fmtDate(p.fecha)}</td>
                  <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
                    {fmt(p.monto)}
                    {p.estado === "parcial" && (
                      <span className="ml-1 text-[10px] font-normal text-gray-500">(abonado {fmt(p.montoPagado!)})</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge estado={p.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const ROWS = 12;

export default function Financiero() {
  const [activeTab, setActiveTab] = useState<"pagos" | "estados" | "pendientes">("pagos");

  // shared filters
  const [search,         setSearch]         = useState("");
  const [filterConcepto, setFilterConcepto] = useState("");
  const [filterEstado,   setFilterEstado]   = useState("");
  const [filterGrado,    setFilterGrado]    = useState("");
  const [drawerEstId,    setDrawerEstId]    = useState<number | null>(null);
  const [page,           setPage]           = useState(1);

  function clearFilters() { setSearch(""); setFilterConcepto(""); setFilterEstado(""); setFilterGrado(""); setPage(1); }
  const hasFilters = !!(search || filterConcepto || filterEstado || filterGrado);

  // ── Pagos tab ──
  const filteredPagos = useMemo(() => ALL_PAGOS.filter((p) => {
    const q = search.toLowerCase();
    return (!q || p.estudianteNombre.toLowerCase().includes(q) || p.estudianteCodigo.toLowerCase().includes(q))
      && (!filterConcepto || p.concepto === filterConcepto)
      && (!filterEstado   || p.estado === filterEstado)
      && (!filterGrado    || p.grado === filterGrado);
  }), [search, filterConcepto, filterEstado, filterGrado]);

  const totalPages = Math.max(1, Math.ceil(filteredPagos.length / ROWS));
  const curPage    = Math.min(page, totalPages);
  const pageRows   = filteredPagos.slice((curPage-1)*ROWS, curPage*ROWS);

  // ── KPIs (over all pagos) ──
  const kpis = useMemo(() => {
    const totalRecaudado = ALL_PAGOS.reduce((s, p) => s + montoEfectivo(p), 0);
    const totalPend      = ALL_PAGOS.filter((p) => p.estado === "pendiente" || p.estado === "parcial").reduce((s, p) => s + montoPendiente(p), 0);
    const totalVencido   = ALL_PAGOS.filter((p) => p.estado === "vencido").reduce((s, p) => s + p.monto, 0);
    const pagosMes       = ALL_PAGOS.filter((p) => p.estado === "pagado" && p.fecha.startsWith("2026-09")).length;
    return { totalRecaudado, totalPend, totalVencido, pagosMes };
  }, []);

  // ── Estados de cuenta ──
  const estadosCuenta = useMemo(() => ESTUDIANTES
    .filter((e) => !filterGrado || e.grado === filterGrado)
    .filter((e) => {
      const q = search.toLowerCase();
      return !q || e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q);
    })
    .map((e) => {
      const pagos = ALL_PAGOS.filter((p) => p.estudianteId === e.id);
      const total    = pagos.reduce((s, p) => s + p.monto, 0);
      const pagado   = pagos.reduce((s, p) => s + montoEfectivo(p), 0);
      const pendiente= pagos.filter((p) => p.estado === "pendiente" || p.estado === "parcial").reduce((s, p) => s + montoPendiente(p), 0);
      const vencido  = pagos.filter((p) => p.estado === "vencido").reduce((s, p) => s + p.monto, 0);
      return { ...e, total, pagado, pendiente, vencido };
    }), [filterGrado, search]);

  // ── Pagos pendientes ──
  const pagosPendientes = useMemo(() => ALL_PAGOS
    .filter((p) => p.estado === "vencido" || p.estado === "pendiente" || p.estado === "parcial")
    .filter((p) => (!filterGrado || p.grado === filterGrado) && (!filterEstado || p.estado === filterEstado))
    .filter((p) => {
      const q = search.toLowerCase();
      return !q || p.estudianteNombre.toLowerCase().includes(q) || p.estudianteCodigo.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const rank: Record<Estado, number> = { vencido:0, parcial:1, pendiente:2, pagado:3 };
      return rank[a.estado] - rank[b.estado] || a.fecha.localeCompare(b.fecha);
    }), [filterGrado, filterEstado, search]);

  const pendKpis = useMemo(() => ({
    montoTotal:  pagosPendientes.reduce((s, p) => s + montoPendiente(p), 0),
    montoVencido:pagosPendientes.filter((p) => p.estado === "vencido").reduce((s, p) => s + p.monto, 0),
    estudiantes: new Set(pagosPendientes.map((p) => p.estudianteId)).size,
  }), [pagosPendientes]);

  // ── Render ──

  function FilterBar({ showEstado = true, showConcepto = true }) {
    return (
      <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1 min-w-52" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Search size={13} className="text-gray-500 flex-shrink-0" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar estudiante..." className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-full" />
            {search && <button onClick={() => setSearch("")}><X size={12} className="text-gray-500" /></button>}
          </div>

          {showConcepto && (
            <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
              <Calendar size={12} className="text-gray-500" />
              <select value={filterConcepto} onChange={(e) => { setFilterConcepto(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-xs text-gray-300">
                <option value="" style={{ background: "#1F2525" }}>Concepto</option>
                {CONCEPTOS.map((c) => <option key={c} value={c} style={{ background: "#1F2525" }}>{c}</option>)}
              </select>
            </div>
          )}

          {showEstado && (
            <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
              <Filter size={12} className="text-gray-500" />
              <select value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-xs text-gray-300">
                <option value="" style={{ background: "#1F2525" }}>Estado</option>
                {Object.entries(STATUS_COLORS).map(([k,v]) => <option key={k} value={k} style={{ background: "#1F2525" }}>{v.label}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <GraduationCap size={12} className="text-gray-500" />
            <select value={filterGrado} onChange={(e) => { setFilterGrado(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-xs text-gray-300">
              <option value="" style={{ background: "#1F2525" }}>Grado</option>
              {GRADOS.map((g) => <option key={g} value={g} style={{ background: "#1F2525" }}>{g}</option>)}
            </select>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2">
              <RotateCcw size={11} />Limpiar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"Total recaudado",      value: fmt(kpis.totalRecaudado), color:"#00ADEB", icon:Wallet,        sub:`${ALL_PAGOS.filter(p=>p.estado==="pagado").length} pagos` },
          { label:"Pendiente por cobrar", value: fmt(kpis.totalPend),      color:"#F59E0B", icon:Clock,         sub:`${ALL_PAGOS.filter(p=>p.estado==="pendiente"||p.estado==="parcial").length} registros` },
          { label:"Monto vencido",        value: fmt(kpis.totalVencido),   color:"#EF4444", icon:AlertTriangle, sub:`${ALL_PAGOS.filter(p=>p.estado==="vencido").length} pagos sin recibir` },
          { label:"Pagos este mes",       value: String(kpis.pagosMes),    color:"#10B981", icon:TrendingUp,    sub:"Septiembre 2026" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border p-5 flex items-center gap-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${k.color}18` }}>
              <k.icon size={20} style={{ color: k.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none" style={{ color: k.color, fontFamily: "var(--font-display)" }}>{k.value}</p>
              <p className="text-xs text-white font-medium mt-1" style={{ fontFamily: "var(--font-display)" }}>{k.label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-xl border p-1 self-start w-fit" style={{ background: "#1F2525", borderColor: "#2e3939" }}>
        {([
          { key:"pagos",      label:"Pagos",            icon:DollarSign  },
          { key:"estados",    label:"Estados de cuenta", icon:Activity    },
          { key:"pendientes", label:"Pagos pendientes",  icon:AlertTriangle },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: activeTab === t.key ? "#00ADEB" : "transparent", color: activeTab === t.key ? "#fff" : "#6B7280", fontFamily: "var(--font-display)" }}>
            <t.icon size={13} />{t.label}
            {t.key === "pendientes" && pagosPendientes.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: activeTab==="pendientes" ? "rgba(255,255,255,0.25)" : "#EF444420", color: activeTab==="pendientes" ? "#fff" : "#EF4444" }}>
                {pagosPendientes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: PAGOS ── */}
      {activeTab === "pagos" && (
        <>
          <FilterBar />
          <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
                  {["Estudiante","Concepto","Fecha","Monto","Estado",""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-14 text-center">
                    <DollarSign size={36} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-sm text-gray-500">Sin resultados</p>
                  </td></tr>
                ) : pageRows.map((p) => {
                  const sc = STATUS_COLORS[p.estado];
                  return (
                    <tr key={p.id} className="border-b hover:bg-[#2e3939]/30 transition-colors group" style={{ borderColor: "#2e3939" }}>
                      {/* Estudiante */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#107A9F,#00ADEB)" }}>
                            {p.estudianteNombre.split(" ").slice(0,2).map((x)=>x[0]).join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{p.estudianteNombre}</p>
                            <p className="text-[10px] text-gray-500">{p.grado} · Sec. {p.seccion}</p>
                          </div>
                        </div>
                      </td>
                      {/* Concepto */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-300">
                          <ConceptoIcon concepto={p.concepto} />
                          <span>{p.concepto}</span>
                        </div>
                      </td>
                      {/* Fecha */}
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDate(p.fecha)}</td>
                      {/* Monto */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{fmt(p.monto)}</p>
                        {p.estado === "parcial" && (
                          <p className="text-[10px] text-[#00ADEB]">Abonado {fmt(p.montoPagado!)}</p>
                        )}
                      </td>
                      {/* Estado */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <StatusBadge estado={p.estado} />
                          {p.estado === "vencido" && (
                            <p className="text-[10px] text-[#EF4444] ml-1">{daysOverdue(p.fecha)} días vencido</p>
                          )}
                        </div>
                      </td>
                      {/* Action */}
                      <td className="px-4 py-3">
                        <button onClick={() => setDrawerEstId(p.estudianteId)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#00ADEB]/10 text-gray-500 hover:text-[#00ADEB] transition-all">
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
                {filteredPagos.length === 0 ? "0 registros" : `Mostrando ${(curPage-1)*ROWS+1}–${Math.min(curPage*ROWS,filteredPagos.length)} de ${filteredPagos.length}`}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={curPage===1}
                  className="p-1.5 rounded-lg disabled:opacity-30 text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages,7) }, (_,i) => {
                  const pp = curPage<=4 ? i+1 : curPage+i-3;
                  if (pp<1||pp>totalPages) return null;
                  return (
                    <button key={pp} onClick={() => setPage(pp)}
                      className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                      style={{ background: pp===curPage?"#00ADEB":"transparent", color: pp===curPage?"#fff":"#9CA3AF", fontFamily:"var(--font-display)" }}>
                      {pp}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={curPage===totalPages}
                  className="p-1.5 rounded-lg disabled:opacity-30 text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Tab: ESTADOS DE CUENTA ── */}
      {activeTab === "estados" && (
        <>
          <FilterBar showEstado={false} showConcepto={false} />
          <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
                  {["Estudiante","Total comprometido","Pagado","Pendiente","Vencido","Progreso",""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {estadosCuenta.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-14 text-center">
                    <Users size={36} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-sm text-gray-500">Sin resultados</p>
                  </td></tr>
                ) : estadosCuenta.map((e) => {
                  const pct = e.total > 0 ? (e.pagado / e.total) * 100 : 0;
                  const alert = e.vencido > 0 ? "vencido" : e.pendiente > 0 ? "pendiente" : "pagado";
                  return (
                    <tr key={e.id} className="border-b hover:bg-[#2e3939]/30 transition-colors group" style={{ borderColor: "#2e3939" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                              style={{ background: "linear-gradient(135deg,#107A9F,#00ADEB)" }}>
                              {e.nombre.split(" ").slice(0,2).map((x)=>x[0]).join("")}
                            </div>
                            {alert !== "pagado" && (
                              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 flex items-center justify-center"
                                style={{ background: STATUS_COLORS[alert].dot, borderColor: "#263030" }} />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{e.nombre}</p>
                            <p className="text-[10px] text-gray-500">{e.grado} · Sec. {e.seccion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{fmt(e.total)}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#10B981", fontFamily: "var(--font-display)" }}>{fmt(e.pagado)}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: e.pendiente>0?"#F59E0B":"#6B7280", fontFamily: "var(--font-display)" }}>{fmt(e.pendiente)}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: e.vencido>0?"#EF4444":"#6B7280", fontFamily: "var(--font-display)" }}>{fmt(e.vencido)}</td>
                      <td className="px-4 py-3" style={{ minWidth: 140 }}>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#2e3939" }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: pct===100?"#10B981":pct>60?"#00ADEB":"#F59E0B" }} />
                          </div>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDrawerEstId(e.id)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                          style={{ background: "#00ADEB15", color: "#00ADEB" }}>
                          <Eye size={11} />Historial
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Tab: PAGOS PENDIENTES ── */}
      {activeTab === "pendientes" && (
        <>
          {/* Pending KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"Monto total pendiente",    value: fmt(pendKpis.montoTotal),   color:"#F59E0B", icon:Clock,         sub:"incluye vencidos y parciales" },
              { label:"Monto vencido",            value: fmt(pendKpis.montoVencido), color:"#EF4444", icon:AlertTriangle, sub:`${ALL_PAGOS.filter(p=>p.estado==="vencido").length} pagos sin recibir` },
              { label:"Estudiantes con saldo",    value: String(pendKpis.estudiantes), color:"#00ADEB", icon:Users,       sub:"con al menos un pago pendiente" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border p-5 flex items-center gap-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${k.color}18` }}>
                  <k.icon size={20} style={{ color: k.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: k.color, fontFamily: "var(--font-display)" }}>{k.value}</p>
                  <p className="text-xs text-white font-medium mt-1" style={{ fontFamily: "var(--font-display)" }}>{k.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{k.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <FilterBar showConcepto={false} />

          <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
                  {["Estudiante","Concepto","Fecha","Monto","Saldo pendiente","Estado",""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagosPendientes.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-14 text-center">
                    <CheckCircle size={36} className="mx-auto mb-3 text-[#10B981]" />
                    <p className="text-sm text-gray-400">Sin pagos pendientes</p>
                  </td></tr>
                ) : pagosPendientes.map((p) => {
                  const saldo = montoPendiente(p);
                  const overdue = p.estado === "vencido" ? daysOverdue(p.fecha) : 0;
                  return (
                    <tr key={p.id} className="border-b hover:bg-[#2e3939]/30 transition-colors group" style={{ borderColor: "#2e3939" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: p.estado==="vencido" ? "linear-gradient(135deg,#EF4444,#B91C1C)" : "linear-gradient(135deg,#F59E0B,#D97706)" }}>
                            {p.estudianteNombre.split(" ").slice(0,2).map((x)=>x[0]).join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{p.estudianteNombre}</p>
                            <p className="text-[10px] text-gray-500">{p.grado} · Sec. {p.seccion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-300">
                          <ConceptoIcon concepto={p.concepto} />{p.concepto}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDate(p.fecha)}</td>
                      <td className="px-4 py-3 font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{fmt(p.monto)}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold" style={{ color: p.estado==="vencido"?"#EF4444":"#F59E0B", fontFamily: "var(--font-display)" }}>{fmt(saldo)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <StatusBadge estado={p.estado} />
                          {overdue > 0 && <p className="text-[10px] text-[#EF4444] ml-1">{overdue} días vencido</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDrawerEstId(p.estudianteId)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#00ADEB]/10 text-gray-500 hover:text-[#00ADEB] transition-all">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pagosPendientes.length > 0 && (
              <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: "#2e3939" }}>
                <p className="text-xs text-gray-500">{pagosPendientes.length} registros pendientes</p>
                <div className="flex items-center gap-3">
                  {Object.entries(STATUS_COLORS).filter(([k])=>k!=="pagado").map(([k,v]) => {
                    const count = pagosPendientes.filter(p=>p.estado===k).length;
                    if (!count) return null;
                    return (
                      <span key={k} className="flex items-center gap-1 text-[11px]" style={{ color: v.text }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: v.dot }} />{v.label} ({count})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Drawer */}
      {drawerEstId !== null && (
        <EstudianteDrawer estudianteId={drawerEstId} onClose={() => setDrawerEstId(null)} />
      )}
    </div>
  );
}
