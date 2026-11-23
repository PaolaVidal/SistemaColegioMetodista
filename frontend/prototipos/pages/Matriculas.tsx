import { useState } from "react";
import {
  Search, Filter, Plus, Eye, Pencil, X, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, GraduationCap, Users, Calendar,
  ClipboardList, ChevronRight as Arrow, User, Layers, BookOpen,
  AlertTriangle, Check, RotateCcw, FileText, Hash,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type MatriculaEstado = "Activa" | "Finalizada" | "Anulada" | "Pendiente";

interface Matricula {
  id: number;
  codigo: string;
  estudianteId: number;
  estudianteNombre: string;
  estudianteCodigo: string;
  ciclo: string;
  grado: string;
  seccion: string;
  fechaMatricula: string;
  estado: MatriculaEstado;
  observaciones: string;
  registradoPor: string;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const CICLOS = ["Año Escolar 2026", "Año Escolar 2025", "Año Escolar 2024"];
const GRADOS = ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado", "6° Grado"];
const SECCIONES_POR_GRADO: Record<string, { seccion: string; cupos: number; ocupados: number; docente: string }[]> = {
  "1° Grado": [
    { seccion: "A", cupos: 35, ocupados: 32, docente: "Lic. Rosa Chávez" },
    { seccion: "B", cupos: 35, ocupados: 30, docente: "Lic. Jorge Medina" },
  ],
  "2° Grado": [
    { seccion: "A", cupos: 35, ocupados: 28, docente: "Lic. María Soto" },
    { seccion: "B", cupos: 35, ocupados: 31, docente: "Lic. Carlos Ríos" },
  ],
  "3° Grado": [
    { seccion: "A", cupos: 35, ocupados: 27, docente: "Lic. Ana Torres" },
    { seccion: "B", cupos: 35, ocupados: 29, docente: "Lic. Pedro Luna" },
  ],
  "4° Grado": [
    { seccion: "A", cupos: 35, ocupados: 29, docente: "Lic. Sandra Vega" },
    { seccion: "B", cupos: 35, ocupados: 26, docente: "Lic. Roberto Puma" },
  ],
  "5° Grado": [
    { seccion: "A", cupos: 35, ocupados: 33, docente: "Lic. Verónica Cruz" },
  ],
  "6° Grado": [
    { seccion: "A", cupos: 35, ocupados: 18, docente: "Lic. Jorge Medina" },
  ],
};

const ESTUDIANTES_SEED = [
  { id: 1, codigo: "EST-00001", nombre: "Lucía Fernanda Paredes Vega",    grado: "3° Grado", seccion: "A", estado: "Activo" },
  { id: 2, codigo: "EST-00002", nombre: "Diego Alejandro Mamani Quispe",  grado: "3° Grado", seccion: "A", estado: "Activo" },
  { id: 3, codigo: "EST-00003", nombre: "Valentina Quispe Huanca",         grado: "1° Grado", seccion: "B", estado: "Activo" },
  { id: 4, codigo: "EST-00004", nombre: "Sebastián Rodrigo Torres Cáceres",grado: "5° Grado", seccion: "A", estado: "Activo" },
  { id: 5, codigo: "EST-00005", nombre: "Camila Andrea Herrera Taipe",     grado: "1° Grado", seccion: "A", estado: "Activo" },
  { id: 6, codigo: "EST-00006", nombre: "Andrés Felipe Cáceres Puma",      grado: "6° Grado", seccion: "A", estado: "Activo" },
  { id: 7, codigo: "EST-00007", nombre: "Ana Sofía Torres León",            grado: "2° Grado", seccion: "A", estado: "Inactivo" },
  { id: 8, codigo: "EST-00008", nombre: "Ricardo Alonso Soto Aliaga",       grado: "4° Grado", seccion: "A", estado: "Activo" },
  { id: 9, codigo: "EST-00009", nombre: "Mariana Isabel Flores Chávez",     grado: "2° Grado", seccion: "B", estado: "Activo" },
  { id: 10, codigo: "EST-00010", nombre: "Pablo Ernesto Vargas Medina",     grado: "4° Grado", seccion: "B", estado: "Retirado" },
  { id: 11, codigo: "EST-00011", nombre: "Sofía Valentina Cruz Apaza",      grado: "1° Grado", seccion: "A", estado: "Activo" },
  { id: 12, codigo: "EST-00012", nombre: "Mateo Joaquín Ramos Salinas",     grado: "3° Grado", seccion: "B", estado: "Activo" },
];

const initMatriculas: Matricula[] = [
  { id: 1,  codigo: "MAT-2026-001", estudianteId: 1,  estudianteNombre: "Lucía Fernanda Paredes Vega",     estudianteCodigo: "EST-00001", ciclo: "Año Escolar 2026", grado: "3° Grado", seccion: "A", fechaMatricula: "2026-02-20", estado: "Activa",    observaciones: "",                        registradoPor: "Admin Principal" },
  { id: 2,  codigo: "MAT-2026-002", estudianteId: 2,  estudianteNombre: "Diego Alejandro Mamani Quispe",   estudianteCodigo: "EST-00002", ciclo: "Año Escolar 2026", grado: "3° Grado", seccion: "A", fechaMatricula: "2026-02-20", estado: "Activa",    observaciones: "Repite grado",            registradoPor: "Admin Principal" },
  { id: 3,  codigo: "MAT-2026-003", estudianteId: 3,  estudianteNombre: "Valentina Quispe Huanca",          estudianteCodigo: "EST-00003", ciclo: "Año Escolar 2026", grado: "1° Grado", seccion: "B", fechaMatricula: "2026-02-21", estado: "Activa",    observaciones: "",                        registradoPor: "Lic. Lucía Paredes" },
  { id: 4,  codigo: "MAT-2026-004", estudianteId: 4,  estudianteNombre: "Sebastián Rodrigo Torres Cáceres", estudianteCodigo: "EST-00004", ciclo: "Año Escolar 2026", grado: "5° Grado", seccion: "A", fechaMatricula: "2026-02-21", estado: "Activa",    observaciones: "",                        registradoPor: "Admin Principal" },
  { id: 5,  codigo: "MAT-2026-005", estudianteId: 5,  estudianteNombre: "Camila Andrea Herrera Taipe",      estudianteCodigo: "EST-00005", ciclo: "Año Escolar 2026", grado: "1° Grado", seccion: "A", fechaMatricula: "2026-02-22", estado: "Activa",    observaciones: "Discapacidad auditiva leve", registradoPor: "Admin Principal" },
  { id: 6,  codigo: "MAT-2026-006", estudianteId: 6,  estudianteNombre: "Andrés Felipe Cáceres Puma",       estudianteCodigo: "EST-00006", ciclo: "Año Escolar 2026", grado: "6° Grado", seccion: "A", fechaMatricula: "2026-02-22", estado: "Activa",    observaciones: "",                        registradoPor: "Admin Principal" },
  { id: 7,  codigo: "MAT-2026-007", estudianteId: 7,  estudianteNombre: "Ana Sofía Torres León",             estudianteCodigo: "EST-00007", ciclo: "Año Escolar 2026", grado: "2° Grado", seccion: "A", fechaMatricula: "2026-02-23", estado: "Anulada",   observaciones: "Estudiante se trasladó a otra institución", registradoPor: "Admin Principal" },
  { id: 8,  codigo: "MAT-2026-008", estudianteId: 8,  estudianteNombre: "Ricardo Alonso Soto Aliaga",        estudianteCodigo: "EST-00008", ciclo: "Año Escolar 2026", grado: "4° Grado", seccion: "A", fechaMatricula: "2026-02-24", estado: "Activa",    observaciones: "Diabetes tipo 1 — requiere atención especial", registradoPor: "Lic. Lucía Paredes" },
  { id: 9,  codigo: "MAT-2026-009", estudianteId: 9,  estudianteNombre: "Mariana Isabel Flores Chávez",      estudianteCodigo: "EST-00009", ciclo: "Año Escolar 2026", grado: "2° Grado", seccion: "B", fechaMatricula: "2026-02-24", estado: "Activa",    observaciones: "",                        registradoPor: "Admin Principal" },
  { id: 10, codigo: "MAT-2026-010", estudianteId: 10, estudianteNombre: "Pablo Ernesto Vargas Medina",       estudianteCodigo: "EST-00010", ciclo: "Año Escolar 2026", grado: "4° Grado", seccion: "B", fechaMatricula: "2026-02-25", estado: "Anulada",   observaciones: "Retiro voluntario por cambio de residencia", registradoPor: "Admin Principal" },
  { id: 11, codigo: "MAT-2026-011", estudianteId: 11, estudianteNombre: "Sofía Valentina Cruz Apaza",        estudianteCodigo: "EST-00011", ciclo: "Año Escolar 2026", grado: "1° Grado", seccion: "A", fechaMatricula: "2026-02-25", estado: "Activa",    observaciones: "",                        registradoPor: "Admin Principal" },
  { id: 12, codigo: "MAT-2026-012", estudianteId: 12, estudianteNombre: "Mateo Joaquín Ramos Salinas",       estudianteCodigo: "EST-00012", ciclo: "Año Escolar 2026", grado: "3° Grado", seccion: "B", fechaMatricula: "2026-02-26", estado: "Activa",    observaciones: "Alergia a ibuprofeno",    registradoPor: "Admin Principal" },
  // 2025 historical
  { id: 13, codigo: "MAT-2025-001", estudianteId: 1,  estudianteNombre: "Lucía Fernanda Paredes Vega",     estudianteCodigo: "EST-00001", ciclo: "Año Escolar 2025", grado: "2° Grado", seccion: "A", fechaMatricula: "2025-02-18", estado: "Finalizada", observaciones: "", registradoPor: "Admin Principal" },
  { id: 14, codigo: "MAT-2025-002", estudianteId: 4,  estudianteNombre: "Sebastián Rodrigo Torres Cáceres", estudianteCodigo: "EST-00004", ciclo: "Año Escolar 2025", grado: "4° Grado", seccion: "A", fechaMatricula: "2025-02-18", estado: "Finalizada", observaciones: "", registradoPor: "Admin Principal" },
];

// ── Shared UI ─────────────────────────────────────────────────────────────────

const estadoConf: Record<MatriculaEstado, { color: string; bg: string; icon: React.ReactNode }> = {
  Activa:     { color: "#10B981", bg: "#10B98120", icon: <CheckCircle size={10} /> },
  Finalizada: { color: "#9CA3AF", bg: "#6B728020", icon: <Check size={10} /> },
  Anulada:    { color: "#EF4444", bg: "#EF444420", icon: <XCircle size={10} /> },
  Pendiente:  { color: "#F59E0B", bg: "#F59E0B20", icon: <Clock size={10} /> },
};

function StatusBadge({ estado }: { estado: MatriculaEstado }) {
  const c = estadoConf[estado];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: c.bg, color: c.color }}>
      {c.icon}{estado}
    </span>
  );
}

