import { useState } from "react";
import {
  ArrowLeft, Pencil, User, Phone, Mail, MapPin, Heart,
  Pill, ShieldAlert, Globe, Droplets, Calendar, BookOpen,
  GraduationCap, Users, FileText, ClipboardList, Settings,
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  Minus, Upload, Download, Eye, Plus, ChevronRight, Star,
  Activity, AlertTriangle, X, Save,
} from "lucide-react";

// ── Types (re-used from StudentManagement) ────────────────────────────────────
type Sexo = "M" | "F";
type EstadoEst = "Activo" | "Inactivo" | "Retirado";

export interface Student {
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

// ── Seed extra data ───────────────────────────────────────────────────────────

const responsables = [
  { id: 1, relacion: "Madre", nombre: "Carmen Rosa Vega Huanca", dni: "45872316", telefono: "987 654 321", correo: "carmen.vega@gmail.com", direccion: "Jr. Los Pinos 342, Urb. El Bosque", ocupacion: "Docente", lugarTrabajo: "I.E. San Martín", principal: true },
  { id: 2, relacion: "Padre", nombre: "Jorge Luis Paredes Soto", dni: "32541789", telefono: "912 345 678", correo: "j.paredes@empresa.pe", direccion: "Jr. Los Pinos 342, Urb. El Bosque", ocupacion: "Ingeniero Civil", lugarTrabajo: "Constructora Andina SAC", principal: false },
];

const matriculas = [
  { ciclo: "Año Escolar 2026", grado: "3° Grado", seccion: "A", fechaMatricula: "2026-02-20", estado: "Activo",  modalidad: "Regular" },
  { ciclo: "Año Escolar 2025", grado: "2° Grado", seccion: "A", fechaMatricula: "2025-02-18", estado: "Finalizado", modalidad: "Regular" },
  { ciclo: "Año Escolar 2024", grado: "1° Grado", seccion: "B", fechaMatricula: "2024-02-22", estado: "Finalizado", modalidad: "Regular" },
];

const historialAcademico = [
  { ciclo: "2025", grado: "2° Grado", promedio: 15.4, estado: "Promovido",   materias: [{ nombre: "Matemáticas", nota: 16 }, { nombre: "Comunicación", nota: 15 }, { nombre: "Historia", nota: 14 }, { nombre: "Ciencias", nota: 16 }] },
  { ciclo: "2024", grado: "1° Grado", promedio: 14.1, estado: "Promovido",   materias: [{ nombre: "Matemáticas", nota: 13 }, { nombre: "Comunicación", nota: 15 }, { nombre: "Ciencias", nota: 14 }, { nombre: "Arte", nota: 14 }] },
];

const calificaciones = [
  { materia: "Matemáticas",   codigo: "MAT-001", docente: "Lic. Carlos Ríos",    b1: 15, b2: 16, b3: null, b4: null, promedio: 15.5 },
  { materia: "Comunicación",  codigo: "COM-001", docente: "Lic. María Soto",     b1: 14, b2: 15, b3: null, b4: null, promedio: 14.5 },
  { materia: "Historia",      codigo: "HIS-001", docente: "Lic. Jorge Medina",   b1: 13, b2: 14, b3: null, b4: null, promedio: 13.5 },
  { materia: "Ciencias",      codigo: "CIE-001", docente: "Lic. Rosa Chávez",    b1: 16, b2: 17, b3: null, b4: null, promedio: 16.5 },
  { materia: "Inglés",        codigo: "ING-001", docente: "Lic. Ana Torres",     b1: 12, b2: 13, b3: null, b4: null, promedio: 12.5 },
  { materia: "Ed. Física",    codigo: "EDF-001", docente: "Lic. Pedro Luna",     b1: 17, b2: 17, b3: null, b4: null, promedio: 17.0 },
];

const asistencia = {
  resumen: { totalDias: 115, asistio: 108, faltas: 5, tardanzas: 2, porcentaje: 93.9 },
  meses: [
    { mes: "Marzo",  dias: 20, asistio: 20, faltas: 0, tardanzas: 0 },
    { mes: "Abril",  dias: 22, asistio: 21, faltas: 1, tardanzas: 0 },
    { mes: "Mayo",   dias: 21, asistio: 19, faltas: 2, tardanzas: 0 },
    { mes: "Junio",  dias: 20, asistio: 19, faltas: 0, tardanzas: 1 },
    { mes: "Julio",  dias: 10, asistio: 10, faltas: 0, tardanzas: 0 },
    { mes: "Agosto", dias: 22, asistio: 19, faltas: 2, tardanzas: 1 },
  ],
};

const documentos = [
  { nombre: "DNI del estudiante", tipo: "Identidad",    estado: "Cargado",   fecha: "2026-02-20", tamaño: "1.2 MB" },
  { nombre: "Partida de nacimiento", tipo: "Identidad", estado: "Cargado",   fecha: "2026-02-20", tamaño: "0.8 MB" },
  { nombre: "Foto 4×4",              tipo: "Fotografía", estado: "Cargado",   fecha: "2026-02-20", tamaño: "0.3 MB" },
  { nombre: "Libreta de notas 2025", tipo: "Académico",  estado: "Cargado",   fecha: "2026-02-18", tamaño: "2.1 MB" },
  { nombre: "Constancia de estudios",tipo: "Académico",  estado: "Pendiente", fecha: "—",          tamaño: "—" },
  { nombre: "Ficha de salud",        tipo: "Salud",      estado: "Cargado",   fecha: "2026-02-20", tamaño: "0.5 MB" },
  { nombre: "Vacunación COVID-19",   tipo: "Salud",      estado: "Cargado",   fecha: "2026-02-20", tamaño: "0.4 MB" },
];

const infoAdmin = {
  observaciones: "Estudiante con buen rendimiento académico. Se recomienda refuerzo en Inglés. Participó en el concurso de Matemáticas interescolar 2025.",
  becas: "Beca parcial — 30% de descuento en pensión mensual",
  condicionEconomica: "Media",
  modalidadPago: "Mensual",
  fechaUltimoPago: "2026-08-05",
  estadoPago: "Al día",
  observacionesSalud: "Asma leve controlada. Tiene inhalador en el aula.",
  registradoPor: "Admin Principal",
  fechaRegistro: "2026-02-20",
  ultimaActualizacion: "2026-08-30",
};

// ── Shared ────────────────────────────────────────────────────────────────────

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: bg, color }}>{children}</span>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b last:border-b-0" style={{ borderColor: "#2e3939" }}>
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs text-white font-medium ${mono ? "font-mono" : ""}`}
        style={{ fontFamily: mono ? "monospace" : "var(--font-body)" }}>
        {value}
      </span>
    </div>
  );
}

function Card({ title, icon, children }: { title?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
      {title && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: "#2e3939" }}>
          {icon && <span className="text-[#00ADEB]">{icon}</span>}
          <p className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{title}</p>
        </div>
      )}
      {children}
    </div>
  );
}

function NoteTag({ value, label }: { value: number | null; label: string }) {
  if (value === null) return <span className="text-gray-600 text-xs">—</span>;
  const color = value >= 14 ? "#10B981" : value >= 11 ? "#F59E0B" : "#EF4444";
  return (
    <div className="text-center">
      <p className="text-sm font-bold" style={{ color, fontFamily: "var(--font-display)" }}>{value}</p>
      <p className="text-[10px] text-gray-600">{label}</p>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = "personal" | "responsables" | "matriculas" | "historial" | "asistencia" | "calificaciones" | "documentos" | "admin";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "personal",       label: "Información personal", icon: User },
  { id: "responsables",   label: "Responsables",          icon: Users },
  { id: "matriculas",     label: "Matrículas",            icon: ClipboardList },
  { id: "historial",      label: "Historial académico",   icon: TrendingUp },
  { id: "asistencia",     label: "Asistencia",            icon: Calendar },
  { id: "calificaciones", label: "Calificaciones",        icon: Star },
  { id: "documentos",     label: "Documentos",            icon: FileText },
  { id: "admin",          label: "Información adm.",      icon: Settings },
];

// ── Tab contents ──────────────────────────────────────────────────────────────

function TabPersonal({ student }: { student: Student }) {
  const [editing, setEditing] = useState(false);
  const [obs, setObs] = useState("Estudiante participativa y responsable. Sin observaciones relevantes.");

  const yesNo = (v: boolean) => v
    ? <Badge color="#10B981" bg="#10B98120"><CheckCircle size={9} />Sí</Badge>
    : <Badge color="#EF4444" bg="#EF444420"><XCircle size={9} />No</Badge>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Left column */}
      <div className="xl:col-span-2 space-y-4">
        <Card title="Datos de identificación" icon={<User size={13} />}>
          <InfoRow label="Nombres completos" value={`${student.nombres} ${student.apellidos}`} />
          <InfoRow label="NIE" value={student.nie} mono />
          <InfoRow label="Código de estudiante" value={student.codigo} mono />
          <InfoRow label="Fecha de nacimiento" value={new Date(student.fechaNacimiento).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })} />
          <InfoRow label="Edad" value={`${student.edad} años`} />
          <InfoRow label="Sexo" value={student.sexo === "M" ? "Masculino" : "Femenino"} />
          <InfoRow label="Nacionalidad" value={student.nacionalidad} />
          <InfoRow label="Tipo de sangre" value={
            <Badge color="#EF4444" bg="#EF444420"><Droplets size={9} />{student.tipoSangre}</Badge>
          } />
        </Card>

        <Card title="Información de salud" icon={<Heart size={13} />}>
          <InfoRow label="¿Padece alguna enfermedad?" value={yesNo(student.padeceEnfermedad)} />
          {student.padeceEnfermedad && <InfoRow label="Tipo de enfermedad" value={student.tipoEnfermedad} />}
          <InfoRow label="¿Toma medicamento?" value={yesNo(student.tomaMedicamento)} />
          {student.tomaMedicamento && <InfoRow label="Medicamento" value={student.nombreMedicamento} />}
          <InfoRow label="¿Posee discapacidad?" value={yesNo(student.poseeDiscapacidad)} />
          {student.poseeDiscapacidad && <InfoRow label="Tipo de discapacidad" value={student.tipoDiscapacidad} />}
          <InfoRow label="¿Es alérgico?" value={yesNo(student.eserAlergico)} />
          {student.eserAlergico && <InfoRow label="Alergia a" value={student.medicamentoAlergia} />}
          <InfoRow label="Vacunado COVID-19" value={yesNo(student.vacunadoCovid)} />
        </Card>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <Card title="Situación académica" icon={<GraduationCap size={13} />}>
          <InfoRow label="Grado actual" value={student.grado} />
          <InfoRow label="Sección" value={`Sección ${student.seccion}`} />
          <InfoRow label="Ciclo" value={student.ciclo} />
          <InfoRow label="Estado" value={
            <Badge
              color={student.estado === "Activo" ? "#10B981" : "#EF4444"}
              bg={student.estado === "Activo" ? "#10B98120" : "#EF444420"}>
              {student.estado}
            </Badge>
          } />
          <InfoRow label="¿Repite grado?" value={yesNo(student.repiteGrado)} />
          {student.repiteGrado && <InfoRow label="Año grado anterior" value={student.anioGradoAnterior} />}
        </Card>

        <Card title="Observaciones" icon={<FileText size={13} />}>
          {editing ? (
            <div className="space-y-3">
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={5}
                className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none resize-none"
                style={{ background: "#1F2525", border: "1px solid #00ADEB" }} />
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
                  style={{ background: "#1F2525", fontFamily: "var(--font-display)" }}>Cancelar</button>
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "#00ADEB", fontFamily: "var(--font-display)" }}>Guardar</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-300 leading-relaxed">{obs}</p>
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs text-[#00ADEB] hover:underline">
                <Pencil size={11} />Editar observaciones
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function TabResponsables() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{responsables.length} responsable{responsables.length !== 1 ? "s" : ""} registrado{responsables.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
          <Plus size={13} />Agregar responsable
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {responsables.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: r.principal ? "linear-gradient(135deg,#00ADEB,#107A9F)" : "#2e3939" }}>
                {r.nombre.split(" ").slice(0, 2).map((n) => n[0]).join("")}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{r.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color="#00ADEB" bg="#00ADEB20">{r.relacion}</Badge>
                      {r.principal && <Badge color="#F59E0B" bg="#F59E0B20"><Star size={9} />Principal</Badge>}
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-[#2e3939] text-gray-500 hover:text-[#F59E0B] transition-colors">
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-0">
              <InfoRow label="DNI" value={r.dni} mono />
              <InfoRow label="Teléfono" value={<a href={`tel:${r.telefono}`} className="text-[#00ADEB] hover:underline">{r.telefono}</a>} />
              <InfoRow label="Correo" value={<a href={`mailto:${r.correo}`} className="text-[#00ADEB] hover:underline truncate block max-w-48">{r.correo}</a>} />
              <InfoRow label="Dirección" value={r.direccion} />
              <InfoRow label="Ocupación" value={r.ocupacion} />
              <InfoRow label="Centro de trabajo" value={r.lugarTrabajo} />
            </div>
          </Card>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-lg rounded-2xl border" style={{ background: "#1F2525", borderColor: "#2e3939" }}>
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#2e3939" }}>
              <h2 className="text-white font-bold" style={{ fontFamily: "var(--font-display)" }}>Agregar responsable</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-3">
              {["Nombre completo", "DNI", "Relación", "Teléfono", "Correo electrónico", "Dirección", "Ocupación", "Lugar de trabajo"].map((label) => (
                <div key={label} className={label === "Nombre completo" || label === "Dirección" || label === "Correo electrónico" ? "col-span-2" : ""}>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5">{label}</label>
                  <input placeholder={label} className="w-full bg-[#263030] border border-[#2e3939] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#00ADEB] transition-colors placeholder-gray-600" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "#2e3939" }}>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors">Cancelar</button>
              <button onClick={() => setModalOpen(false)} className="px-5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabMatriculas() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">{matriculas.length} matrícula{matriculas.length !== 1 ? "s" : ""} registrada{matriculas.length !== 1 ? "s" : ""}</p>
      <div className="space-y-3">
        {matriculas.map((m, i) => (
          <div key={i} className="rounded-xl border p-4 flex items-center gap-4"
            style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${i === 0 ? "text-white" : "text-gray-400"}`}
              style={{ background: i === 0 ? "linear-gradient(135deg,#00ADEB,#107A9F)" : "#2e3939" }}>
              {m.ciclo.slice(-4)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{m.ciclo}</p>
              <p className="text-xs text-gray-400">{m.grado} — Sección {m.seccion} · {m.modalidad}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Matriculado el {new Date(m.fechaMatricula).toLocaleDateString("es-PE")}</p>
              <Badge
                color={m.estado === "Activo" ? "#10B981" : "#9CA3AF"}
                bg={m.estado === "Activo" ? "#10B98120" : "#6B728020"}>
                {m.estado}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabHistorial() {
  const [expandido, setExpandido] = useState<number | null>(0);
  return (
    <div className="space-y-4">
      {historialAcademico.map((h, i) => (
        <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: "#2e3939" }}>
          <button onClick={() => setExpandido(expandido === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-4 transition-colors hover:bg-[#2e3939]/40"
            style={{ background: "#263030" }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>
                {h.ciclo}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{h.grado}</p>
                <Badge color={h.promedio >= 14 ? "#10B981" : "#F59E0B"} bg={h.promedio >= 14 ? "#10B98120" : "#F59E0B20"}>
                  {h.estado}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{h.promedio}</p>
                <p className="text-[10px] text-gray-500">Promedio general</p>
              </div>
              <ChevronRight size={16} className={`text-gray-500 transition-transform ${expandido === i ? "rotate-90" : ""}`} />
            </div>
          </button>
          {expandido === i && (
            <div className="px-4 pb-4 space-y-2" style={{ background: "#1F2525" }}>
              <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {h.materias.map((m) => (
                  <div key={m.nombre} className="rounded-lg p-3 border text-center" style={{ background: "#263030", borderColor: "#2e3939" }}>
                    <p className="text-lg font-bold mb-0.5" style={{
                      color: m.nota >= 14 ? "#10B981" : m.nota >= 11 ? "#F59E0B" : "#EF4444",
                      fontFamily: "var(--font-display)",
                    }}>{m.nota}</p>
                    <p className="text-[11px] text-gray-400">{m.nombre}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TabAsistencia() {
  const { resumen, meses } = asistencia;
  const pct = resumen.porcentaje;
  const color = pct >= 95 ? "#10B981" : pct >= 85 ? "#F59E0B" : "#EF4444";

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Días hábiles", value: resumen.totalDias, color: "#00ADEB" },
          { label: "Asistencias", value: resumen.asistio,    color: "#10B981" },
          { label: "Faltas",      value: resumen.faltas,     color: "#EF4444" },
          { label: "Tardanzas",   value: resumen.tardanzas,  color: "#F59E0B" },
          { label: "% Asistencia",value: `${pct}%`,          color },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: "#263030", borderColor: "#2e3939" }}>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Porcentaje de asistencia 2026</p>
          <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full" style={{ background: "#2e3939" }}>
          <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
        </div>
        <p className="text-[11px] text-gray-500 mt-1.5">Meta institucional: 95% · {pct >= 95 ? "✓ Cumplida" : `Faltan ${(95 - pct).toFixed(1)} puntos porcentuales`}</p>
      </div>

      {/* By month */}
      <Card title="Detalle por mes" icon={<Calendar size={13} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #2e3939" }}>
                {["Mes", "Días hábiles", "Asistió", "Faltas", "Tardanzas", "Porcentaje"].map((h) => (
                  <th key={h} className="pb-3 text-left font-semibold text-gray-400 pr-6 last:pr-0"
                    style={{ fontFamily: "var(--font-display)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meses.map((m) => {
                const p = ((m.asistio / m.dias) * 100).toFixed(0);
                const mc = Number(p) >= 95 ? "#10B981" : Number(p) >= 85 ? "#F59E0B" : "#EF4444";
                return (
                  <tr key={m.mes} className="border-b last:border-b-0" style={{ borderColor: "#2e3939" }}>
                    <td className="py-2.5 pr-6 text-white font-medium">{m.mes}</td>
                    <td className="py-2.5 pr-6 text-gray-300">{m.dias}</td>
                    <td className="py-2.5 pr-6 text-gray-300">{m.asistio}</td>
                    <td className="py-2.5 pr-6">
                      {m.faltas > 0 ? <span style={{ color: "#EF4444" }}>{m.faltas}</span> : <span className="text-gray-600">0</span>}
                    </td>
                    <td className="py-2.5 pr-6">
                      {m.tardanzas > 0 ? <span style={{ color: "#F59E0B" }}>{m.tardanzas}</span> : <span className="text-gray-600">0</span>}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "#2e3939" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${p}%`, background: mc }} />
                        </div>
                        <span className="text-[11px] font-semibold w-8 text-right" style={{ color: mc }}>{p}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TabCalificaciones() {
  const promedioGeneral = (calificaciones.reduce((a, c) => a + c.promedio, 0) / calificaciones.length).toFixed(1);
  const bimestres = ["B1", "B2", "B3*", "B4*"];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white"
          style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
          {promedioGeneral}
        </div>
        <div>
          <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Promedio general</p>
          <p className="text-xs text-gray-400">{calificaciones.length} asignaturas · Año Escolar 2026</p>
          <div className="flex gap-2 mt-1.5">
            <Badge color="#10B981" bg="#10B98120"><CheckCircle size={9} />{calificaciones.filter((c) => c.promedio >= 14).length} aprobadas</Badge>
            <Badge color="#F59E0B" bg="#F59E0B20"><AlertTriangle size={9} />{calificaciones.filter((c) => c.promedio >= 11 && c.promedio < 14).length} en proceso</Badge>
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[11px] text-gray-500">* Bimestres pendientes</p>
          <p className="text-[11px] text-gray-500">Escala vigesimal (0–20)</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
              <th className="px-4 py-3 text-left font-semibold text-gray-400 w-48" style={{ fontFamily: "var(--font-display)" }}>Asignatura</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-400" style={{ fontFamily: "var(--font-display)" }}>Docente</th>
              {bimestres.map((b) => (
                <th key={b} className="px-4 py-3 text-center font-semibold text-gray-400" style={{ fontFamily: "var(--font-display)" }}>{b}</th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-gray-400" style={{ fontFamily: "var(--font-display)" }}>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {calificaciones.map((c) => {
              const notas = [c.b1, c.b2, c.b3, c.b4];
              const promColor = c.promedio >= 14 ? "#10B981" : c.promedio >= 11 ? "#F59E0B" : "#EF4444";
              return (
                <tr key={c.materia} className="border-b last:border-b-0 hover:bg-[#2e3939]/40 transition-colors"
                  style={{ borderColor: "#2e3939" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "#107A9F20" }}>
                        <BookOpen size={11} className="text-[#107A9F]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{c.materia}</p>
                        <p className="text-[10px] font-mono text-gray-600">{c.codigo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{c.docente}</td>
                  {notas.map((n, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      <NoteTag value={n} label="" />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold" style={{ color: promColor, fontFamily: "var(--font-display)" }}>
                      {c.promedio.toFixed(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabDocumentos() {
  const tipoColors: Record<string, string> = {
    Identidad: "#00ADEB", Fotografía: "#A78BFA", Académico: "#10B981", Salud: "#EF4444",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {documentos.filter((d) => d.estado === "Cargado").length} de {documentos.length} documentos cargados
        </p>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
          <Upload size={13} />Subir documento
        </button>
      </div>

      <div className="space-y-2">
        {documentos.map((d, i) => (
          <div key={i} className="rounded-xl border p-4 flex items-center gap-4 hover:border-[#00ADEB]/20 transition-all"
            style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${tipoColors[d.tipo] ?? "#9CA3AF"}20` }}>
              <FileText size={16} style={{ color: tipoColors[d.tipo] ?? "#9CA3AF" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "var(--font-display)" }}>{d.nombre}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge color={tipoColors[d.tipo] ?? "#9CA3AF"} bg={`${tipoColors[d.tipo] ?? "#9CA3AF"}20`}>{d.tipo}</Badge>
                <span className="text-[11px] text-gray-500">{d.tamaño}</span>
                {d.fecha !== "—" && <span className="text-[11px] text-gray-600">{new Date(d.fecha).toLocaleDateString("es-PE")}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {d.estado === "Cargado" ? (
                <>
                  <Badge color="#10B981" bg="#10B98120"><CheckCircle size={9} />Cargado</Badge>
                  <button className="p-1.5 rounded-lg hover:bg-[#2e3939] text-gray-500 hover:text-[#00ADEB] transition-colors" title="Ver">
                    <Eye size={13} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-[#2e3939] text-gray-500 hover:text-[#10B981] transition-colors" title="Descargar">
                    <Download size={13} />
                  </button>
                </>
              ) : (
                <>
                  <Badge color="#F59E0B" bg="#F59E0B20"><Clock size={9} />Pendiente</Badge>
                  <button className="p-1.5 rounded-lg hover:bg-[#2e3939] text-gray-500 hover:text-[#00ADEB] transition-colors" title="Subir">
                    <Upload size={13} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabAdmin() {
  const [editObs, setEditObs] = useState(false);
  const [obs, setObs] = useState(infoAdmin.observaciones);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card title="Situación administrativa" icon={<Settings size={13} />}>
        <InfoRow label="Becas / beneficios" value={infoAdmin.becas} />
        <InfoRow label="Condición económica" value={infoAdmin.condicionEconomica} />
        <InfoRow label="Modalidad de pago" value={infoAdmin.modalidadPago} />
        <InfoRow label="Último pago" value={new Date(infoAdmin.fechaUltimoPago).toLocaleDateString("es-PE")} />
        <InfoRow label="Estado de pago" value={
          <Badge color="#10B981" bg="#10B98120"><CheckCircle size={9} />{infoAdmin.estadoPago}</Badge>
        } />
      </Card>

      <Card title="Registro del expediente" icon={<ClipboardList size={13} />}>
        <InfoRow label="Registrado por" value={infoAdmin.registradoPor} />
        <InfoRow label="Fecha de registro" value={new Date(infoAdmin.fechaRegistro).toLocaleDateString("es-PE")} />
        <InfoRow label="Última actualización" value={new Date(infoAdmin.ultimaActualizacion).toLocaleDateString("es-PE")} />
      </Card>

      <Card title="Observaciones de salud" icon={<Heart size={13} />}>
        <p className="text-xs text-gray-300 leading-relaxed">{infoAdmin.observacionesSalud}</p>
      </Card>

      <Card title="Observaciones generales" icon={<FileText size={13} />}>
        {editObs ? (
          <div className="space-y-3">
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={5}
              className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none resize-none"
              style={{ background: "#1F2525", border: "1px solid #00ADEB" }} />
            <div className="flex gap-2">
              <button onClick={() => setEditObs(false)} className="flex-1 py-1.5 rounded-lg text-xs font-medium text-gray-400" style={{ background: "#1F2525" }}>Cancelar</button>
              <button onClick={() => setEditObs(false)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#00ADEB" }}>Guardar</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-300 leading-relaxed">{obs}</p>
            <button onClick={() => setEditObs(true)} className="flex items-center gap-1.5 text-xs text-[#00ADEB] hover:underline">
              <Pencil size={11} />Editar
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { student: Student; onBack: () => void; }

export default function StudentRecord({ student, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  const estadoColor = student.estado === "Activo" ? "#10B981" : student.estado === "Inactivo" ? "#F59E0B" : "#EF4444";
  const estadoBg   = student.estado === "Activo" ? "#10B98120" : student.estado === "Inactivo" ? "#F59E0B20" : "#EF444420";

  return (
    <div className="space-y-5">
      {/* Back + header card */}
      <div>
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-4"
          style={{ fontFamily: "var(--font-display)" }}>
          <ArrowLeft size={14} />Volver a Gestión de Estudiantes
        </button>

        <div className="rounded-2xl border p-5"
          style={{ background: "linear-gradient(135deg,#161e1e 0%,#263030 100%)", borderColor: "#2e3939" }}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
                {student.nombres[0]}{student.apellidos[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ background: estadoColor, borderColor: "#161e1e" }}>
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {student.nombres} {student.apellidos}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px]" style={{ background: "#2e3939", color: "#9CA3AF" }}>
                      {student.codigo}
                    </span>
                    <Badge color={estadoColor} bg={estadoBg}>{student.estado}</Badge>
                    <Badge color="#00ADEB" bg="#00ADEB20">
                      {student.sexo === "M" ? "Masculino" : "Femenino"} · {student.edad} años
                    </Badge>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors hover:bg-[#2e3939] text-gray-300"
                  style={{ borderColor: "#2e3939", fontFamily: "var(--font-display)" }}>
                  <Pencil size={13} />Editar expediente
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                {[
                  { icon: <GraduationCap size={12} />, label: student.grado },
                  { icon: <Users size={12} />, label: `Sección ${student.seccion}` },
                  { icon: <Calendar size={12} />, label: student.ciclo },
                  { icon: <Activity size={12} />, label: `${asistencia.resumen.porcentaje}% asistencia` },
                  { icon: <Star size={12} />, label: `${(calificaciones.reduce((a, c) => a + c.promedio, 0) / calificaciones.length).toFixed(1)} promedio` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="text-[#00ADEB]">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-all flex-shrink-0"
              style={{
                background: active ? "#00ADEB" : "#263030",
                color: active ? "#fff" : "#9CA3AF",
                border: `1px solid ${active ? "#00ADEB" : "#2e3939"}`,
                fontFamily: "var(--font-display)",
              }}>
              <tab.icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "personal"       && <TabPersonal student={student} />}
      {activeTab === "responsables"   && <TabResponsables />}
      {activeTab === "matriculas"     && <TabMatriculas />}
      {activeTab === "historial"      && <TabHistorial />}
      {activeTab === "asistencia"     && <TabAsistencia />}
      {activeTab === "calificaciones" && <TabCalificaciones />}
      {activeTab === "documentos"     && <TabDocumentos />}
      {activeTab === "admin"          && <TabAdmin />}
    </div>
  );
}
