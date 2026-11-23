import { useState } from "react";
import {
  Plus, Pencil, X, CheckCircle, XCircle, ChevronRight,
  Calendar, BookOpen, Users, Layers, GraduationCap,
  Search, Filter, Eye, ExternalLink, Clock, PlayCircle,
  StopCircle, ToggleLeft, ToggleRight, Hash, User,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type CicloEstado = "Activo" | "Finalizado" | "Planificado";
type CommonEstado = "Activo" | "Inactivo";

interface Ciclo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: CicloEstado;
}

interface Grado {
  id: number;
  nombre: string;
  nivel: string;
  estado: CommonEstado;
  asignaturas: string[];
}

interface Seccion {
  id: number;
  nombre: string;
  gradoId: number;
  cicloId: number;
  docentes: string[];
  totalEstudiantes: number;
  estado: CommonEstado;
}

interface Asignatura {
  id: number;
  nombre: string;
  codigo: string;
  docente: string;
  estado: CommonEstado;
  gradosAsociados: string[];
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const initCiclos: Ciclo[] = [
  { id: 1, nombre: "Año Escolar 2026", fechaInicio: "2026-03-01", fechaFin: "2026-12-20", estado: "Activo" },
  { id: 2, nombre: "Año Escolar 2025", fechaInicio: "2025-03-01", fechaFin: "2025-12-19", estado: "Finalizado" },
  { id: 3, nombre: "Año Escolar 2024", fechaInicio: "2024-03-04", fechaFin: "2024-12-20", estado: "Finalizado" },
  { id: 4, nombre: "Año Escolar 2027 (planificado)", fechaInicio: "2027-03-01", fechaFin: "2027-12-19", estado: "Planificado" },
];

const initGrados: Grado[] = [
  { id: 1, nombre: "1° Grado", nivel: "Primaria", estado: "Activo", asignaturas: ["Matemáticas", "Comunicación", "Ciencias", "Arte"] },
  { id: 2, nombre: "2° Grado", nivel: "Primaria", estado: "Activo", asignaturas: ["Matemáticas", "Comunicación", "Historia", "Ciencias"] },
  { id: 3, nombre: "3° Grado", nivel: "Primaria", estado: "Activo", asignaturas: ["Matemáticas", "Comunicación", "Historia", "Ciencias", "Inglés"] },
  { id: 4, nombre: "4° Grado", nivel: "Primaria", estado: "Activo", asignaturas: ["Matemáticas", "Comunicación", "Historia", "Inglés", "Ed. Física"] },
  { id: 5, nombre: "5° Grado", nivel: "Secundaria", estado: "Activo", asignaturas: ["Matemáticas", "Comunicación", "Historia", "Inglés", "Química", "Física"] },
  { id: 6, nombre: "6° Grado", nivel: "Secundaria", estado: "Inactivo", asignaturas: ["Matemáticas", "Comunicación", "Historia", "Inglés", "Química"] },
];

const initSecciones: Seccion[] = [
  { id: 1, nombre: "A", gradoId: 1, cicloId: 1, docentes: ["Lic. Rosa Chávez"], totalEstudiantes: 32, estado: "Activo" },
  { id: 2, nombre: "B", gradoId: 1, cicloId: 1, docentes: ["Lic. Jorge Medina"], totalEstudiantes: 30, estado: "Activo" },
  { id: 3, nombre: "A", gradoId: 2, cicloId: 1, docentes: ["Lic. María Soto"], totalEstudiantes: 28, estado: "Activo" },
  { id: 4, nombre: "B", gradoId: 2, cicloId: 1, docentes: ["Lic. Carlos Ríos"], totalEstudiantes: 31, estado: "Activo" },
  { id: 5, nombre: "A", gradoId: 3, cicloId: 1, docentes: ["Lic. Ana Torres", "Lic. Pedro Luna"], totalEstudiantes: 27, estado: "Activo" },
  { id: 6, nombre: "A", gradoId: 4, cicloId: 1, docentes: ["Lic. Sandra Vega"], totalEstudiantes: 29, estado: "Activo" },
  { id: 7, nombre: "B", gradoId: 4, cicloId: 1, docentes: ["Lic. Roberto Puma"], totalEstudiantes: 26, estado: "Inactivo" },
  { id: 8, nombre: "A", gradoId: 5, cicloId: 1, docentes: ["Lic. Verónica Cruz"], totalEstudiantes: 33, estado: "Activo" },
];

const initAsignaturas: Asignatura[] = [
  { id: 1, nombre: "Matemáticas", codigo: "MAT-001", docente: "Lic. Carlos Ríos", estado: "Activo", gradosAsociados: ["1°", "2°", "3°", "4°", "5°"] },
  { id: 2, nombre: "Comunicación", codigo: "COM-001", docente: "Lic. María Soto", estado: "Activo", gradosAsociados: ["1°", "2°", "3°", "4°", "5°"] },
  { id: 3, nombre: "Historia y Geografía", codigo: "HIS-001", docente: "Lic. Jorge Medina", estado: "Activo", gradosAsociados: ["2°", "3°", "4°", "5°"] },
  { id: 4, nombre: "Ciencias Naturales", codigo: "CIE-001", docente: "Lic. Rosa Chávez", estado: "Activo", gradosAsociados: ["1°", "2°", "3°"] },
  { id: 5, nombre: "Inglés", codigo: "ING-001", docente: "Lic. Ana Torres", estado: "Activo", gradosAsociados: ["3°", "4°", "5°"] },
  { id: 6, nombre: "Educación Física", codigo: "EDF-001", docente: "Lic. Pedro Luna", estado: "Activo", gradosAsociados: ["1°", "2°", "3°", "4°"] },
  { id: 7, nombre: "Arte y Cultura", codigo: "ART-001", docente: "Lic. Sandra Vega", estado: "Activo", gradosAsociados: ["1°", "2°"] },
  { id: 8, nombre: "Química", codigo: "QUI-001", docente: "Lic. Verónica Cruz", estado: "Activo", gradosAsociados: ["5°", "6°"] },
  { id: 9, nombre: "Física", codigo: "FIS-001", docente: "Lic. Roberto Puma", estado: "Activo", gradosAsociados: ["5°"] },
  { id: 10, nombre: "Formación Ciudadana", codigo: "FOR-001", docente: "Lic. Jorge Medina", estado: "Inactivo", gradosAsociados: [] },
];

// ── Shared UI ─────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4"
      style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}>
      {children}
    </h2>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    "Activo":      { bg: "#10B98120", color: "#10B981", icon: <CheckCircle size={10} /> },
    "Inactivo":    { bg: "#EF444420", color: "#EF4444", icon: <XCircle size={10} /> },
    "Finalizado":  { bg: "#6B728020", color: "#9CA3AF", icon: <StopCircle size={10} /> },
    "Planificado": { bg: "#A78BFA20", color: "#A78BFA", icon: <Clock size={10} /> },
  };
  const conf = map[estado] ?? map["Inactivo"];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: conf.bg, color: conf.color }}>
      {conf.icon}{estado}
    </span>
  );
}

