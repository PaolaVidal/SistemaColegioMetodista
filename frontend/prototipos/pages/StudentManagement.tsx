import { useState } from "react";
import {
  Search, Plus, Pencil, X, Filter, ChevronLeft, ChevronRight,
  GraduationCap, Eye, Users, CheckCircle, XCircle, Hash,
  User, Heart, Pill, ShieldAlert, Droplets, Globe, Calendar,
  ChevronDown, ChevronUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Sexo = "M" | "F";
type EstadoEst = "Activo" | "Inactivo" | "Retirado";

interface Student {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  nie: string;
  grado: string;
  seccion: string;
  ciclo: string;
  edad: number;
  fechaNacimiento: string;
  sexo: Sexo;
  nacionalidad: string;
  tipoSangre: string;
  repiteGrado: boolean;
  anioGradoAnterior: string;
  estado: EstadoEst;
  // Salud
  padeceEnfermedad: boolean;
  tipoEnfermedad: string;
  tomaMedicamento: boolean;
  nombreMedicamento: string;
  poseeDiscapacidad: boolean;
  tipoDiscapacidad: string;
  eserAlergico: boolean;
  medicamentoAlergia: string;
  vacunadoCovid: boolean;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const GRADOS = ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado", "6° Grado"];
const SECCIONES = ["A", "B", "C"];
const CICLOS = ["Año Escolar 2026", "Año Escolar 2025", "Año Escolar 2024"];
const SANGRES = ["O+", "O−", "A+", "A−", "B+", "B−", "AB+", "AB−"];

const seed: Student[] = [
  { id: 1, codigo: "EST-00001", nombres: "Lucía Fernanda", apellidos: "Paredes Vega", nie: "NIE-2019-001", grado: "3° Grado", seccion: "A", ciclo: "Año Escolar 2026", edad: 9, fechaNacimiento: "2016-04-15", sexo: "F", nacionalidad: "Peruana", tipoSangre: "O+", repiteGrado: false, anioGradoAnterior: "2025", estado: "Activo", padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: false, medicamentoAlergia: "", vacunadoCovid: true },
  { id: 2, codigo: "EST-00002", nombres: "Diego Alejandro", apellidos: "Mamani Quispe", nie: "NIE-2019-002", grado: "3° Grado", seccion: "A", ciclo: "Año Escolar 2026", edad: 10, fechaNacimiento: "2015-11-22", sexo: "M", nacionalidad: "Peruana", tipoSangre: "A+", repiteGrado: true, anioGradoAnterior: "2024", estado: "Activo", padeceEnfermedad: true, tipoEnfermedad: "Asma leve", tomaMedicamento: true, nombreMedicamento: "Salbutamol", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: false, medicamentoAlergia: "", vacunadoCovid: true },
  { id: 3, codigo: "EST-00003", nombres: "Valentina", apellidos: "Quispe Huanca", nie: "NIE-2020-003", grado: "1° Grado", seccion: "B", ciclo: "Año Escolar 2026", edad: 7, fechaNacimiento: "2018-07-03", sexo: "F", nacionalidad: "Boliviana", tipoSangre: "B+", repiteGrado: false, anioGradoAnterior: "", estado: "Activo", padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: true, medicamentoAlergia: "Penicilina", vacunadoCovid: false },
  { id: 4, codigo: "EST-00004", nombres: "Sebastián Rodrigo", apellidos: "Torres Cáceres", nie: "NIE-2018-004", grado: "5° Grado", seccion: "A", ciclo: "Año Escolar 2026", edad: 12, fechaNacimiento: "2013-02-17", sexo: "M", nacionalidad: "Peruana", tipoSangre: "AB+", repiteGrado: false, anioGradoAnterior: "2025", estado: "Activo", padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: false, medicamentoAlergia: "", vacunadoCovid: true },
  { id: 5, codigo: "EST-00005", nombres: "Camila Andrea", apellidos: "Herrera Taipe", nie: "NIE-2021-005", grado: "1° Grado", seccion: "A", ciclo: "Año Escolar 2026", edad: 6, fechaNacimiento: "2019-09-28", sexo: "F", nacionalidad: "Peruana", tipoSangre: "O−", repiteGrado: false, anioGradoAnterior: "", estado: "Activo", padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "", poseeDiscapacidad: true, tipoDiscapacidad: "Hipoacusia leve", eserAlergico: false, medicamentoAlergia: "", vacunadoCovid: true },
  { id: 6, codigo: "EST-00006", nombres: "Andrés Felipe", apellidos: "Cáceres Puma", nie: "NIE-2017-006", grado: "6° Grado", seccion: "A", ciclo: "Año Escolar 2026", edad: 13, fechaNacimiento: "2012-12-05", sexo: "M", nacionalidad: "Peruana", tipoSangre: "A−", repiteGrado: false, anioGradoAnterior: "2025", estado: "Activo", padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: false, medicamentoAlergia: "", vacunadoCovid: true },
  { id: 7, codigo: "EST-00007", nombres: "Ana Sofía", apellidos: "Torres León", nie: "NIE-2019-007", grado: "2° Grado", seccion: "A", ciclo: "Año Escolar 2026", edad: 8, fechaNacimiento: "2017-05-14", sexo: "F", nacionalidad: "Peruana", tipoSangre: "O+", repiteGrado: false, anioGradoAnterior: "2025", estado: "Inactivo", padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: false, medicamentoAlergia: "", vacunadoCovid: true },
  { id: 8, codigo: "EST-00008", nombres: "Ricardo Alonso", apellidos: "Soto Aliaga", nie: "NIE-2020-008", grado: "4° Grado", seccion: "A", ciclo: "Año Escolar 2026", edad: 11, fechaNacimiento: "2014-08-30", sexo: "M", nacionalidad: "Peruana", tipoSangre: "B−", repiteGrado: true, anioGradoAnterior: "2023", estado: "Activo", padeceEnfermedad: true, tipoEnfermedad: "Diabetes tipo 1", tomaMedicamento: true, nombreMedicamento: "Insulina", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: false, medicamentoAlergia: "", vacunadoCovid: true },
  { id: 9, codigo: "EST-00009", nombres: "Mariana Isabel", apellidos: "Flores Chávez", nie: "NIE-2020-009", grado: "2° Grado", seccion: "B", ciclo: "Año Escolar 2026", edad: 8, fechaNacimiento: "2017-03-11", sexo: "F", nacionalidad: "Peruana", tipoSangre: "A+", repiteGrado: false, anioGradoAnterior: "2025", estado: "Activo", padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: false, medicamentoAlergia: "", vacunadoCovid: false },
  { id: 10, codigo: "EST-00010", nombres: "Pablo Ernesto", apellidos: "Vargas Medina", nie: "NIE-2018-010", grado: "4° Grado", seccion: "B", ciclo: "Año Escolar 2026", edad: 11, fechaNacimiento: "2014-06-19", sexo: "M", nacionalidad: "Colombiana", tipoSangre: "AB−", repiteGrado: false, anioGradoAnterior: "2025", estado: "Retirado", padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: false, medicamentoAlergia: "", vacunadoCovid: true },
  { id: 11, codigo: "EST-00011", nombres: "Sofía Valentina", apellidos: "Cruz Apaza", nie: "NIE-2021-011", grado: "1° Grado", seccion: "A", ciclo: "Año Escolar 2026", edad: 6, fechaNacimiento: "2019-01-25", sexo: "F", nacionalidad: "Peruana", tipoSangre: "O+", repiteGrado: false, anioGradoAnterior: "", estado: "Activo", padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: false, medicamentoAlergia: "", vacunadoCovid: true },
  { id: 12, codigo: "EST-00012", nombres: "Mateo Joaquín", apellidos: "Ramos Salinas", nie: "NIE-2019-012", grado: "3° Grado", seccion: "B", ciclo: "Año Escolar 2026", edad: 9, fechaNacimiento: "2016-10-08", sexo: "M", nacionalidad: "Peruana", tipoSangre: "B+", repiteGrado: false, anioGradoAnterior: "2025", estado: "Activo", padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "", poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: true, medicamentoAlergia: "Ibuprofeno", vacunadoCovid: true },
];

// ── Shared helpers ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4"
      style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}>
      {children}
    </h2>
  );
}

