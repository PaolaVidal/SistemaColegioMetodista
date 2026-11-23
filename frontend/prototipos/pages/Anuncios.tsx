import { useState, useMemo } from "react";
import {
  Plus, Search, X, Edit3, Archive, Send, Copy, Trash2,
  Bell, Users, GraduationCap, Calendar, User, Filter,
  RotateCcw, AlertTriangle, MessageSquare, FileText,
  ChevronRight, CheckCircle, Clock, Globe, BookOpen,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const AUTOR_DEFAULT = "Lic. Admin. Principal";
const TODAY = "2026-09-08";

const CATEGORIAS = ["General","Académico","Administrativo","Evento","Urgente"];

const PRIORIDAD_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  normal:     { bg: "#37415115", text: "#9CA3AF", dot: "#6B7280" },
  importante: { bg: "#F59E0B18", text: "#FBBF24", dot: "#F59E0B" },
  urgente:    { bg: "#EF444418", text: "#F87171", dot: "#EF4444" },
};

const ESTADO_COLORS: Record<string, { bg: string; text: string; label: string; icon: React.ComponentType<{size?:number;style?:React.CSSProperties}> }> = {
  borrador:  { bg: "#37415120", text: "#9CA3AF", label: "Borrador",  icon: Clock         },
  publicado: { bg: "#10B98120", text: "#10B981", label: "Publicado", icon: CheckCircle   },
  archivado: { bg: "#1E40AF20", text: "#60A5FA", label: "Archivado", icon: Archive       },
};

const CATEGORIA_ICONS: Record<string, React.ComponentType<{size?:number;style?:React.CSSProperties}>> = {
  General:        Globe,
  Académico:      BookOpen,
  Administrativo: FileText,
  Evento:         Calendar,
  Urgente:        AlertTriangle,
};

const DESTINATARIO_GROUPS = [
  { id:"todos",      label:"Toda la comunidad",  icon: Globe,           color:"#00ADEB" },
  { id:"docentes",   label:"Docentes",            icon: Users,           color:"#8B5CF6" },
  { id:"estudiantes",label:"Estudiantes",         icon: GraduationCap,   color:"#10B981" },
  { id:"padres",     label:"Padres y Encargados", icon: Users,           color:"#F59E0B" },
  { id:"admin",      label:"Administración",      icon: User,            color:"#107A9F" },
  { id:"1grado",     label:"1° Grado",            icon: GraduationCap,   color:"#EC4899" },
  { id:"2grado",     label:"2° Grado",            icon: GraduationCap,   color:"#EC4899" },
  { id:"3grado",     label:"3° Grado",            icon: GraduationCap,   color:"#EC4899" },
  { id:"4grado",     label:"4° Grado",            icon: GraduationCap,   color:"#EC4899" },
  { id:"5grado",     label:"5° Grado",            icon: GraduationCap,   color:"#EC4899" },
  { id:"6grado",     label:"6° Grado",            icon: GraduationCap,   color:"#EC4899" },
];

function destLabel(id: string) { return DESTINATARIO_GROUPS.find((g) => g.id === id)?.label ?? id; }

// ─── Types ────────────────────────────────────────────────────────────────────

type Estado    = "borrador" | "publicado" | "archivado";
type Prioridad = "normal" | "importante" | "urgente";

interface Anuncio {
  id: string;
  titulo: string;
  contenido: string;
  fecha: string;
  fechaPublicacion?: string;
  autor: string;
  destinatarios: string[];
  estado: Estado;
  prioridad: Prioridad;
  categoria: string;
  vistas: number;
}

type AnuncioForm = Omit<Anuncio, "id" | "vistas">;

// ─── Seed ─────────────────────────────────────────────────────────────────────

let _aid = 1;
function an(titulo: string, contenido: string, fecha: string, autor: string, destinatarios: string[], estado: Estado, prioridad: Prioridad, categoria: string, vistas = 0, fechaPublicacion?: string): Anuncio {
  return { id: `a${_aid++}`, titulo, contenido, fecha, fechaPublicacion, autor, destinatarios, estado, prioridad, categoria, vistas };
}