function ActionBtn({ icon, label, color, onClick }: {
  icon: React.ReactNode; label: string; color?: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} title={label}
      className="p-1.5 rounded-lg transition-all hover:scale-110"
      style={{ color: color ?? "#9CA3AF" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${color ?? "#9CA3AF"}18`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      {icon}
    </button>
  );
}

function Modal({ title, subtitle, onClose, onSave, saveLabel, children }: {
  title: string; subtitle?: string; onClose: () => void;
  onSave?: () => void; saveLabel?: string; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden" style={{ background: "#1F2525", borderColor: "#2e3939" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#2e3939" }}>
          <div>
            <h2 className="text-white font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">{children}</div>
        {onSave && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "#2e3939" }}>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}>Cancelar</button>
            <button onClick={onSave}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
              {saveLabel ?? "Guardar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={`space-y-1.5 ${span2 ? "col-span-2" : ""}`}>
      <label className="text-xs font-medium text-gray-400" style={{ fontFamily: "var(--font-display)" }}>{label}</label>
      {children}
    </div>
  );
}

const fi = "w-full bg-[#263030] border border-[#2e3939] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#00ADEB] transition-colors placeholder-gray-600";

// ── Tab: Ciclos ───────────────────────────────────────────────────────────────

function TabCiclos() {
  const [ciclos, setCiclos] = useState<Ciclo[]>(initCiclos);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [sel, setSel] = useState<Ciclo | null>(null);
  const [form, setForm] = useState({ nombre: "", fechaInicio: "", fechaFin: "", estado: "Planificado" as CicloEstado });

  function openCreate() {
    setForm({ nombre: "", fechaInicio: "", fechaFin: "", estado: "Planificado" });
    setSel(null); setModal("create");
  }
  function openEdit(c: Ciclo) {
    setForm({ nombre: c.nombre, fechaInicio: c.fechaInicio, fechaFin: c.fechaFin, estado: c.estado });
    setSel(c); setModal("edit");
  }
  function handleSave() {
    if (!form.nombre.trim()) return;
    if (modal === "create") {
      setCiclos((p) => [...p, { ...form, id: Math.max(0, ...p.map((x) => x.id)) + 1 }]);
    } else if (sel) {
      setCiclos((p) => p.map((x) => x.id === sel.id ? { ...x, ...form } : x));
    }
    setModal(null);
  }
  function changeEstado(id: number, estado: CicloEstado) {
    setCiclos((p) => p.map((x) => x.id === id ? { ...x, estado } : x));
  }

  const estadoColors: Record<CicloEstado, string> = { "Activo": "#00ADEB", "Planificado": "#A78BFA", "Finalizado": "#6B7280" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Ciclos académicos</SectionTitle>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
          <Plus size={14} />Nuevo ciclo
        </button>
      </div>

      <div className="space-y-3">
        {ciclos.map((c) => (
          <div key={c.id} className="rounded-xl border p-4 flex items-center gap-4 transition-all hover:border-[#00ADEB]/30"
            style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${estadoColors[c.estado]}20` }}>
              <Calendar size={18} style={{ color: estadoColors[c.estado] }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{c.nombre}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(c.fechaInicio).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                {" — "}
                {new Date(c.fechaFin).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
            <StatusBadge estado={c.estado} />
            <div className="flex items-center gap-1">
              <ActionBtn icon={<Pencil size={14} />} label="Editar" color="#F59E0B" onClick={() => openEdit(c)} />
              {c.estado === "Planificado" && (
                <ActionBtn icon={<PlayCircle size={14} />} label="Activar" color="#10B981" onClick={() => changeEstado(c.id, "Activo")} />
              )}
              {c.estado === "Activo" && (
                <ActionBtn icon={<StopCircle size={14} />} label="Finalizar" color="#EF4444" onClick={() => changeEstado(c.id, "Finalizado")} />
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === "create" ? "Nuevo ciclo académico" : "Editar ciclo"}
          subtitle="Complete los datos del ciclo escolar"
          onClose={() => setModal(null)} onSave={handleSave}
          saveLabel={modal === "create" ? "Crear ciclo" : "Guardar cambios"}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre del ciclo" span2>
              <input className={fi} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Año Escolar 2027" />
            </Field>
            <Field label="Fecha de inicio">
              <input type="date" className={fi} value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
            </Field>
            <Field label="Fecha de finalización">
              <input type="date" className={fi} value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
            </Field>
            <Field label="Estado" span2>
              <select className={fi} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as CicloEstado })}>
                <option value="Planificado" style={{ background: "#263030" }}>Planificado</option>
                <option value="Activo" style={{ background: "#263030" }}>Activo</option>
                <option value="Finalizado" style={{ background: "#263030" }}>Finalizado</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tab: Grados ───────────────────────────────────────────────────────────────

function TabGrados({ onGoToSeccion }: { onGoToSeccion: (gradoId: number) => void }) {
  const [grados, setGrados] = useState<Grado[]>(initGrados);
  const [modal, setModal] = useState<"create" | "edit" | "asignaturas" | null>(null);
  const [sel, setSel] = useState<Grado | null>(null);
  const [form, setForm] = useState({ nombre: "", nivel: "Primaria", estado: "Activo" as CommonEstado });
  const [asigInput, setAsigInput] = useState("");

  function openCreate() {
    setForm({ nombre: "", nivel: "Primaria", estado: "Activo" });
    setSel(null); setModal("create");
  }
  function openEdit(g: Grado) {
    setForm({ nombre: g.nombre, nivel: g.nivel, estado: g.estado });
    setSel(g); setModal("edit");
  }
  function openAsig(g: Grado) { setSel(g); setAsigInput(""); setModal("asignaturas"); }
  function handleSave() {
    if (!form.nombre.trim()) return;
    if (modal === "create") {
      setGrados((p) => [...p, { ...form, id: Math.max(0, ...p.map((x) => x.id)) + 1, asignaturas: [] }]);
    } else if (sel) {
      setGrados((p) => p.map((x) => x.id === sel.id ? { ...x, ...form } : x));
    }
    setModal(null);
  }
  function addAsig() {
    if (!asigInput.trim() || !sel) return;
    setGrados((p) => p.map((x) => x.id === sel.id ? { ...x, asignaturas: [...x.asignaturas, asigInput.trim()] } : x));
    setSel((s) => s ? { ...s, asignaturas: [...s.asignaturas, asigInput.trim()] } : s);
    setAsigInput("");
  }
  function removeAsig(asig: string) {
    if (!sel) return;
    setGrados((p) => p.map((x) => x.id === sel.id ? { ...x, asignaturas: x.asignaturas.filter((a) => a !== asig) } : x));
    setSel((s) => s ? { ...s, asignaturas: s.asignaturas.filter((a) => a !== asig) } : s);
  }
  function toggle(id: number) {
    setGrados((p) => p.map((x) => x.id === id ? { ...x, estado: x.estado === "Activo" ? "Inactivo" : "Activo" } : x));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Grados</SectionTitle>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
          <Plus size={14} />Nuevo grado
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {grados.map((g) => (
          <div key={g.id} className="rounded-xl border p-4 transition-all hover:border-[#00ADEB]/20"
            style={{ background: "#263030", borderColor: "#2e3939", opacity: g.estado === "Inactivo" ? 0.65 : 1 }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#00ADEB20" }}>
                  <GraduationCap size={16} className="text-[#00ADEB]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{g.nombre}</p>
                  <p className="text-[11px] text-gray-500">{g.nivel}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <StatusBadge estado={g.estado} />
                <ActionBtn icon={<Pencil size={13} />} label="Editar" color="#F59E0B" onClick={() => openEdit(g)} />
                <ActionBtn icon={g.estado === "Activo" ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                  label={g.estado === "Activo" ? "Desactivar" : "Activar"}
                  color={g.estado === "Activo" ? "#EF4444" : "#10B981"}
                  onClick={() => toggle(g.id)} />
              </div>
            </div>

            {/* Asignaturas */}
            <div className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Asignaturas</p>
              <div className="flex flex-wrap gap-1.5">
                {g.asignaturas.slice(0, 5).map((a) => (
                  <span key={a} className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: "#00ADEB15", color: "#00ADEB" }}>{a}</span>
                ))}
                {g.asignaturas.length > 5 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#2e3939] text-gray-400">+{g.asignaturas.length - 5}</span>
                )}
                <button onClick={() => openAsig(g)}
                  className="px-2 py-0.5 rounded-full text-[11px] border border-dashed transition-colors hover:border-[#00ADEB] hover:text-[#00ADEB] text-gray-500"
                  style={{ borderColor: "#2e3939" }}>
                  + Asignar
                </button>
              </div>
            </div>

            {/* Ver secciones */}
            <button onClick={() => onGoToSeccion(g.id)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[#00ADEB] text-gray-400 group">
              <Layers size={13} />
              Ver secciones del grado
              <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nuevo grado" : "Editar grado"}
          onClose={() => setModal(null)} onSave={handleSave}
          saveLabel={modal === "create" ? "Crear grado" : "Guardar"}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre del grado" span2>
              <input className={fi} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: 1° Grado" />
            </Field>
            <Field label="Nivel educativo">
              <select className={fi} value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })}>
                <option style={{ background: "#263030" }}>Inicial</option>
                <option style={{ background: "#263030" }}>Primaria</option>
                <option style={{ background: "#263030" }}>Secundaria</option>
              </select>
            </Field>
            <Field label="Estado">
              <select className={fi} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as CommonEstado })}>
                <option value="Activo" style={{ background: "#263030" }}>Activo</option>
                <option value="Inactivo" style={{ background: "#263030" }}>Inactivo</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}

      {modal === "asignaturas" && sel && (
        <Modal title={`Asignaturas — ${sel.nombre}`} subtitle="Gestiona las materias asociadas a este grado"
          onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input className={`${fi} flex-1`} value={asigInput} onChange={(e) => setAsigInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAsig()}
                placeholder="Nombre de la asignatura..." />
              <button onClick={addAsig}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                style={{ background: "#00ADEB" }}>
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {sel.asignaturas.map((a) => (
                <div key={a} className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: "#263030", border: "1px solid #2e3939" }}>
                  <span className="text-xs text-white">{a}</span>
                  <button onClick={() => removeAsig(a)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ))}
              {sel.asignaturas.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">No hay asignaturas asociadas</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tab: Secciones ────────────────────────────────────────────────────────────

function TabSecciones({ filterGradoId }: { filterGradoId: number | null }) {
  const [secciones, setSecciones] = useState<Seccion[]>(initSecciones);
  const [modal, setModal] = useState<"create" | "edit" | "docentes" | "estudiantes" | null>(null);
  const [sel, setSel] = useState<Seccion | null>(null);
  const [filterGrado, setFilterGrado] = useState<number | "">(filterGradoId ?? "");
  const [filterDocente, setFilterDocente] = useState("");
  const [form, setForm] = useState({ nombre: "", gradoId: 1, cicloId: 1, totalEstudiantes: 0, estado: "Activo" as CommonEstado, docentes: [] as string[] });
  const [docenteInput, setDocenteInput] = useState("");

  const grados = initGrados;
  const ciclos = initCiclos;

  const allDocentes = [...new Set(secciones.flatMap((s) => s.docentes))];

  const filtered = secciones.filter((s) => {
    const matchGrado = !filterGrado || s.gradoId === Number(filterGrado);
    const matchDocente = !filterDocente || s.docentes.some((d) => d.toLowerCase().includes(filterDocente.toLowerCase()));
    return matchGrado && matchDocente;
  });

  function gradoName(id: number) { return grados.find((g) => g.id === id)?.nombre ?? "—"; }
  function cicloName(id: number) { return ciclos.find((c) => c.id === id)?.nombre ?? "—"; }

  function openCreate() {
    setForm({ nombre: "", gradoId: 1, cicloId: 1, totalEstudiantes: 0, estado: "Activo", docentes: [] });
    setSel(null); setModal("create");
  }
  function openEdit(s: Seccion) {
    setForm({ nombre: s.nombre, gradoId: s.gradoId, cicloId: s.cicloId, totalEstudiantes: s.totalEstudiantes, estado: s.estado, docentes: [...s.docentes] });
    setSel(s); setModal("edit");
  }
  function openDocentes(s: Seccion) { setSel(s); setDocenteInput(""); setModal("docentes"); }
  function openEstudiantes(s: Seccion) { setSel(s); setModal("estudiantes"); }

  function handleSave() {
    if (!form.nombre.trim()) return;
    if (modal === "create") {
      setSecciones((p) => [...p, { ...form, id: Math.max(0, ...p.map((x) => x.id)) + 1 }]);
    } else if (sel) {
      setSecciones((p) => p.map((x) => x.id === sel.id ? { ...x, ...form } : x));
    }
    setModal(null);
  }
  function addDocente() {
    if (!docenteInput.trim() || !sel) return;
    setSecciones((p) => p.map((x) => x.id === sel.id ? { ...x, docentes: [...x.docentes, docenteInput.trim()] } : x));
    setSel((s) => s ? { ...s, docentes: [...s.docentes, docenteInput.trim()] } : s);
    setDocenteInput("");
  }
  function removeDocente(d: string) {
    if (!sel) return;
    setSecciones((p) => p.map((x) => x.id === sel.id ? { ...x, docentes: x.docentes.filter((v) => v !== d) } : x));
    setSel((s) => s ? { ...s, docentes: s.docentes.filter((v) => v !== d) } : s);
  }
  function toggle(id: number) {
    setSecciones((p) => p.map((x) => x.id === id ? { ...x, estado: x.estado === "Activo" ? "Inactivo" : "Activo" } : x));
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SectionTitle>Secciones</SectionTitle>
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#263030", border: "1px solid #2e3939" }}>
            <Filter size={13} className="text-gray-500" />
            <select className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer" value={filterGrado}
              onChange={(e) => setFilterGrado(e.target.value === "" ? "" : Number(e.target.value))}>
              <option value="" style={{ background: "#1F2525" }}>Todos los grados</option>
              {grados.map((g) => <option key={g.id} value={g.id} style={{ background: "#1F2525" }}>{g.nombre}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#263030", border: "1px solid #2e3939" }}>
            <Search size={13} className="text-gray-500" />
            <input className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-36"
              placeholder="Buscar docente..." value={filterDocente}
              onChange={(e) => setFilterDocente(e.target.value)} />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
            <Plus size={14} />Nueva sección
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
              {["Sección", "Grado", "Ciclo", "Docente(s)", "Estudiantes", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                  style={{ fontFamily: "var(--font-display)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No hay secciones con esos filtros</td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b transition-colors hover:bg-[#2e3939]/40"
                  style={{ borderColor: "#2e3939", opacity: s.estado === "Inactivo" ? 0.6 : 1 }}>
                  <td className="px-4 py-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                      style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>
                      {s.nombre}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-200 font-medium">{gradoName(s.gradoId)}</td>
                  <td className="px-4 py-3 text-gray-400">{cicloName(s.cicloId)}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {s.docentes.map((d) => (
                        <div key={d} className="flex items-center gap-1 text-gray-300">
                          <User size={10} className="text-gray-500" />{d}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-[#00ADEB]" />
                      <span className="text-white font-semibold">{s.totalEstudiantes}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge estado={s.estado} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <ActionBtn icon={<Pencil size={13} />} label="Editar" color="#F59E0B" onClick={() => openEdit(s)} />
                      <ActionBtn icon={<User size={13} />} label="Docentes" color="#00ADEB" onClick={() => openDocentes(s)} />
                      <ActionBtn icon={<Eye size={13} />} label="Estudiantes" color="#A78BFA" onClick={() => openEstudiantes(s)} />
                      <ActionBtn
                        icon={s.estado === "Activo" ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        label={s.estado === "Activo" ? "Desactivar" : "Activar"}
                        color={s.estado === "Activo" ? "#EF4444" : "#10B981"}
                        onClick={() => toggle(s.id)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nueva sección" : "Editar sección"}
          onClose={() => setModal(null)} onSave={handleSave}
          saveLabel={modal === "create" ? "Crear sección" : "Guardar"}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre / Letra">
              <input className={fi} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: A" />
            </Field>
            <Field label="Grado">
              <select className={fi} value={form.gradoId} onChange={(e) => setForm({ ...form, gradoId: Number(e.target.value) })}>
                {grados.map((g) => <option key={g.id} value={g.id} style={{ background: "#263030" }}>{g.nombre}</option>)}
              </select>
            </Field>
            <Field label="Ciclo académico" span2>
              <select className={fi} value={form.cicloId} onChange={(e) => setForm({ ...form, cicloId: Number(e.target.value) })}>
                {ciclos.map((c) => <option key={c.id} value={c.id} style={{ background: "#263030" }}>{c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Total estudiantes">
              <input type="number" className={fi} value={form.totalEstudiantes}
                onChange={(e) => setForm({ ...form, totalEstudiantes: Number(e.target.value) })} min={0} />
            </Field>
            <Field label="Estado">
              <select className={fi} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as CommonEstado })}>
                <option value="Activo" style={{ background: "#263030" }}>Activo</option>
                <option value="Inactivo" style={{ background: "#263030" }}>Inactivo</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}

      {modal === "docentes" && sel && (
        <Modal title={`Docentes — ${gradoName(sel.gradoId)} Sección ${sel.nombre}`}
          subtitle="Asigna o elimina docentes de esta sección"
          onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select className={`${fi} flex-1`} value={docenteInput} onChange={(e) => setDocenteInput(e.target.value)}>
                <option value="" style={{ background: "#263030" }}>Seleccionar docente...</option>
                {allDocentes.filter((d) => !sel.docentes.includes(d)).map((d) => (
                  <option key={d} value={d} style={{ background: "#263030" }}>{d}</option>
                ))}
                <option value="__custom__" style={{ background: "#263030" }}>Ingresar nombre...</option>
              </select>
              <button onClick={addDocente} className="px-3 rounded-lg text-white" style={{ background: "#00ADEB" }}>
                <Plus size={14} />
              </button>
            </div>
            {docenteInput === "__custom__" && (
              <input className={fi} placeholder="Nombre del docente..." onChange={(e) => setDocenteInput(e.target.value)} autoFocus />
            )}
            <div className="space-y-1.5">
              {sel.docentes.map((d) => (
                <div key={d} className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: "#263030", border: "1px solid #2e3939" }}>
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-[#00ADEB]" />
                    <span className="text-xs text-white">{d}</span>
                  </div>
                  <button onClick={() => removeDocente(d)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {modal === "estudiantes" && sel && (
        <Modal title={`Estudiantes — ${gradoName(sel.gradoId)} Sección ${sel.nombre}`}
          subtitle={`${sel.totalEstudiantes} estudiantes matriculados`}
          onClose={() => setModal(null)}>
          <div className="space-y-2">
            {Array.from({ length: Math.min(sel.totalEstudiantes, 8) }, (_, i) => {
              const names = ["Lucía Paredes", "Diego Mamani", "Valentina Quispe", "Sebastián Torres",
                "Camila Herrera", "Andrés Cáceres", "Ana Torres", "Ricardo Soto"];
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{ background: "#263030", border: "1px solid #2e3939" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: i % 2 === 0 ? "#107A9F" : "#00ADEB" }}>
                    {names[i % names.length].split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs text-white font-medium">{names[i % names.length]}</p>
                    <p className="text-[10px] text-gray-500">Est. #{String(1001 + i).padStart(5, "0")}</p>
                  </div>
                  <StatusBadge estado="Activo" />
                </div>
              );
            })}
            {sel.totalEstudiantes > 8 && (
              <p className="text-xs text-center text-gray-500 pt-2">
                y {sel.totalEstudiantes - 8} estudiantes más...
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tab: Asignaturas ──────────────────────────────────────────────────────────

function TabAsignaturas() {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>(initAsignaturas);
  const [modal, setModal] = useState<"create" | "edit" | "asociar" | null>(null);
  const [sel, setSel] = useState<Asignatura | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nombre: "", codigo: "", docente: "", estado: "Activo" as CommonEstado, gradosAsociados: [] as string[] });
  const [gradoInput, setGradoInput] = useState("");

  const filtered = asignaturas.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.nombre.toLowerCase().includes(q) || a.codigo.toLowerCase().includes(q) || a.docente.toLowerCase().includes(q);
  });

  function openCreate() {
    setForm({ nombre: "", codigo: "", docente: "", estado: "Activo", gradosAsociados: [] });
    setSel(null); setModal("create");
  }
  function openEdit(a: Asignatura) {
    setForm({ nombre: a.nombre, codigo: a.codigo, docente: a.docente, estado: a.estado, gradosAsociados: [...a.gradosAsociados] });
    setSel(a); setModal("edit");
  }
  function openAsociar(a: Asignatura) { setSel(a); setGradoInput(""); setModal("asociar"); }
  function handleSave() {
    if (!form.nombre.trim()) return;
    if (modal === "create") {
      setAsignaturas((p) => [...p, { ...form, id: Math.max(0, ...p.map((x) => x.id)) + 1 }]);
    } else if (sel) {
      setAsignaturas((p) => p.map((x) => x.id === sel.id ? { ...x, ...form } : x));
    }
    setModal(null);
  }
  function toggle(id: number) {
    setAsignaturas((p) => p.map((x) => x.id === id ? { ...x, estado: x.estado === "Activo" ? "Inactivo" : "Activo" } : x));
  }
  function addGrado() {
    if (!gradoInput.trim() || !sel) return;
    setAsignaturas((p) => p.map((x) => x.id === sel.id ? { ...x, gradosAsociados: [...x.gradosAsociados, gradoInput.trim()] } : x));
    setSel((s) => s ? { ...s, gradosAsociados: [...s.gradosAsociados, gradoInput.trim()] } : s);
    setGradoInput("");
  }
  function removeGrado(g: string) {
    if (!sel) return;
    setAsignaturas((p) => p.map((x) => x.id === sel.id ? { ...x, gradosAsociados: x.gradosAsociados.filter((v) => v !== g) } : x));
    setSel((s) => s ? { ...s, gradosAsociados: s.gradosAsociados.filter((v) => v !== g) } : s);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SectionTitle>Asignaturas</SectionTitle>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 ml-auto" style={{ background: "#263030", border: "1px solid #2e3939" }}>
          <Search size={13} className="text-gray-500" />
          <input className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-44"
            placeholder="Buscar asignatura..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300"><X size={12} /></button>}
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
          <Plus size={14} />Nueva asignatura
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
              {["Asignatura", "Código", "Docente asignado", "Grados", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                  style={{ fontFamily: "var(--font-display)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b transition-colors hover:bg-[#2e3939]/40"
                style={{ borderColor: "#2e3939", opacity: a.estado === "Inactivo" ? 0.6 : 1 }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#107A9F20" }}>
                      <BookOpen size={14} className="text-[#107A9F]" />
                    </div>
                    <span className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{a.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded font-mono text-[11px]" style={{ background: "#2e3939", color: "#9CA3AF" }}>
                    {a.codigo}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <User size={11} className="text-gray-500" />{a.docente || <span className="text-gray-600 italic">Sin asignar</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {a.gradosAsociados.slice(0, 4).map((g) => (
                      <span key={g} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#00ADEB15", color: "#00ADEB" }}>{g}</span>
                    ))}
                    {a.gradosAsociados.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#2e3939] text-gray-400">+{a.gradosAsociados.length - 4}</span>
                    )}
                    {a.gradosAsociados.length === 0 && <span className="text-gray-600 italic">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge estado={a.estado} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    <ActionBtn icon={<Pencil size={13} />} label="Editar" color="#F59E0B" onClick={() => openEdit(a)} />
                    <ActionBtn icon={<ExternalLink size={13} />} label="Asociar grados" color="#00ADEB" onClick={() => openAsociar(a)} />
                    <ActionBtn
                      icon={a.estado === "Activo" ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      label={a.estado === "Activo" ? "Desactivar" : "Activar"}
                      color={a.estado === "Activo" ? "#EF4444" : "#10B981"}
                      onClick={() => toggle(a.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nueva asignatura" : "Editar asignatura"}
          onClose={() => setModal(null)} onSave={handleSave}
          saveLabel={modal === "create" ? "Crear asignatura" : "Guardar"}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" span2>
              <input className={fi} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Matemáticas" />
            </Field>
            <Field label="Código">
              <input className={fi} value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="Ej: MAT-001" />
            </Field>
            <Field label="Estado">
              <select className={fi} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as CommonEstado })}>
                <option value="Activo" style={{ background: "#263030" }}>Activo</option>
                <option value="Inactivo" style={{ background: "#263030" }}>Inactivo</option>
              </select>
            </Field>
            <Field label="Docente asignado" span2>
              <input className={fi} value={form.docente} onChange={(e) => setForm({ ...form, docente: e.target.value })} placeholder="Ej: Lic. María González" />
            </Field>
          </div>
        </Modal>
      )}

      {modal === "asociar" && sel && (
        <Modal title={`Grados asociados — ${sel.nombre}`}
          subtitle="Vincula esta asignatura a uno o más grados"
          onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select className={`${fi} flex-1`} value={gradoInput} onChange={(e) => setGradoInput(e.target.value)}>
                <option value="" style={{ background: "#263030" }}>Seleccionar grado...</option>
                {initGrados.filter((g) => !sel.gradosAsociados.includes(g.nombre.slice(0, 2))).map((g) => (
                  <option key={g.id} value={g.nombre.slice(0, 2)} style={{ background: "#263030" }}>{g.nombre}</option>
                ))}
              </select>
              <button onClick={addGrado} className="px-3 rounded-lg text-white" style={{ background: "#00ADEB" }}>
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sel.gradosAsociados.map((g) => (
                <span key={g} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "#00ADEB20", color: "#00ADEB" }}>
                  {g}
                  <button onClick={() => removeGrado(g)} className="hover:text-red-400 transition-colors"><X size={11} /></button>
                </span>
              ))}
              {sel.gradosAsociados.length === 0 && <p className="text-xs text-gray-600 italic">Sin grados asociados</p>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "ciclos" | "grados" | "secciones" | "asignaturas";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "ciclos",      label: "Ciclos académicos", icon: Calendar },
  { id: "grados",      label: "Grados",            icon: GraduationCap },
  { id: "secciones",   label: "Secciones",          icon: Layers },
  { id: "asignaturas", label: "Asignaturas",        icon: BookOpen },
];

export default function AcademicManagement() {
  const [activeTab, setActiveTab] = useState<Tab>("ciclos");
  const [seccionGradoFilter, setSeccionGradoFilter] = useState<number | null>(null);

  function goToSeccion(gradoId: number) {
    setSeccionGradoFilter(gradoId);
    setActiveTab("secciones");
  }

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "#263030", border: "1px solid #2e3939" }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg flex-1 justify-center transition-all duration-150"
              style={{
                background: active ? "linear-gradient(135deg,#00ADEB18,#107A9F18)" : "transparent",
                color: active ? "#00ADEB" : "#9CA3AF",
                border: active ? "1px solid #00ADEB30" : "1px solid transparent",
                fontFamily: "var(--font-display)",
              }}>
              <tab.icon size={14} />
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "ciclos"      && <TabCiclos />}
      {activeTab === "grados"      && <TabGrados onGoToSeccion={goToSeccion} />}
      {activeTab === "secciones"   && <TabSecciones filterGradoId={seccionGradoFilter} />}
      {activeTab === "asignaturas" && <TabAsignaturas />}
    </div>
  );
}