function StatusBadge({ estado }: { estado: EstadoEst }) {
  const map = {
    Activo:   { bg: "#10B98120", color: "#10B981", icon: <CheckCircle size={10} /> },
    Inactivo: { bg: "#EF444420", color: "#EF4444", icon: <XCircle size={10} /> },
    Retirado: { bg: "#6B728020", color: "#9CA3AF", icon: <XCircle size={10} /> },
  };
  const c = map[estado];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: c.bg, color: c.color }}>
      {c.icon}{estado}
    </span>
  );
}

const fi = "w-full bg-[#263030] border border-[#2e3939] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#00ADEB] transition-colors placeholder-gray-600";

function Field({ label, children, span2, col3 }: { label: string; children: React.ReactNode; span2?: boolean; col3?: boolean }) {
  return (
    <div className={span2 ? "col-span-2" : col3 ? "col-span-3" : ""}>
      <label className="block text-[11px] font-medium text-gray-400 mb-1.5" style={{ fontFamily: "var(--font-display)" }}>{label}</label>
      {children}
    </div>
  );
}

function BoolField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-400 mb-1.5" style={{ fontFamily: "var(--font-display)" }}>{label}</label>
      <div className="flex gap-2">
        {[true, false].map((opt) => (
          <button key={String(opt)} onClick={() => onChange(opt)}
            className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
            style={{
              background: value === opt ? (opt ? "#10B98120" : "#EF444420") : "#263030",
              borderColor: value === opt ? (opt ? "#10B981" : "#EF4444") : "#2e3939",
              color: value === opt ? (opt ? "#10B981" : "#EF4444") : "#6B7280",
              fontFamily: "var(--font-display)",
            }}>
            {opt ? "Sí" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Form sections (collapsible) ───────────────────────────────────────────────

function FormSection({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#2e3939" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#2e3939]/40"
        style={{ background: "#1F2525" }}>
        <div className="flex items-center gap-2.5">
          <span className="text-[#00ADEB]">{icon}</span>
          <span className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>
      {open && (
        <div className="p-4 grid grid-cols-2 gap-3" style={{ background: "#263030" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Student modal (create / edit / view) ─────────────────────────────────────

const emptyForm = (): Omit<Student, "id" | "codigo"> => ({
  nombres: "", apellidos: "", nie: "", grado: GRADOS[0], seccion: SECCIONES[0],
  ciclo: CICLOS[0], edad: 0, fechaNacimiento: "", sexo: "M", nacionalidad: "Peruana",
  tipoSangre: "O+", repiteGrado: false, anioGradoAnterior: "", estado: "Activo",
  padeceEnfermedad: false, tipoEnfermedad: "", tomaMedicamento: false, nombreMedicamento: "",
  poseeDiscapacidad: false, tipoDiscapacidad: "", eserAlergico: false,
  medicamentoAlergia: "", vacunadoCovid: false,
});

type ModalMode = "create" | "edit" | "view" | null;

function StudentModal({ mode, student, onClose, onSave }: {
  mode: ModalMode; student: Student | null; onClose: () => void;
  onSave: (data: Omit<Student, "id" | "codigo">) => void;
}) {
  const [form, setForm] = useState<Omit<Student, "id" | "codigo">>(
    student ? { ...student } : emptyForm()
  );
  const isView = mode === "view";

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-2xl rounded-2xl border shadow-2xl my-6 overflow-hidden"
        style={{ background: "#1F2525", borderColor: "#2e3939" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0 z-10"
          style={{ background: "#1F2525", borderColor: "#2e3939" }}>
          <div>
            <h2 className="text-white font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
              {mode === "create" ? "Registrar estudiante" : mode === "edit" ? "Editar estudiante" : "Ficha del estudiante"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {mode === "create" ? "Complete todos los datos para registrar la matrícula"
                : mode === "view" ? `Código: ${student?.codigo}`
                : `Editando: ${student?.nombres} ${student?.apellidos}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 overflow-y-auto" style={{ maxHeight: "70vh" }}>

          {/* View mode: compact header */}
          {isView && student && (
            <div className="flex items-center gap-4 p-4 rounded-xl border mb-2"
              style={{ background: "#263030", borderColor: "#2e3939" }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>
                {student.nombres[0]}{student.apellidos[0]}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {student.nombres} {student.apellidos}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{student.grado} — Sección {student.seccion}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono" style={{ background: "#2e3939", color: "#9CA3AF" }}>{student.codigo}</span>
                  <StatusBadge estado={student.estado} />
                </div>
              </div>
            </div>
          )}

          {/* Datos personales */}
          <FormSection title="Datos personales" icon={<User size={14} />}>
            <Field label="Nombres" span2>
              <input className={fi} value={form.nombres} disabled={isView}
                onChange={(e) => set("nombres", e.target.value)} placeholder="Ej: Lucía Fernanda" />
            </Field>
            <Field label="Apellidos" span2>
              <input className={fi} value={form.apellidos} disabled={isView}
                onChange={(e) => set("apellidos", e.target.value)} placeholder="Ej: Paredes Vega" />
            </Field>
            <Field label="NIE">
              <input className={fi} value={form.nie} disabled={isView}
                onChange={(e) => set("nie", e.target.value)} placeholder="NIE-AAAA-XXX" />
            </Field>
            <Field label="Fecha de nacimiento">
              <input type="date" className={fi} value={form.fechaNacimiento} disabled={isView}
                onChange={(e) => set("fechaNacimiento", e.target.value)} />
            </Field>
            <Field label="Edad">
              <input type="number" className={fi} value={form.edad || ""} disabled={isView} min={3} max={20}
                onChange={(e) => set("edad", Number(e.target.value))} placeholder="Años" />
            </Field>
            <Field label="Sexo">
              {isView
                ? <input className={fi} value={form.sexo === "M" ? "Masculino" : "Femenino"} disabled />
                : (
                  <div className="flex gap-2">
                    {(["M", "F"] as Sexo[]).map((s) => (
                      <button key={s} onClick={() => set("sexo", s)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all"
                        style={{
                          background: form.sexo === s ? "#00ADEB20" : "#263030",
                          borderColor: form.sexo === s ? "#00ADEB" : "#2e3939",
                          color: form.sexo === s ? "#00ADEB" : "#6B7280",
                          fontFamily: "var(--font-display)",
                        }}>
                        {s === "M" ? "Masculino" : "Femenino"}
                      </button>
                    ))}
                  </div>
                )}
            </Field>
            <Field label="Nacionalidad">
              <input className={fi} value={form.nacionalidad} disabled={isView}
                onChange={(e) => set("nacionalidad", e.target.value)} placeholder="Ej: Peruana" />
            </Field>
            <Field label="Tipo de sangre">
              {isView
                ? <input className={fi} value={form.tipoSangre} disabled />
                : (
                  <select className={fi} value={form.tipoSangre} onChange={(e) => set("tipoSangre", e.target.value)}>
                    {SANGRES.map((s) => <option key={s} value={s} style={{ background: "#263030" }}>{s}</option>)}
                  </select>
                )}
            </Field>
          </FormSection>

          {/* Datos académicos */}
          <FormSection title="Datos académicos" icon={<GraduationCap size={14} />}>
            <Field label="Grado">
              {isView
                ? <input className={fi} value={form.grado} disabled />
                : (
                  <select className={fi} value={form.grado} onChange={(e) => set("grado", e.target.value)}>
                    {GRADOS.map((g) => <option key={g} value={g} style={{ background: "#263030" }}>{g}</option>)}
                  </select>
                )}
            </Field>
            <Field label="Sección">
              {isView
                ? <input className={fi} value={form.seccion} disabled />
                : (
                  <select className={fi} value={form.seccion} onChange={(e) => set("seccion", e.target.value)}>
                    {SECCIONES.map((s) => <option key={s} value={s} style={{ background: "#263030" }}>{s}</option>)}
                  </select>
                )}
            </Field>
            <Field label="Ciclo académico" span2>
              {isView
                ? <input className={fi} value={form.ciclo} disabled />
                : (
                  <select className={fi} value={form.ciclo} onChange={(e) => set("ciclo", e.target.value)}>
                    {CICLOS.map((c) => <option key={c} value={c} style={{ background: "#263030" }}>{c}</option>)}
                  </select>
                )}
            </Field>
            <Field label="Estado">
              {isView
                ? <input className={fi} value={form.estado} disabled />
                : (
                  <select className={fi} value={form.estado} onChange={(e) => set("estado", e.target.value as EstadoEst)}>
                    {(["Activo", "Inactivo", "Retirado"] as EstadoEst[]).map((s) => (
                      <option key={s} value={s} style={{ background: "#263030" }}>{s}</option>
                    ))}
                  </select>
                )}
            </Field>
            <Field label="¿Repite grado?">
              {isView
                ? <input className={fi} value={form.repiteGrado ? "Sí" : "No"} disabled />
                : <BoolField label="" value={form.repiteGrado} onChange={(v) => set("repiteGrado", v)} />}
            </Field>
            {form.repiteGrado && (
              <Field label="Año que estudió el grado anterior" span2>
                <input className={fi} value={form.anioGradoAnterior} disabled={isView}
                  onChange={(e) => set("anioGradoAnterior", e.target.value)} placeholder="Ej: 2024" />
              </Field>
            )}
          </FormSection>

          {/* Información de salud */}
          <FormSection title="Información de salud" icon={<Heart size={14} />} defaultOpen={false}>
            <Field label="¿Padece alguna enfermedad?">
              {isView
                ? <input className={fi} value={form.padeceEnfermedad ? "Sí" : "No"} disabled />
                : <BoolField label="" value={form.padeceEnfermedad} onChange={(v) => set("padeceEnfermedad", v)} />}
            </Field>
            <Field label="Tipo de enfermedad">
              <input className={fi} value={form.tipoEnfermedad} disabled={isView || !form.padeceEnfermedad}
                onChange={(e) => set("tipoEnfermedad", e.target.value)} placeholder="Describir..." />
            </Field>
            <Field label="¿Toma algún medicamento?">
              {isView
                ? <input className={fi} value={form.tomaMedicamento ? "Sí" : "No"} disabled />
                : <BoolField label="" value={form.tomaMedicamento} onChange={(v) => set("tomaMedicamento", v)} />}
            </Field>
            <Field label="Nombre del medicamento">
              <input className={fi} value={form.nombreMedicamento} disabled={isView || !form.tomaMedicamento}
                onChange={(e) => set("nombreMedicamento", e.target.value)} placeholder="Ej: Salbutamol" />
            </Field>
            <Field label="¿Posee alguna discapacidad?">
              {isView
                ? <input className={fi} value={form.poseeDiscapacidad ? "Sí" : "No"} disabled />
                : <BoolField label="" value={form.poseeDiscapacidad} onChange={(v) => set("poseeDiscapacidad", v)} />}
            </Field>
            <Field label="Tipo de discapacidad">
              <input className={fi} value={form.tipoDiscapacidad} disabled={isView || !form.poseeDiscapacidad}
                onChange={(e) => set("tipoDiscapacidad", e.target.value)} placeholder="Describir..." />
            </Field>
            <Field label="¿Es alérgico a algún medicamento?">
              {isView
                ? <input className={fi} value={form.eserAlergico ? "Sí" : "No"} disabled />
                : <BoolField label="" value={form.eserAlergico} onChange={(v) => set("eserAlergico", v)} />}
            </Field>
            <Field label="Medicamento que produce alergia">
              <input className={fi} value={form.medicamentoAlergia} disabled={isView || !form.eserAlergico}
                onChange={(e) => set("medicamentoAlergia", e.target.value)} placeholder="Ej: Penicilina" />
            </Field>
            <Field label="¿Vacunado contra el COVID-19?" span2>
              {isView
                ? <input className={fi} value={form.vacunadoCovid ? "Sí" : "No"} disabled />
                : <BoolField label="" value={form.vacunadoCovid} onChange={(v) => set("vacunadoCovid", v)} />}
            </Field>
          </FormSection>
        </div>

        {/* Footer */}
        {!isView && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t sticky bottom-0"
            style={{ borderColor: "#2e3939", background: "#1F2525" }}>
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}>
              Cancelar
            </button>
            <button onClick={() => onSave(form)}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
              {mode === "create" ? "Registrar estudiante" : "Guardar cambios"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const ROWS = 9;

export default function StudentManagement({ onViewRecord }: { onViewRecord?: (s: Student) => void }) {
  const [students, setStudents] = useState<Student[]>(seed);
  const [search, setSearch] = useState("");
  const [filterCiclo, setFilterCiclo] = useState("");
  const [filterGrado, setFilterGrado] = useState("");
  const [filterSeccion, setFilterSeccion] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Student | null>(null);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || `${s.nombres} ${s.apellidos}`.toLowerCase().includes(q)
      || s.codigo.toLowerCase().includes(q)
      || s.nie.toLowerCase().includes(q);
    return (
      matchSearch &&
      (!filterCiclo || s.ciclo === filterCiclo) &&
      (!filterGrado || s.grado === filterGrado) &&
      (!filterSeccion || s.seccion === filterSeccion) &&
      (!filterEstado || s.estado === filterEstado)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage - 1) * ROWS, curPage * ROWS);

  function openCreate() { setSelected(null); setModal("create"); }
  function openEdit(s: Student) { setSelected(s); setModal("edit"); }
  function openView(s: Student) {
    if (onViewRecord) { onViewRecord(s); } else { setSelected(s); setModal("view"); }
  }

  function handleSave(data: Omit<Student, "id" | "codigo">) {
    if (modal === "create") {
      const nextId = Math.max(0, ...students.map((x) => x.id)) + 1;
      const codigo = `EST-${String(nextId).padStart(5, "0")}`;
      setStudents((p) => [{ id: nextId, codigo, ...data }, ...p]);
    } else if (modal === "edit" && selected) {
      setStudents((p) => p.map((x) => x.id === selected.id ? { ...x, ...data } : x));
    }
    setModal(null);
  }

  const statCounts = {
    total: students.length,
    activos: students.filter((s) => s.estado === "Activo").length,
    inactivos: students.filter((s) => s.estado === "Inactivo").length,
    retirados: students.filter((s) => s.estado === "Retirado").length,
  };

  const hasHealth = (s: Student) => s.padeceEnfermedad || s.poseeDiscapacidad || s.eserAlergico;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total estudiantes", value: statCounts.total, color: "#00ADEB", icon: Users },
          { label: "Activos", value: statCounts.activos, color: "#10B981", icon: CheckCircle },
          { label: "Inactivos", value: statCounts.inactivos, color: "#F59E0B", icon: XCircle },
          { label: "Retirados", value: statCounts.retirados, color: "#EF4444", icon: XCircle },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border p-4 flex items-center gap-3"
            style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}20` }}>
              <item.icon size={15} style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{item.value}</p>
              <p className="text-[11px] text-gray-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border p-4 space-y-3" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-52 rounded-lg px-3 py-2"
            style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Search size={13} className="text-gray-500 flex-shrink-0" />
            <input type="text" placeholder="Buscar por nombre, código o NIE..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-full" />
            {search && <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300"><X size={12} /></button>}
          </div>

          {/* Ciclo */}
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Calendar size={12} className="text-gray-500" />
            <select className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer"
              value={filterCiclo} onChange={(e) => { setFilterCiclo(e.target.value); setPage(1); }}>
              <option value="" style={{ background: "#1F2525" }}>Ciclo</option>
              {CICLOS.map((c) => <option key={c} value={c} style={{ background: "#1F2525" }}>{c}</option>)}
            </select>
          </div>

          {/* Grado */}
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <GraduationCap size={12} className="text-gray-500" />
            <select className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer"
              value={filterGrado} onChange={(e) => { setFilterGrado(e.target.value); setPage(1); }}>
              <option value="" style={{ background: "#1F2525" }}>Grado</option>
              {GRADOS.map((g) => <option key={g} value={g} style={{ background: "#1F2525" }}>{g}</option>)}
            </select>
          </div>

          {/* Sección */}
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Filter size={12} className="text-gray-500" />
            <select className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer"
              value={filterSeccion} onChange={(e) => { setFilterSeccion(e.target.value); setPage(1); }}>
              <option value="" style={{ background: "#1F2525" }}>Sección</option>
              {SECCIONES.map((s) => <option key={s} value={s} style={{ background: "#1F2525" }}>Sección {s}</option>)}
            </select>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Filter size={12} className="text-gray-500" />
            <select className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer"
              value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value); setPage(1); }}>
              <option value="" style={{ background: "#1F2525" }}>Estado</option>
              {["Activo", "Inactivo", "Retirado"].map((s) => <option key={s} value={s} style={{ background: "#1F2525" }}>{s}</option>)}
            </select>
          </div>

          {/* Clear */}
          {(search || filterCiclo || filterGrado || filterSeccion || filterEstado) && (
            <button onClick={() => { setSearch(""); setFilterCiclo(""); setFilterGrado(""); setFilterSeccion(""); setFilterEstado(""); setPage(1); }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2">
              Limpiar filtros
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
              <Plus size={14} />Registrar estudiante
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
                {["Código", "Nombre completo", "Grado", "Sección", "Ciclo", "Salud", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                    style={{ fontFamily: "var(--font-display)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <GraduationCap size={36} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-sm text-gray-500">No se encontraron estudiantes</p>
                    <p className="text-xs text-gray-600 mt-1">Intenta con otros filtros o registra un nuevo estudiante</p>
                  </td>
                </tr>
              ) : pageRows.map((s, idx) => (
                <tr key={s.id} className="border-b transition-colors hover:bg-[#2e3939]/50 group"
                  style={{ borderColor: "#2e3939", opacity: s.estado === "Retirado" ? 0.55 : 1 }}>
                  {/* Código */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded"
                      style={{ background: "#2e3939", color: "#9CA3AF" }}>{s.codigo}</span>
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: idx % 2 === 0 ? "#107A9F" : "#00ADEB" }}>
                        {s.nombres[0]}{s.apellidos[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>
                          {s.nombres} {s.apellidos}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {s.sexo === "M" ? "Masculino" : "Femenino"} · {s.edad} años · {s.tipoSangre}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Grado */}
                  <td className="px-4 py-3 text-gray-200 whitespace-nowrap">{s.grado}</td>

                  {/* Sección */}
                  <td className="px-4 py-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                      style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>
                      {s.seccion}
                    </span>
                  </td>

                  {/* Ciclo */}
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{s.ciclo.replace("Año Escolar ", "")}</td>

                  {/* Health flags */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {s.padeceEnfermedad && (
                        <span title={s.tipoEnfermedad} className="p-1 rounded" style={{ background: "#EF444420" }}>
                          <Heart size={11} style={{ color: "#EF4444" }} />
                        </span>
                      )}
                      {s.poseeDiscapacidad && (
                        <span title={s.tipoDiscapacidad} className="p-1 rounded" style={{ background: "#F59E0B20" }}>
                          <ShieldAlert size={11} style={{ color: "#F59E0B" }} />
                        </span>
                      )}
                      {s.eserAlergico && (
                        <span title={`Alergia: ${s.medicamentoAlergia}`} className="p-1 rounded" style={{ background: "#A78BFA20" }}>
                          <Pill size={11} style={{ color: "#A78BFA" }} />
                        </span>
                      )}
                      {!hasHealth(s) && <span className="text-gray-600 text-[10px]">—</span>}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3"><StatusBadge estado={s.estado} /></td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openView(s)} title="Ver ficha"
                        className="p-1.5 rounded-lg transition-all hover:bg-[#00ADEB]/10 text-gray-400 hover:text-[#00ADEB]">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openEdit(s)} title="Editar"
                        className="p-1.5 rounded-lg transition-all hover:bg-[#F59E0B]/10 text-gray-400 hover:text-[#F59E0B]">
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-gray-500">
        <span className="font-medium text-gray-400">Indicadores de salud:</span>
        {[
          { icon: <Heart size={11} />, label: "Enfermedad", color: "#EF4444" },
          { icon: <ShieldAlert size={11} />, label: "Discapacidad", color: "#F59E0B" },
          { icon: <Pill size={11} />, label: "Alergia medicamentosa", color: "#A78BFA" },
        ].map((i) => (
          <span key={i.label} className="flex items-center gap-1" style={{ color: i.color }}>
            {i.icon}{i.label}
          </span>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <StudentModal mode={modal} student={selected} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}