const SEED: Anuncio[] = [
  an(
    "Bienvenida al Año Escolar 2026",
    "Estimada comunidad educativa,\n\nEs un honor darles la más cordial bienvenida a un nuevo año escolar lleno de aprendizaje, crecimiento y logros. El equipo directivo y docente de nuestra institución se encuentra listo para acompañar a cada estudiante en su desarrollo integral.\n\nLes recordamos que las clases inician el lunes 2 de marzo de 2026 a las 7:00 a.m. Se solicita puntualidad y el uso del uniforme completo desde el primer día.\n\nEsperamos un año productivo y enriquecedor para todos.",
    "2026-02-15","Lic. Admin. Principal",["todos"],"publicado","importante","General",342,"2026-02-16"
  ),
  an(
    "Reunión general de padres de familia — I Bimestre",
    "Se convoca a todos los padres de familia y encargados legales a la reunión general del I Bimestre, donde se informará sobre el rendimiento académico, asistencia y observaciones de los docentes.\n\nFecha: Viernes 20 de marzo de 2026\nHora: 6:00 p.m. – 8:00 p.m.\nLugar: Auditorio principal\n\nSe ruega confirmar asistencia con el tutor del grado antes del 18 de marzo. En caso de no poder asistir, coordinar una cita individual con el docente de su hijo/a.",
    "2026-03-12","Lic. Admin. Principal",["padres"],"publicado","importante","Evento",218,"2026-03-13"
  ),
  an(
    "Actualización del calendario académico 2026",
    "Se informa a toda la comunidad educativa que el calendario académico ha sido actualizado en conformidad con las disposiciones del Ministerio de Educación.\n\nPrincipales cambios:\n• Semana de evaluaciones I Bimestre: 28 de septiembre al 2 de octubre\n• Entrega de libretas: 9 de octubre\n• Inicio II Bimestre: 12 de octubre\n• Feriado por fundación institucional: 7 de noviembre\n\nEl calendario completo está disponible en la recepción y en el portal de padres.",
    "2026-03-01","Lic. Admin. Principal",["todos"],"publicado","normal","Administrativo",187,"2026-03-02"
  ),
  an(
    "Protocolo de emergencias actualizado — Lectura obligatoria",
    "AVISO URGENTE\n\nSe ha actualizado el protocolo de emergencias de la institución conforme a la normativa vigente de seguridad escolar. Es de carácter OBLIGATORIO que todo el personal docente y administrativo lo lea y lo firme en señal de conocimiento antes del viernes 12 de septiembre de 2026.\n\nEl documento se encuentra disponible en la oficina de administración. Cualquier duda, comunicarse directamente con la Dirección.\n\nEl incumplimiento de este procedimiento será registrado en el expediente del personal.",
    "2026-09-05","Directora Gral.—Lic. Carmen Paredes",["docentes","admin"],"publicado","urgente","Urgente",95,"2026-09-05"
  ),
  an(
    "Evaluaciones del I Bimestre — Información importante",
    "Estimados estudiantes y padres de familia,\n\nSe les recuerda que las evaluaciones del I Bimestre se llevarán a cabo del 28 de septiembre al 2 de octubre de 2026. Durante este período no habrá clases regulares; cada franja horaria corresponderá a una evaluación específica según el horario que fue publicado en el sistema.\n\nRecomendaciones:\n• Revisar el horario de evaluaciones publicado en la plataforma\n• Presentarse con 10 minutos de anticipación\n• Portar material permitido: lápiz, borrador, regla\n• Respetar el silencio durante los exámenes\n\n¡Mucho éxito a todos!",
    "2026-09-01","Coordinación Académica",["estudiantes","padres"],"publicado","importante","Académico",263,"2026-09-02"
  ),
  an(
    "Taller de actualización pedagógica — Sábado 13 de septiembre",
    "Se convoca al cuerpo docente al taller de actualización pedagógica sobre estrategias de enseñanza activa y evaluación formativa.\n\nFecha: Sábado 13 de septiembre de 2026\nHorario: 8:00 a.m. – 1:00 p.m.\nLugar: Sala de capacitaciones (2° piso)\nPonente: Dr. Luis Espinoza — Universidad Nacional\n\nLa asistencia es obligatoria. Se emitirá certificado de participación. El refrigerio está incluido.",
    "2026-09-06","Coordinación Docente",["docentes"],"publicado","normal","Evento",74,"2026-09-07"
  ),
  an(
    "Actividad deportiva interescolar — Convocatoria",
    "Nos complace anunciar que nuestra institución participará en el campeonato deportivo interescolar 2026 organizado por la UGEL. Se convoca a estudiantes de 4°, 5° y 6° grado a inscribirse en las siguientes disciplinas:\n\n• Fútbol mixto\n• Voleibol femenino\n• Básquetbol masculino\n• Atletismo (individual)\n\nFecha límite de inscripción: 19 de septiembre. Comunicarse con el profesor Lic. Pedro Luna para más información.",
    "2026-09-07","Lic. Pedro Luna",["4grado","5grado","6grado"],"borrador","normal","Evento",0
  ),
  an(
    "Proceso de matrículas 2027 — Información anticipada",
    "Se informa a los padres de familia que el proceso de matrículas para el año escolar 2027 iniciará en el mes de noviembre de 2026.\n\nDocumentos requeridos:\n• DNI del estudiante (copia)\n• Partida de nacimiento\n• Libreta de notas 2026\n• Ficha de salud actualizada\n• 2 fotografías tamaño carnet\n• Comprobante de pago de matrícula\n\nMás detalles serán comunicados oportunamente.",
    "2026-09-04","Secretaría Académica",["padres"],"borrador","normal","Administrativo",0
  ),
  an(
    "Cierre del sistema para mantenimiento",
    "Se informa al personal administrativo que el sistema de gestión escolar estará fuera de servicio el domingo 14 de septiembre de 2026 de 8:00 a.m. a 6:00 p.m. por mantenimiento preventivo.\n\nSe solicita guardar toda la información pendiente antes de ese horario. Cualquier urgencia, comunicarse al correo de soporte técnico.",
    "2026-09-03","Área de Sistemas",["admin"],"borrador","normal","Administrativo",0
  ),
  an(
    "Reconocimiento a estudiantes destacados — I Bimestre 2025",
    "La institución se enorgullece en reconocer a los estudiantes que obtuvieron el más alto rendimiento académico durante el I Bimestre del año 2025. La ceremonia de reconocimiento se llevó a cabo el viernes 22 de agosto en el auditorio principal.\n\nFelicitamos a todos los estudiantes que, con esfuerzo y dedicación, alcanzaron sus metas. ¡Siguen siendo un ejemplo para toda la comunidad!",
    "2025-08-25","Lic. Admin. Principal",["todos"],"archivado","normal","General",156,"2025-08-22"
  ),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${months[Number(m)-1]} ${y}`;
}

function excerpt(text: string, max = 100): string {
  const clean = text.replace(/\n+/g, " ");
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

function initials(name: string) { return name.split(" ").slice(0,2).map((n)=>n[0]).join(""); }

// ─── Sub-components ────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: Estado }) {
  const s = ESTADO_COLORS[estado];
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.text }}>
      <Icon size={10} style={{ color: s.text }} />{s.label}
    </span>
  );
}

function PrioridadDot({ prioridad }: { prioridad: Prioridad }) {
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORIDAD_COLORS[prioridad].dot }} />;
}

function DestinatarioChip({ id }: { id: string }) {
  const g = DESTINATARIO_GROUPS.find((x) => x.id === id);
  if (!g) return null;
  const Icon = g.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
      style={{ background: `${g.color}15`, color: g.color, borderColor: `${g.color}30` }}>
      <Icon size={9} style={{ color: g.color }} />{g.label}
    </span>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function AnuncioFormPanel({ initial, onSave, onCancel, isNew }: {
  initial: Partial<AnuncioForm>;
  onSave: (f: AnuncioForm, publish: boolean) => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState<AnuncioForm>({
    titulo:          initial.titulo          ?? "",
    contenido:       initial.contenido       ?? "",
    fecha:           initial.fecha           ?? TODAY,
    autor:           initial.autor           ?? AUTOR_DEFAULT,
    destinatarios:   initial.destinatarios   ?? [],
    estado:          initial.estado          ?? "borrador",
    prioridad:       initial.prioridad       ?? "normal",
    categoria:       initial.categoria       ?? "General",
    fechaPublicacion:initial.fechaPublicacion,
  });

  function toggleDest(id: string) {
    if (id === "todos") {
      setForm((f) => ({ ...f, destinatarios: f.destinatarios.includes("todos") ? [] : ["todos"] }));
      return;
    }
    setForm((f) => {
      const cur = f.destinatarios.filter((d) => d !== "todos");
      return { ...f, destinatarios: cur.includes(id) ? cur.filter((d) => d !== id) : [...cur, id] };
    });
  }

  const valid = form.titulo.trim() && form.contenido.trim() && form.destinatarios.length > 0;

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-5 border-b flex-shrink-0" style={{ borderColor: "#2e3939" }}>
        <div>
          <p className="text-white font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
            {isNew ? "Nuevo anuncio" : "Editar anuncio"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Los borradores no son visibles para los destinatarios</p>
        </div>
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 hover:text-white transition-colors"><X size={15} /></button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
        <Field label="Título">
          <input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
            placeholder="Escribe el título del anuncio..."
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
            style={{ background: "#1F2525", border: "1px solid #2e3939", fontFamily: "var(--font-display)", fontWeight: 600 }} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Categoría">
            <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
              style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
              {CATEGORIAS.map((c) => <option key={c} value={c} style={{ background: "#1F2525" }}>{c}</option>)}
            </select>
          </Field>
          <Field label="Prioridad">
            <select value={form.prioridad} onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value as Prioridad }))}
              className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
              style={{ background: "#1F2525", border: "1px solid #2e3939", color: PRIORIDAD_COLORS[form.prioridad].text }}>
              <option value="normal"     style={{ background: "#1F2525", color: "#9CA3AF" }}>Normal</option>
              <option value="importante" style={{ background: "#1F2525", color: "#FBBF24" }}>Importante</option>
              <option value="urgente"    style={{ background: "#1F2525", color: "#F87171" }}>Urgente</option>
            </select>
          </Field>
          <Field label="Autor">
            <input value={form.autor} onChange={(e) => setForm((f) => ({ ...f, autor: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
              style={{ background: "#1F2525", border: "1px solid #2e3939" }} />
          </Field>
        </div>

        <Field label="Contenido">
          <textarea value={form.contenido} onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))}
            rows={10}
            placeholder="Escribe el contenido del anuncio..."
            className="w-full rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none leading-relaxed"
            style={{ background: "#1F2525", border: "1px solid #2e3939" }} />
        </Field>

        <Field label="Destinatarios">
          <div className="grid grid-cols-3 gap-2">
            {DESTINATARIO_GROUPS.map((g) => {
              const Icon = g.icon;
              const selected = form.destinatarios.includes(g.id) || (g.id !== "todos" && form.destinatarios.includes("todos"));
              const disabled = g.id !== "todos" && form.destinatarios.includes("todos");
              return (
                <button key={g.id} type="button"
                  onClick={() => !disabled && toggleDest(g.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all"
                  style={{
                    background: selected ? `${g.color}18` : "#1F2525",
                    borderColor: selected ? `${g.color}50` : "#2e3939",
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: selected ? `${g.color}25` : "#2e3939" }}>
                    <Icon size={11} style={{ color: selected ? g.color : "#6B7280" }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: selected ? g.color : "#6B7280", fontFamily: "var(--font-display)" }}>{g.label}</span>
                  {selected && !disabled && (
                    <span className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
                  )}
                </button>
              );
            })}
          </div>
          {form.destinatarios.length === 0 && (
            <p className="text-[11px] text-[#EF4444] mt-1.5">Selecciona al menos un destinatario</p>
          )}
        </Field>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-7 py-4 border-t flex-shrink-0" style={{ borderColor: "#2e3939" }}>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white border transition-colors" style={{ borderColor: "#2e3939" }}>
          Cancelar
        </button>
        <div className="flex gap-2">
          <button onClick={() => valid && onSave(form, false)} disabled={!valid}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40"
            style={{ borderColor: "#2e3939", color: "#9CA3AF", fontFamily: "var(--font-display)" }}>
            <FileText size={12} />Guardar borrador
          </button>
          <button onClick={() => valid && onSave(form, true)} disabled={!valid}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
            <Send size={12} />Publicar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail view ──────────────────────────────────────────────────────────────

function AnuncioDetail({ anuncio, onEdit, onPublish, onUnpublish, onArchive, onDuplicate, onDelete }: {
  anuncio: Anuncio;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const prCol = PRIORIDAD_COLORS[anuncio.prioridad];
  const catIcon = CATEGORIA_ICONS[anuncio.categoria] ?? Bell;
  const CatIcon = catIcon;

  return (
    <div className="flex flex-col h-full">
      {/* Action bar */}
      <div className="flex items-center justify-between px-7 py-4 border-b flex-shrink-0" style={{ borderColor: "#2e3939" }}>
        <div className="flex items-center gap-2">
          <EstadoBadge estado={anuncio.estado} />
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: prCol.bg, color: prCol.text }}>
            {anuncio.prioridad.charAt(0).toUpperCase() + anuncio.prioridad.slice(1)}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "#37415120", color: "#9CA3AF" }}>
            {anuncio.categoria}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {anuncio.estado !== "archivado" && (
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{ borderColor: "#2e3939", color: "#9CA3AF" }}>
              <Edit3 size={12} />Editar
            </button>
          )}
          {anuncio.estado === "borrador" && (
            <button onClick={onPublish}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
              <Send size={12} />Publicar
            </button>
          )}
          {anuncio.estado === "publicado" && (
            <button onClick={onUnpublish}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{ borderColor: "#2e3939", color: "#F59E0B" }}>
              <FileText size={12} />Pasar a borrador
            </button>
          )}
          {anuncio.estado !== "archivado" && (
            <button onClick={onArchive} title="Archivar"
              className="p-1.5 rounded-lg border text-gray-500 hover:text-[#60A5FA] hover:border-[#1E40AF] transition-colors"
              style={{ borderColor: "#2e3939" }}>
              <Archive size={14} />
            </button>
          )}
          <button onClick={onDuplicate} title="Duplicar"
            className="p-1.5 rounded-lg border text-gray-500 hover:text-gray-300 transition-colors"
            style={{ borderColor: "#2e3939" }}>
            <Copy size={14} />
          </button>
          <button onClick={onDelete} title="Eliminar"
            className="p-1.5 rounded-lg border text-gray-500 hover:text-[#EF4444] hover:border-[#EF4444] transition-colors"
            style={{ borderColor: "#2e3939" }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
        {/* Title */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: prCol.bg }}>
            <CatIcon size={18} style={{ color: prCol.text }} />
          </div>
          <h2 className="text-2xl font-bold text-white leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            {anuncio.titulo}
          </h2>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-5 pb-5 border-b text-xs" style={{ borderColor: "#2e3939" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#107A9F,#00ADEB)" }}>
              {initials(anuncio.autor)}
            </div>
            <div>
              <p className="text-white font-semibold" style={{ fontFamily: "var(--font-display)" }}>{anuncio.autor}</p>
              <p className="text-gray-500 text-[10px]">Autor</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar size={12} className="text-gray-600" />
            <span>Creado: {fmtDate(anuncio.fecha)}</span>
          </div>
          {anuncio.fechaPublicacion && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Send size={11} className="text-[#00ADEB]" />
              <span>Publicado: {fmtDate(anuncio.fechaPublicacion)}</span>
            </div>
          )}
          {anuncio.vistas > 0 && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <MessageSquare size={11} className="text-gray-600" />
              <span>{anuncio.vistas} vistas</span>
            </div>
          )}
        </div>

        {/* Destinatarios */}
        <div>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Destinatarios</p>
          <div className="flex flex-wrap gap-2">
            {anuncio.destinatarios.map((d) => <DestinatarioChip key={d} id={d} />)}
          </div>
        </div>

        {/* Body */}
        <div className="rounded-2xl border p-6 space-y-2" style={{ background: "#1F2525", borderColor: "#2e3939" }}>
          <p className="text-sm text-gray-200 leading-7 whitespace-pre-line">{anuncio.contenido}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type RightMode = "view" | "create" | "edit";

export default function Anuncios() {
  const [anuncios,     setAnuncios]    = useState<Anuncio[]>(SEED);
  const [selectedId,   setSelectedId]  = useState<string>(SEED[0].id);
  const [rightMode,    setRightMode]   = useState<RightMode>("view");
  const [search,       setSearch]      = useState("");
  const [filterEstado, setFilterEstado]= useState<Estado | "">("");
  const [filterCateg,  setFilterCateg] = useState("");

  const nextId = { current: 100 };

  const filtered = useMemo(() => anuncios.filter((a) => {
    const q = search.toLowerCase();
    return (!q || a.titulo.toLowerCase().includes(q) || a.contenido.toLowerCase().includes(q) || a.autor.toLowerCase().includes(q))
      && (!filterEstado || a.estado === filterEstado)
      && (!filterCateg  || a.categoria === filterCateg);
  }).sort((a, b) => {
    const rank = { urgente:0, importante:1, normal:2 };
    if (a.estado === "archivado" && b.estado !== "archivado") return 1;
    if (b.estado === "archivado" && a.estado !== "archivado") return -1;
    return (rank[a.prioridad] - rank[b.prioridad]) || b.fecha.localeCompare(a.fecha);
  }), [anuncios, search, filterEstado, filterCateg]);

  const selected = anuncios.find((a) => a.id === selectedId) ?? null;
  const hasFilters = !!(search || filterEstado || filterCateg);

  function updateAnuncio(id: string, patch: Partial<Anuncio>) {
    setAnuncios((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
  }

  function handleSave(form: AnuncioForm, publish: boolean) {
    const now: Partial<Anuncio> = {
      ...form,
      estado: publish ? "publicado" : "borrador",
      fechaPublicacion: publish ? TODAY : undefined,
    };
    if (rightMode === "create") {
      const newId = `a${nextId.current++}`;
      const newAnuncio: Anuncio = { ...now as AnuncioForm, id: newId, vistas: 0 };
      setAnuncios((prev) => [newAnuncio, ...prev]);
      setSelectedId(newId);
    } else {
      updateAnuncio(selectedId, now);
    }
    setRightMode("view");
  }

  function handlePublish()   { updateAnuncio(selectedId, { estado:"publicado", fechaPublicacion: TODAY }); }
  function handleUnpublish() { updateAnuncio(selectedId, { estado:"borrador", fechaPublicacion: undefined }); }
  function handleArchive()   { updateAnuncio(selectedId, { estado:"archivado" }); setRightMode("view"); }
  function handleDelete() {
    setAnuncios((prev) => prev.filter((a) => a.id !== selectedId));
    const remaining = anuncios.filter((a) => a.id !== selectedId);
    setSelectedId(remaining[0]?.id ?? "");
    setRightMode("view");
  }
  function handleDuplicate() {
    if (!selected) return;
    const newId = `a${nextId.current++}`;
    const copy: Anuncio = { ...selected, id: newId, titulo: `Copia de ${selected.titulo}`, estado:"borrador", fechaPublicacion: undefined, fecha: TODAY, vistas: 0 };
    setAnuncios((prev) => [copy, ...prev]);
    setSelectedId(newId);
    setRightMode("view");
  }

  // Counts for tab summary
  const counts = useMemo(() => ({
    publicado: anuncios.filter((a)=>a.estado==="publicado").length,
    borrador:  anuncios.filter((a)=>a.estado==="borrador").length,
    archivado: anuncios.filter((a)=>a.estado==="archivado").length,
  }), [anuncios]);

  return (
    <div className="flex gap-4 h-full" style={{ minHeight: 0 }}>
      {/* ── Left panel ── */}
      <div className="flex flex-col flex-shrink-0 rounded-2xl border overflow-hidden" style={{ width: 400, background: "#263030", borderColor: "#2e3939" }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-4 border-b flex-shrink-0" style={{ borderColor: "#2e3939" }}>
          <div>
            <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Comunicados</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{counts.publicado} publicados · {counts.borrador} borradores</p>
          </div>
          <button
            onClick={() => { setRightMode("create"); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
            <Plus size={13} />Nuevo
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b flex-shrink-0" style={{ borderColor: "#2e3939" }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Search size={12} className="text-gray-500 flex-shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar anuncio..." className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-full" />
            {search && <button onClick={() => setSearch("")}><X size={11} className="text-gray-500" /></button>}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{ borderColor: "#2e3939" }}>
          <Filter size={11} className="text-gray-600 flex-shrink-0" />
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as Estado | "")}
            className="bg-transparent outline-none text-[11px] text-gray-400 flex-1">
            <option value="" style={{ background: "#1F2525" }}>Todos los estados</option>
            {Object.entries(ESTADO_COLORS).map(([k,v]) => <option key={k} value={k} style={{ background:"#1F2525" }}>{v.label}</option>)}
          </select>
          <select value={filterCateg} onChange={(e) => setFilterCateg(e.target.value)}
            className="bg-transparent outline-none text-[11px] text-gray-400 flex-1">
            <option value="" style={{ background: "#1F2525" }}>Todas las categorías</option>
            {CATEGORIAS.map((c) => <option key={c} value={c} style={{ background:"#1F2525" }}>{c}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(""); setFilterEstado(""); setFilterCateg(""); }}
              className="p-1 rounded text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0">
              <RotateCcw size={11} />
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "#2e3939" }}>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Bell size={32} className="text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">Sin anuncios</p>
              <p className="text-xs text-gray-600 mt-1">Crea el primer comunicado</p>
            </div>
          )}
          {filtered.map((a) => {
            const isSelected = a.id === selectedId && rightMode !== "create";
            const prCol = PRIORIDAD_COLORS[a.prioridad];
            const CatIcon = CATEGORIA_ICONS[a.categoria] ?? Bell;
            return (
              <button key={a.id}
                onClick={() => { setSelectedId(a.id); setRightMode("view"); }}
                className="w-full text-left px-4 py-3.5 transition-all relative group"
                style={{
                  background: isSelected ? "#1F2525" : "transparent",
                  borderLeft: `3px solid ${isSelected ? "#00ADEB" : prCol.dot}`,
                }}>
                {/* Header */}
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: prCol.bg }}>
                    <CatIcon size={11} style={{ color: prCol.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white leading-tight truncate pr-2"
                      style={{ fontFamily: "var(--font-display)" }}>{a.titulo}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{a.autor}</p>
                  </div>
                  <EstadoBadge estado={a.estado} />
                </div>
                {/* Excerpt */}
                <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 ml-8">{excerpt(a.contenido, 90)}</p>
                {/* Footer */}
                <div className="flex items-center justify-between mt-2 ml-8">
                  <div className="flex flex-wrap gap-1">
                    {a.destinatarios.slice(0,2).map((d) => (
                      <span key={d} className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${DESTINATARIO_GROUPS.find(g=>g.id===d)?.color ?? "#6B7280"}15`, color: DESTINATARIO_GROUPS.find(g=>g.id===d)?.color ?? "#6B7280" }}>
                        {destLabel(d)}
                      </span>
                    ))}
                    {a.destinatarios.length > 2 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background:"#37415120", color:"#6B7280" }}>+{a.destinatarios.length-2}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-600 whitespace-nowrap">{fmtDate(a.fecha)}</span>
                </div>
                {isSelected && <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ADEB]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 rounded-2xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
        {rightMode === "create" ? (
          <AnuncioFormPanel
            initial={{}}
            isNew
            onSave={handleSave}
            onCancel={() => setRightMode("view")}
          />
        ) : rightMode === "edit" && selected ? (
          <AnuncioFormPanel
            initial={selected}
            isNew={false}
            onSave={handleSave}
            onCancel={() => setRightMode("view")}
          />
        ) : selected ? (
          <AnuncioDetail
            anuncio={selected}
            onEdit={() => setRightMode("edit")}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onArchive={handleArchive}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#1F2525" }}>
              <Bell size={28} className="text-gray-600" />
            </div>
            <p className="text-base font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Sin selección</p>
            <p className="text-sm text-gray-500 mt-1">Selecciona un anuncio de la lista o crea uno nuevo</p>
            <button onClick={() => setRightMode("create")}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
              <Plus size={14} />Nuevo anuncio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