const fi = "w-full bg-[#263030] border border-[#2e3939] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#00ADEB] transition-colors placeholder-gray-600";

// ── Detail modal ──────────────────────────────────────────────────────────────

function DetailModal({ mat, onClose, onEdit }: {
  mat: Matricula; onClose: () => void; onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: "#1F2525", borderColor: "#2e3939" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#2e3939" }}>
          <div>
            <h2 className="text-white font-bold" style={{ fontFamily: "var(--font-display)" }}>Detalle de matrícula</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{mat.codigo}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-[#2e3939] text-gray-300"
              style={{ borderColor: "#2e3939", fontFamily: "var(--font-display)" }}>
              <Pencil size={12} />Editar
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-0">
          {[
            ["Estudiante", mat.estudianteNombre],
            ["Código estudiante", mat.estudianteCodigo],
            ["Ciclo académico", mat.ciclo],
            ["Grado", mat.grado],
            ["Sección", `Sección ${mat.seccion}`],
            ["Fecha de matrícula", new Date(mat.fechaMatricula).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })],
            ["Estado", <StatusBadge estado={mat.estado} />],
            ["Registrado por", mat.registradoPor],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between items-center py-3 border-b last:border-b-0"
              style={{ borderColor: "#2e3939" }}>
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-xs text-white font-medium">{value}</span>
            </div>
          ))}
          {mat.observaciones && (
            <div className="pt-3 mt-1">
              <p className="text-xs text-gray-500 mb-1.5">Observaciones</p>
              <p className="text-xs text-gray-300 leading-relaxed p-3 rounded-lg"
                style={{ background: "#263030", border: "1px solid #2e3939" }}>
                {mat.observaciones}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditModal({ mat, onClose, onSave }: {
  mat: Matricula; onClose: () => void;
  onSave: (obs: string, estado: MatriculaEstado) => void;
}) {
  const [obs, setObs] = useState(mat.observaciones);
  const [estado, setEstado] = useState<MatriculaEstado>(mat.estado);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: "#1F2525", borderColor: "#2e3939" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#2e3939" }}>
          <div>
            <h2 className="text-white font-bold" style={{ fontFamily: "var(--font-display)" }}>Editar matrícula</h2>
            <p className="text-xs text-gray-500 mt-0.5">{mat.estudianteNombre}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="p-3 rounded-xl border" style={{ background: "#263030", borderColor: "#2e3939" }}>
            {[["Ciclo", mat.ciclo], ["Grado", mat.grado], ["Sección", `Sección ${mat.seccion}`]].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2 border-b last:border-b-0 text-xs" style={{ borderColor: "#2e3939" }}>
                <span className="text-gray-500">{l}</span>
                <span className="text-gray-400 italic">No editable</span>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1.5" style={{ fontFamily: "var(--font-display)" }}>Estado</label>
            <div className="grid grid-cols-2 gap-2">
              {(["Activa", "Finalizada", "Anulada", "Pendiente"] as MatriculaEstado[]).map((s) => {
                const c = estadoConf[s];
                return (
                  <button key={s} onClick={() => setEstado(s)}
                    className="py-2 rounded-lg text-xs font-medium border transition-all"
                    style={{
                      background: estado === s ? c.bg : "#263030",
                      borderColor: estado === s ? c.color : "#2e3939",
                      color: estado === s ? c.color : "#6B7280",
                      fontFamily: "var(--font-display)",
                    }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1.5" style={{ fontFamily: "var(--font-display)" }}>Observaciones</label>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={3}
              className="w-full bg-[#263030] border border-[#2e3939] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#00ADEB] transition-colors resize-none placeholder-gray-600"
              placeholder="Observaciones sobre la matrícula..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "#2e3939" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}>Cancelar</button>
          <button onClick={() => onSave(obs, estado)}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Wizard ────────────────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface WizardData {
  estudiante: typeof ESTUDIANTES_SEED[0] | null;
  ciclo: string;
  grado: string;
  seccion: string;
  observaciones: string;
}

function StepDot({ n, current, label }: { n: number; current: number; label: string }) {
  const done = n < current;
  const active = n === current;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all`}
        style={{
          background: done ? "#00ADEB" : active ? "#00ADEB18" : "#263030",
          borderColor: done || active ? "#00ADEB" : "#2e3939",
          color: done ? "#fff" : active ? "#00ADEB" : "#6B7280",
          fontFamily: "var(--font-display)",
        }}>
        {done ? <Check size={14} /> : n}
      </div>
      <span className="text-[10px] font-medium whitespace-nowrap"
        style={{ color: active ? "#00ADEB" : done ? "#6B7280" : "#4B5563", fontFamily: "var(--font-display)" }}>
        {label}
      </span>
    </div>
  );
}

function WizardConnector({ done }: { done: boolean }) {
  return (
    <div className="flex-1 h-0.5 mb-4 rounded-full transition-all"
      style={{ background: done ? "#00ADEB" : "#2e3939" }} />
  );
}

function ValidationWarning({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg text-xs" style={{ background: "#F59E0B15", border: "1px solid #F59E0B40", color: "#F59E0B" }}>
      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />{msg}
    </div>
  );
}

function Wizard({ onClose, onConfirm }: {
  onClose: () => void;
  onConfirm: (data: WizardData) => void;
}) {
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<WizardData>({ estudiante: null, ciclo: "", grado: "", seccion: "", observaciones: "" });
  const [searchEst, setSearchEst] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  const filteredEst = ESTUDIANTES_SEED.filter((e) => {
    const q = searchEst.toLowerCase();
    return !q || e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q);
  });

  function validate(): string[] {
    const w: string[] = [];
    if (!data.estudiante) return w;
    if (data.estudiante.estado === "Inactivo") w.push("El estudiante está marcado como Inactivo. Verifique su estado antes de matricular.");
    if (data.estudiante.estado === "Retirado") w.push("El estudiante tiene estado Retirado. No se recomienda matricular sin actualizar su estado.");
    const seccInfo = SECCIONES_POR_GRADO[data.grado]?.find((s) => s.seccion === data.seccion);
    if (seccInfo && seccInfo.ocupados >= seccInfo.cupos) w.push("La sección seleccionada no tiene cupos disponibles.");
    if (data.estudiante.grado === data.grado && data.ciclo === "Año Escolar 2026") w.push("El estudiante ya está asignado a este grado en el ciclo 2026. Verifique si ya posee una matrícula activa.");
    return w;
  }

  function nextStep() {
    if (step === 4) {
      const w = validate();
      setWarnings(w);
    }
    setStep((s) => (s + 1) as WizardStep);
  }

  function canProceed(): boolean {
    if (step === 1) return !!data.estudiante;
    if (step === 2) return !!data.ciclo;
    if (step === 3) return !!data.grado;
    if (step === 4) return !!data.seccion;
    return true;
  }

  const seccInfo = data.grado ? SECCIONES_POR_GRADO[data.grado] ?? [] : [];
  const selSecInfo = seccInfo.find((s) => s.seccion === data.seccion);

  const steps = ["Estudiante", "Ciclo", "Grado", "Sección", "Confirmación"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: "#1F2525", borderColor: "#2e3939" }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-0 border-b" style={{ borderColor: "#2e3939" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>Registrar matrícula</h2>
              <p className="text-xs text-gray-500 mt-0.5">Paso {step} de 5</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 pb-5">
            {steps.map((label, i) => (
              <>
                <StepDot key={label} n={i + 1} current={step} label={label} />
                {i < steps.length - 1 && <WizardConnector key={`c-${i}`} done={step > i + 1} />}
              </>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 min-h-72 max-h-[55vh] overflow-y-auto space-y-3">

          {/* Step 1: Estudiante */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">Selecciona el estudiante a matricular.</p>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#263030", border: "1px solid #2e3939" }}>
                <Search size={13} className="text-gray-500" />
                <input className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-full"
                  placeholder="Buscar por nombre o código..." value={searchEst}
                  onChange={(e) => setSearchEst(e.target.value)} autoFocus />
                {searchEst && <button onClick={() => setSearchEst("")}><X size={12} className="text-gray-500" /></button>}
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {filteredEst.map((e) => {
                  const sel = data.estudiante?.id === e.id;
                  const estColor = e.estado === "Activo" ? "#10B981" : e.estado === "Inactivo" ? "#F59E0B" : "#EF4444";
                  return (
                    <button key={e.id} onClick={() => setData({ ...data, estudiante: e })}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                      style={{
                        background: sel ? "#00ADEB18" : "#263030",
                        borderColor: sel ? "#00ADEB" : "#2e3939",
                      }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: sel ? "#00ADEB" : "#107A9F" }}>
                        {e.nombre.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "var(--font-display)" }}>{e.nombre}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{e.codigo} · {e.grado} — Sección {e.seccion}</p>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${estColor}20`, color: estColor }}>
                        {e.estado}
                      </span>
                      {sel && <Check size={14} className="text-[#00ADEB] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Ciclo */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">Selecciona el ciclo académico para esta matrícula.</p>
              <div className="space-y-2">
                {CICLOS.map((c) => {
                  const sel = data.ciclo === c;
                  const tag = c.includes("2026") ? { label: "Activo", color: "#10B981" } : { label: "Histórico", color: "#6B7280" };
                  return (
                    <button key={c} onClick={() => setData({ ...data, ciclo: c })}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border text-left transition-all"
                      style={{ background: sel ? "#00ADEB18" : "#263030", borderColor: sel ? "#00ADEB" : "#2e3939" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                        style={{ background: sel ? "#00ADEB" : "#2e3939", color: "#fff", fontFamily: "var(--font-display)" }}>
                        {c.slice(-4)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{c}</p>
                        <span className="text-[11px]" style={{ color: tag.color }}>{tag.label}</span>
                      </div>
                      {sel && <Check size={14} className="text-[#00ADEB] ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Grado */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">Selecciona el grado al que se matriculará el estudiante.</p>
              {data.estudiante && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-xs"
                  style={{ background: "#00ADEB12", border: "1px solid #00ADEB30", color: "#00ADEB" }}>
                  <User size={12} />
                  Grado actual del estudiante: <strong>{data.estudiante.grado}</strong>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {GRADOS.map((g) => {
                  const sel = data.grado === g;
                  const seccs = SECCIONES_POR_GRADO[g] ?? [];
                  const totalCupos = seccs.reduce((a, s) => a + s.cupos - s.ocupados, 0);
                  return (
                    <button key={g} onClick={() => setData({ ...data, grado: g, seccion: "" })}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                      style={{ background: sel ? "#00ADEB18" : "#263030", borderColor: sel ? "#00ADEB" : "#2e3939" }}>
                      <GraduationCap size={16} style={{ color: sel ? "#00ADEB" : "#6B7280" }} />
                      <div>
                        <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{g}</p>
                        <p className="text-[11px]" style={{ color: totalCupos > 0 ? "#10B981" : "#EF4444" }}>
                          {totalCupos > 0 ? `${totalCupos} cupos disponibles` : "Sin cupos"}
                        </p>
                      </div>
                      {sel && <Check size={14} className="text-[#00ADEB] ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Sección */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">Selecciona la sección para el estudiante.</p>
              <div className="space-y-2">
                {seccInfo.map((s) => {
                  const sel = data.seccion === s.seccion;
                  const libre = s.cupos - s.ocupados;
                  const pct = (s.ocupados / s.cupos) * 100;
                  const barColor = pct >= 95 ? "#EF4444" : pct >= 80 ? "#F59E0B" : "#10B981";
                  return (
                    <button key={s.seccion} onClick={() => libre > 0 && setData({ ...data, seccion: s.seccion })}
                      disabled={libre === 0}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: sel ? "#00ADEB18" : "#263030", borderColor: sel ? "#00ADEB" : "#2e3939" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: sel ? "#00ADEB" : "linear-gradient(135deg,#107A9F,#1F2525)", fontFamily: "var(--font-display)" }}>
                        {s.seccion}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Sección {s.seccion}</p>
                          <span className="text-xs text-gray-400">{s.ocupados}/{s.cupos} estudiantes</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-1.5">Tutora: {s.docente}</p>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "#2e3939" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: barColor, fontFamily: "var(--font-display)" }}>{libre}</p>
                        <p className="text-[10px] text-gray-500">cupos</p>
                      </div>
                      {sel && <Check size={14} className="text-[#00ADEB]" />}
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1.5" style={{ fontFamily: "var(--font-display)" }}>Observaciones (opcional)</label>
                <textarea value={data.observaciones} onChange={(e) => setData({ ...data, observaciones: e.target.value })}
                  rows={2} placeholder="Condiciones especiales, notas médicas relevantes..."
                  className="w-full bg-[#263030] border border-[#2e3939] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#00ADEB] transition-colors resize-none placeholder-gray-600" />
              </div>
            </div>
          )}

          {/* Step 5: Confirmación */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">Revisa la información antes de confirmar la matrícula.</p>

              {warnings.length > 0 && (
                <div className="space-y-2">
                  {warnings.map((w, i) => <ValidationWarning key={i} msg={w} />)}
                </div>
              )}

              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#2e3939" }}>
                {/* Student card */}
                <div className="p-4 flex items-center gap-3" style={{ background: "#263030", borderBottom: "1px solid #2e3939" }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>
                    {data.estudiante?.nombre.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{data.estudiante?.nombre}</p>
                    <p className="text-[11px] font-mono text-gray-500">{data.estudiante?.codigo}</p>
                  </div>
                </div>

                {/* Summary rows */}
                {[
                  { icon: <Calendar size={13} />, label: "Ciclo", value: data.ciclo },
                  { icon: <GraduationCap size={13} />, label: "Grado", value: data.grado },
                  { icon: <Layers size={13} />, label: "Sección", value: `Sección ${data.seccion} — ${selSecInfo?.docente ?? ""}` },
                  { icon: <Calendar size={13} />, label: "Fecha de matrícula", value: new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" }) },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                    style={{ background: "#1F2525", borderColor: "#2e3939" }}>
                    <span className="text-[#00ADEB]">{row.icon}</span>
                    <span className="text-xs text-gray-500 w-32 flex-shrink-0">{row.label}</span>
                    <span className="text-xs text-white font-medium">{row.value}</span>
                  </div>
                ))}
                {data.observaciones && (
                  <div className="flex items-start gap-3 px-4 py-3" style={{ background: "#1F2525" }}>
                    <FileText size={13} className="text-[#00ADEB] mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-500 w-32 flex-shrink-0">Observaciones</span>
                    <span className="text-xs text-gray-300">{data.observaciones}</span>
                  </div>
                )}
              </div>

              {warnings.length === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-xs"
                  style={{ background: "#10B98115", border: "1px solid #10B98140", color: "#10B981" }}>
                  <Check size={13} />Toda la información es válida. Puedes confirmar la matrícula.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "#2e3939" }}>
          <button onClick={step === 1 ? onClose : () => setStep((s) => (s - 1) as WizardStep)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}>
            <ChevronLeft size={14} />{step === 1 ? "Cancelar" : "Anterior"}
          </button>
          {step < 5 ? (
            <button onClick={nextStep} disabled={!canProceed()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
              Siguiente <Arrow size={14} />
            </button>
          ) : (
            <button onClick={() => onConfirm(data)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: warnings.length > 0 ? "#F59E0B" : "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
              {warnings.length > 0 ? <><AlertTriangle size={13} />Confirmar con advertencias</> : <><Check size={13} />Confirmar matrícula</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const ROWS = 10;

export default function Matriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>(initMatriculas);
  const [search, setSearch] = useState("");
  const [filterCiclo, setFilterCiclo] = useState("");
  const [filterGrado, setFilterGrado] = useState("");
  const [filterSeccion, setFilterSeccion] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [page, setPage] = useState(1);
  const [wizard, setWizard] = useState(false);
  const [detail, setDetail] = useState<Matricula | null>(null);
  const [editing, setEditing] = useState<Matricula | null>(null);

  const filtered = matriculas.filter((m) => {
    const q = search.toLowerCase();
    const matchQ = !q || m.estudianteNombre.toLowerCase().includes(q) || m.estudianteCodigo.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q);
    return matchQ &&
      (!filterCiclo   || m.ciclo === filterCiclo) &&
      (!filterGrado   || m.grado === filterGrado) &&
      (!filterSeccion || m.seccion === filterSeccion) &&
      (!filterEstado  || m.estado === filterEstado);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage - 1) * ROWS, curPage * ROWS);

  function handleConfirm(data: WizardData) {
    const nextId = Math.max(0, ...matriculas.map((m) => m.id)) + 1;
    const cicloYear = data.ciclo.slice(-4);
    const codigo = `MAT-${cicloYear}-${String(nextId).padStart(3, "0")}`;
    const nueva: Matricula = {
      id: nextId, codigo,
      estudianteId: data.estudiante!.id,
      estudianteNombre: data.estudiante!.nombre,
      estudianteCodigo: data.estudiante!.codigo,
      ciclo: data.ciclo, grado: data.grado, seccion: data.seccion,
      fechaMatricula: new Date().toISOString().slice(0, 10),
      estado: "Activa",
      observaciones: data.observaciones,
      registradoPor: "Admin Principal",
    };
    setMatriculas((p) => [nueva, ...p]);
    setWizard(false);
  }

  function handleEdit(obs: string, estado: MatriculaEstado) {
    if (!editing) return;
    setMatriculas((p) => p.map((m) => m.id === editing.id ? { ...m, observaciones: obs, estado } : m));
    setEditing(null);
  }

  const stats = {
    total: matriculas.length,
    activas: matriculas.filter((m) => m.estado === "Activa").length,
    finalizadas: matriculas.filter((m) => m.estado === "Finalizada").length,
    anuladas: matriculas.filter((m) => m.estado === "Anulada").length,
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total matrículas", value: stats.total,      color: "#00ADEB", icon: ClipboardList },
          { label: "Activas",           value: stats.activas,    color: "#10B981", icon: CheckCircle },
          { label: "Finalizadas",       value: stats.finalizadas,color: "#9CA3AF", icon: Check },
          { label: "Anuladas",          value: stats.anuladas,   color: "#EF4444", icon: XCircle },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4 flex items-center gap-3"
            style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
              <p className="text-[11px] text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-52 rounded-lg px-3 py-2"
            style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Search size={13} className="text-gray-500 flex-shrink-0" />
            <input placeholder="Buscar por estudiante o código de matrícula..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-full" />
            {search && <button onClick={() => setSearch("")}><X size={12} className="text-gray-500" /></button>}
          </div>

          {/* Ciclo */}
          <Sel icon={<Calendar size={12} />} value={filterCiclo} onChange={(v) => { setFilterCiclo(v); setPage(1); }}
            placeholder="Ciclo" options={CICLOS} />
          {/* Grado */}
          <Sel icon={<GraduationCap size={12} />} value={filterGrado} onChange={(v) => { setFilterGrado(v); setPage(1); }}
            placeholder="Grado" options={GRADOS} />
          {/* Sección */}
          <Sel icon={<Layers size={12} />} value={filterSeccion} onChange={(v) => { setFilterSeccion(v); setPage(1); }}
            placeholder="Sección" options={["A", "B", "C"]} labelFn={(s) => `Sección ${s}`} />
          {/* Estado */}
          <Sel icon={<Filter size={12} />} value={filterEstado} onChange={(v) => { setFilterEstado(v); setPage(1); }}
            placeholder="Estado" options={["Activa", "Finalizada", "Anulada", "Pendiente"]} />

          {(search || filterCiclo || filterGrado || filterSeccion || filterEstado) && (
            <button onClick={() => { setSearch(""); setFilterCiclo(""); setFilterGrado(""); setFilterSeccion(""); setFilterEstado(""); setPage(1); }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2">
              <RotateCcw size={11} />Limpiar
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
            <button onClick={() => setWizard(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
              <Plus size={14} />Registrar matrícula
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
              {["Código", "Estudiante", "Ciclo", "Grado", "Sección", "Fecha de matrícula", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                  style={{ fontFamily: "var(--font-display)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <ClipboardList size={36} className="mx-auto mb-3 text-gray-700" />
                  <p className="text-sm text-gray-500">No se encontraron matrículas</p>
                  <p className="text-xs text-gray-600 mt-1">Intenta con otros filtros o registra una nueva matrícula</p>
                </td>
              </tr>
            ) : pageRows.map((m, idx) => (
              <tr key={m.id} className="border-b transition-colors hover:bg-[#2e3939]/50 group"
                style={{ borderColor: "#2e3939", opacity: m.estado === "Anulada" ? 0.55 : 1 }}>
                <td className="px-4 py-3">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded" style={{ background: "#2e3939", color: "#9CA3AF" }}>
                    {m.codigo}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: idx % 2 === 0 ? "#107A9F" : "#00ADEB" }}>
                      {m.estudianteNombre.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-white whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>
                        {m.estudianteNombre}
                      </p>
                      <p className="text-[10px] font-mono text-gray-500">{m.estudianteCodigo}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{m.ciclo.replace("Año Escolar ", "")}</td>
                <td className="px-4 py-3 text-gray-200 whitespace-nowrap">{m.grado}</td>
                <td className="px-4 py-3">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                    style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>
                    {m.seccion}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {new Date(m.fechaMatricula).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3"><StatusBadge estado={m.estado} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setDetail(m)} title="Ver detalle"
                      className="p-1.5 rounded-lg hover:bg-[#00ADEB]/10 text-gray-400 hover:text-[#00ADEB] transition-colors">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => setEditing(m)} title="Editar"
                      className="p-1.5 rounded-lg hover:bg-[#F59E0B]/10 text-gray-400 hover:text-[#F59E0B] transition-colors">
                      <Pencil size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#2e3939" }}>
          <p className="text-xs text-gray-500">
            {filtered.length === 0 ? "0 resultados" :
              `Mostrando ${(curPage - 1) * ROWS + 1}–${Math.min(curPage * ROWS, filtered.length)} de ${filtered.length}`}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={curPage === 1}
              className="p-1.5 rounded-lg disabled:opacity-30 text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                style={{ background: p === curPage ? "#00ADEB" : "transparent", color: p === curPage ? "#fff" : "#9CA3AF", fontFamily: "var(--font-display)" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={curPage === totalPages}
              className="p-1.5 rounded-lg disabled:opacity-30 text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {wizard && <Wizard onClose={() => setWizard(false)} onConfirm={handleConfirm} />}
      {detail && !editing && <DetailModal mat={detail} onClose={() => setDetail(null)} onEdit={() => { setEditing(detail); setDetail(null); }} />}
      {editing && <EditModal mat={editing} onClose={() => setEditing(null)} onSave={handleEdit} />}
    </div>
  );
}

function Sel({ icon, value, onChange, placeholder, options, labelFn }: {
  icon: React.ReactNode; value: string; onChange: (v: string) => void;
  placeholder: string; options: string[]; labelFn?: (s: string) => string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
      <span className="text-gray-500">{icon}</span>
      <select className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer"
        value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" style={{ background: "#1F2525" }}>{placeholder}</option>
        {options.map((o) => <option key={o} value={o} style={{ background: "#1F2525" }}>{labelFn ? labelFn(o) : o}</option>)}
      </select>
    </div>
  );
}
