import { useState, useMemo } from "react";
import {
  Search, X, Filter, RotateCcw, Shield, ChevronLeft, ChevronRight,
  Eye, User, Clock, ArrowRight, Plus, Edit3, Trash2, LogIn, LogOut,
  Download, BookOpen, AlertTriangle,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AccionType = "Creación" | "Modificación" | "Eliminación" | "Inicio de sesión" | "Cierre de sesión" | "Exportación" | "Consulta";
type ModuloType = "Usuarios" | "Matrículas" | "Calificaciones" | "Asistencia" | "Horarios" | "Pagos" | "Académico" | "Reportes" | "Comunicados" | "Autenticación";
type RolType = "Administrador" | "Docente" | "Secretaria" | "Director";

interface CambioField { campo: string; anterior: string; nuevo: string }

interface AuditEntry {
  id: string;
  fecha: string;
  hora: string;
  usuario: string;
  rol: RolType;
  modulo: ModuloType;
  accion: AccionType;
  registro: string;
  ip: string;
  cambios?: CambioField[];
  detalle: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const ACCION_STYLE: Record<AccionType, { bg: string; text: string; icon: React.ComponentType<{size?:number}> }> = {
  "Creación":          { bg:"#10B98120", text:"#10B981", icon: Plus       },
  "Modificación":      { bg:"#00ADEB20", text:"#00ADEB", icon: Edit3      },
  "Eliminación":       { bg:"#EF444420", text:"#EF4444", icon: Trash2     },
  "Inicio de sesión":  { bg:"#8B5CF620", text:"#8B5CF6", icon: LogIn      },
  "Cierre de sesión":  { bg:"#37415130", text:"#9CA3AF", icon: LogOut     },
  "Exportación":       { bg:"#F59E0B20", text:"#F59E0B", icon: Download   },
  "Consulta":          { bg:"#107A9F20", text:"#60A5FA", icon: BookOpen   },
};

const MODULO_COLORS: Record<ModuloType, string> = {
  Usuarios:      "#8B5CF6",
  Matrículas:    "#EC4899",
  Calificaciones:"#00ADEB",
  Asistencia:    "#10B981",
  Horarios:      "#F59E0B",
  Pagos:         "#10B981",
  Académico:     "#107A9F",
  Reportes:      "#6366F1",
  Comunicados:   "#F87171",
  Autenticación: "#9CA3AF",
};

const ROL_COLORS: Record<RolType, string> = {
  Administrador: "#00ADEB",
  Docente:       "#10B981",
  Secretaria:    "#8B5CF6",
  Director:      "#F59E0B",
};

// ─── Seed data ─────────────────────────────────────────────────────────────────

let _uid = 1;
function ae(
  fecha:string, hora:string, usuario:string, rol:RolType,
  modulo:ModuloType, accion:AccionType, registro:string, ip:string, detalle:string,
  cambios?: CambioField[]
): AuditEntry {
  return { id:`AUD-${String(_uid++).padStart(4,"0")}`, fecha, hora, usuario, rol, modulo, accion, registro, ip, cambios, detalle };
}

const SEED: AuditEntry[] = [
  ae("2026-09-08","10:41","Admin Principal","Administrador","Usuarios","Modificación","Usuario #U-004 — Prof. Carlos Ruiz","192.168.1.10","Modificación de datos del usuario","[{\"campo\":\"Email\",\"anterior\":\"c.ruiz@edu.pe\",\"nuevo\":\"carlos.ruiz@edu.pe\"},{\"campo\":\"Teléfono\",\"anterior\":\"945-123-456\",\"nuevo\":\"945-987-654\"},{\"campo\":\"Estado\",\"anterior\":\"Inactivo\",\"nuevo\":\"Activo\"}]".slice(0) as unknown as CambioField[]),
  ae("2026-09-08","10:35","Admin Principal","Administrador","Matrículas","Creación","Matrícula #MAT-2026-047 — Valentina Cruz","192.168.1.10","Registro de nueva matrícula",[{campo:"Estudiante",anterior:"—",nuevo:"Valentina Cruz Romero"},{campo:"Grado",anterior:"—",nuevo:"2° Grado - Sección B"},{campo:"Estado",anterior:"—",nuevo:"Activo"},{campo:"Año",anterior:"—",nuevo:"2026"}]),
  ae("2026-09-08","10:22","Lic. Carmen Paredes","Director","Comunicados","Creación","Anuncio: Protocolo de emergencias actualizado","192.168.1.5","Publicación de comunicado institucional",[{campo:"Título",anterior:"—",nuevo:"Protocolo de emergencias actualizado"},{campo:"Estado",anterior:"—",nuevo:"Publicado"},{campo:"Destinatarios",anterior:"—",nuevo:"Docentes, Administración"}]),
  ae("2026-09-08","09:58","Prof. Ana Delgado","Docente","Calificaciones","Modificación","Nota Bimestral — Diego Ríos / Matemática","192.168.1.31","Corrección de calificación",[{campo:"Nota I Bimestre",anterior:"09",nuevo:"10"},{campo:"Observación",anterior:"—",nuevo:"Error de transcripción corregido"}]),
  ae("2026-09-08","09:47","Secretaria López","Secretaria","Asistencia","Modificación","Registro de asistencia — 3° B / 08-09-2026","192.168.1.22","Justificación de falta registrada",[{campo:"Estado Carlos Mendoza",anterior:"Falta injustificada",nuevo:"Falta justificada"},{campo:"Motivo",anterior:"—",nuevo:"Certificado médico presentado"}]),
  ae("2026-09-08","09:30","Admin Principal","Administrador","Usuarios","Creación","Usuario #U-012 — Lic. Rosa Mamani","192.168.1.10","Creación de cuenta de docente",[{campo:"Nombre",anterior:"—",nuevo:"Rosa Mamani Quispe"},{campo:"Rol",anterior:"—",nuevo:"Docente"},{campo:"Módulos",anterior:"—",nuevo:"Calificaciones, Asistencia, Horarios"},{campo:"Estado",anterior:"—",nuevo:"Activo"}]),
  ae("2026-09-08","08:55","Admin Principal","Administrador","Autenticación","Inicio de sesión","Sesión — Admin Principal","192.168.1.10","Ingreso exitoso al sistema"),
  ae("2026-09-08","08:52","Secretaria López","Secretaria","Autenticación","Inicio de sesión","Sesión — Secretaria López","192.168.1.22","Ingreso exitoso al sistema"),
  ae("2026-09-07","17:45","Prof. Pedro Luna","Docente","Autenticación","Cierre de sesión","Sesión — Prof. Pedro Luna","192.168.1.40","Cierre de sesión normal"),
  ae("2026-09-07","17:30","Secretaria López","Secretaria","Reportes","Exportación","Reporte de Asistencia — Sep 2026","192.168.1.22","Exportación de reporte en PDF",[{campo:"Tipo de reporte",anterior:"—",nuevo:"Asistencia"},{campo:"Período",anterior:"—",nuevo:"Sep 2026"},{campo:"Formato",anterior:"—",nuevo:"PDF"}]),
  ae("2026-09-07","16:58","Prof. Ana Delgado","Docente","Horarios","Modificación","Horario Sección 3°B — Bloque Miércoles 3","192.168.1.31","Reasignación de asignatura en horario",[{campo:"Asignatura",anterior:"Arte",nuevo:"Matemática"},{campo:"Docente",anterior:"Prof. Luis Vera",nuevo:"Prof. Ana Delgado"}]),
  ae("2026-09-07","16:15","Admin Principal","Administrador","Académico","Creación","Asignatura: Robótica Educativa","192.168.1.10","Alta de nueva asignatura",[{campo:"Nombre",anterior:"—",nuevo:"Robótica Educativa"},{campo:"Código",anterior:"—",nuevo:"ROB-01"},{campo:"Grado",anterior:"—",nuevo:"5° y 6° Grado"},{campo:"Horas/sem",anterior:"—",nuevo:"2"}]),
  ae("2026-09-07","15:40","Lic. Carmen Paredes","Director","Matrículas","Consulta","Listado de matrículas 2026","192.168.1.5","Consulta de padrón de matrículas"),
  ae("2026-09-07","15:12","Secretaria López","Secretaria","Pagos","Modificación","Pago #PAG-2026-089 — Fam. Mendoza","192.168.1.22","Registro de pago parcial",[{campo:"Monto pagado",anterior:"S/ 0.00",nuevo:"S/ 160.00"},{campo:"Estado",anterior:"Pendiente",nuevo:"Parcial"},{campo:"Fecha pago",anterior:"—",nuevo:"2026-09-07"}]),
  ae("2026-09-07","14:45","Admin Principal","Administrador","Usuarios","Eliminación","Usuario #U-009 — Lic. Mario Salas","192.168.1.10","Baja de usuario del sistema",[{campo:"Nombre",anterior:"Mario Salas Vega",nuevo:"[Eliminado]"},{campo:"Estado",anterior:"Activo",nuevo:"[Eliminado]"},{campo:"Módulos",anterior:"Asistencia",nuevo:"[Eliminado]"}]),
  ae("2026-09-07","14:20","Prof. Ana Delgado","Docente","Calificaciones","Modificación","Notas II Bimestre — Sección 3°A","192.168.1.31","Registro de calificaciones del período",[{campo:"Nota Lucía Paredes / Com.",anterior:"15",nuevo:"17"},{campo:"Nota Valeria Torres / Mat.",anterior:"18",nuevo:"20"},{campo:"Nota Diego Ríos / Cie.",anterior:"09",nuevo:"09"}]),
  ae("2026-09-07","13:00","Secretaria López","Secretaria","Autenticación","Inicio de sesión","Sesión — Secretaria López","192.168.1.22","Ingreso exitoso al sistema"),
  ae("2026-09-06","18:05","Admin Principal","Administrador","Autenticación","Cierre de sesión","Sesión — Admin Principal","192.168.1.10","Cierre de sesión normal"),
  ae("2026-09-06","17:22","Admin Principal","Administrador","Académico","Modificación","Sección 3°C — Capacidad máxima","192.168.1.10","Actualización de aforo de aula",[{campo:"Capacidad",anterior:"28",nuevo:"30"},{campo:"Aula",anterior:"Aula 12",nuevo:"Aula 14"}]),
  ae("2026-09-06","16:45","Lic. Carmen Paredes","Director","Reportes","Exportación","Reporte de Calificaciones — I Bimestre","192.168.1.5","Exportación de reporte consolidado",[{campo:"Tipo",anterior:"—",nuevo:"Calificaciones"},{campo:"Bimestre",anterior:"—",nuevo:"I Bimestre"},{campo:"Formato",anterior:"—",nuevo:"PDF"}]),
  ae("2026-09-06","15:58","Prof. Pedro Luna","Docente","Asistencia","Creación","Asistencia 5°A — 06-09-2026","192.168.1.40","Registro diario de asistencia",[{campo:"Presentes",anterior:"—",nuevo:"24"},{campo:"Faltas",anterior:"—",nuevo:"2"},{campo:"Tardanzas",anterior:"—",nuevo:"1"}]),
  ae("2026-09-06","15:10","Secretaria López","Secretaria","Pagos","Creación","Pago #PAG-2026-092 — Fam. Torres","192.168.1.22","Registro de pago de mensualidad",[{campo:"Concepto",anterior:"—",nuevo:"Mensualidad Septiembre 2026"},{campo:"Monto",anterior:"—",nuevo:"S/ 320.00"},{campo:"Estado",anterior:"—",nuevo:"Pagado"}]),
  ae("2026-09-06","11:30","Admin Principal","Administrador","Comunicados","Modificación","Anuncio: Bienvenida Año Escolar 2026","192.168.1.10","Edición de comunicado publicado",[{campo:"Contenido",anterior:"...bienvenidos al año 2026...",nuevo:"...bienvenidos al nuevo año escolar 2026..."},{campo:"Prioridad",anterior:"Normal",nuevo:"Importante"}]),
  ae("2026-09-05","17:00","Admin Principal","Administrador","Autenticación","Cierre de sesión","Sesión — Admin Principal","192.168.1.10","Cierre de sesión normal"),
  ae("2026-09-05","10:12","Admin Principal","Administrador","Matrículas","Modificación","Matrícula #MAT-2026-031 — Rodrigo Castillo","192.168.1.10","Actualización de datos de matrícula",[{campo:"Sección",anterior:"4° Grado - A",nuevo:"4° Grado - B"},{campo:"Motivo",anterior:"—",nuevo:"Solicitud de traslado de sección aprobada"}]),
];

// Parse cambios from string if needed
const DATA: AuditEntry[] = SEED.map((e) => ({
  ...e,
  cambios: typeof e.cambios === "string"
    ? JSON.parse(e.cambios as unknown as string)
    : e.cambios,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const [y,m,d] = iso.split("-");
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${months[Number(m)-1]} ${y}`;
}

const PAGE_SIZE = 12;

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

function DetailDrawer({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const AccIcon = ACCION_STYLE[entry.accion].icon;
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ width: 440 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0" style={{ borderColor:"#2e3939" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: ACCION_STYLE[entry.accion].bg }}>
            <AccIcon size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>{entry.id}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{entry.modulo} · {entry.accion}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-500 hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Who + When */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4 border" style={{ background:"#1F2525",borderColor:"#2e3939" }}>
            <div className="flex items-center gap-2 mb-2">
              <User size={12} className="text-gray-600" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Usuario</p>
            </div>
            <p className="text-sm font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>{entry.usuario}</p>
            <p className="text-[11px] mt-0.5" style={{ color: ROL_COLORS[entry.rol] }}>{entry.rol}</p>
          </div>
          <div className="rounded-xl p-4 border" style={{ background:"#1F2525",borderColor:"#2e3939" }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={12} className="text-gray-600" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Fecha y hora</p>
            </div>
            <p className="text-sm font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>{entry.hora}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{fmtDate(entry.fecha)}</p>
          </div>
        </div>

        {/* Action info */}
        <div className="rounded-xl p-4 border space-y-2" style={{ background:"#1F2525",borderColor:"#2e3939" }}>
          <Row label="Módulo"    value={entry.modulo} />
          <Row label="Acción"   value={entry.accion} />
          <Row label="Registro" value={entry.registro} />
          <Row label="IP"       value={entry.ip} />
          <Row label="Detalle"  value={entry.detalle} />
        </div>

        {/* Diff */}
        {entry.cambios && entry.cambios.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Cambios registrados</p>
            <div className="space-y-2">
              {entry.cambios.map((c, i) => (
                <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor:"#2e3939" }}>
                  <div className="px-4 py-2 border-b" style={{ background:"#2e3939",borderColor:"#37415150" }}>
                    <p className="text-[11px] font-semibold text-gray-300" style={{ fontFamily:"var(--font-display)" }}>{c.campo}</p>
                  </div>
                  <div className="grid grid-cols-2 divide-x" style={{ borderColor:"#2e3939" }}>
                    <div className="px-4 py-3" style={{ background:"#EF444408" }}>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#EF4444] mb-1">Anterior</p>
                      <p className="text-xs text-gray-300 break-words">{c.anterior === "—" ? <span className="text-gray-600 italic">Sin valor</span> : c.anterior}</p>
                    </div>
                    <div className="px-4 py-3" style={{ background:"#10B98108" }}>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#10B981] mb-1">Nuevo</p>
                      <p className="text-xs text-gray-200 break-words font-medium">{c.nuevo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!entry.cambios || entry.cambios.length === 0) && (
          <div className="rounded-xl border p-5 flex items-center gap-3" style={{ background:"#1F2525",borderColor:"#2e3939" }}>
            <Shield size={16} className="text-gray-600 flex-shrink-0" />
            <p className="text-xs text-gray-500">No se registraron cambios en campos de datos para esta acción.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 w-20 flex-shrink-0 mt-0.5">{label}</span>
      <span className="text-xs text-gray-300 leading-relaxed">{value}</span>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function Auditoria() {
  const [selected,     setSelected]     = useState<AuditEntry | null>(null);
  const [search,       setSearch]       = useState("");
  const [filterModulo, setFilterModulo] = useState("");
  const [filterAccion, setFilterAccion] = useState("");
  const [filterRol,    setFilterRol]    = useState("");
  const [filterFecha,  setFilterFecha]  = useState("");
  const [page,         setPage]         = useState(1);

  const hasFilters = !!(search || filterModulo || filterAccion || filterRol || filterFecha);

  function clearFilters() {
    setSearch(""); setFilterModulo(""); setFilterAccion(""); setFilterRol(""); setFilterFecha(""); setPage(1);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DATA.filter((e) =>
      (!q || e.usuario.toLowerCase().includes(q) || e.registro.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.detalle.toLowerCase().includes(q))
      && (!filterModulo || e.modulo === filterModulo)
      && (!filterAccion || e.accion === filterAccion)
      && (!filterRol    || e.rol    === filterRol)
      && (!filterFecha  || e.fecha  === filterFecha)
    );
  }, [search, filterModulo, filterAccion, filterRol, filterFecha]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function navigate(dir: number) { setPage((p) => Math.max(1, Math.min(totalPages, p + dir))); }

  const MODULOS  = [...new Set(DATA.map((e) => e.modulo))].sort();
  const ACCIONES = [...new Set(DATA.map((e) => e.accion))].sort();
  const ROLES    = [...new Set(DATA.map((e) => e.rol))].sort();

  return (
    <div className="flex gap-4 h-full" style={{ minHeight:0 }}>

      {/* ── Table panel ── */}
      <div className="flex flex-col flex-1 min-w-0 rounded-2xl border overflow-hidden" style={{ background:"#263030",borderColor:"#2e3939" }}>

        {/* Search + filters */}
        <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0 flex-wrap" style={{ borderColor:"#2e3939" }}>
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-48" style={{ background:"#1F2525",border:"1px solid #2e3939" }}>
            <Search size={13} className="text-gray-600 flex-shrink-0" />
            <input value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}}
              placeholder="Buscar por usuario, registro, ID..."
              className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-full" />
            {search && <button onClick={()=>setSearch("")}><X size={11} className="text-gray-500" /></button>}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter size={12} className="text-gray-600" />
            {(
              [
                { val: filterModulo, set: setFilterModulo, opts: MODULOS,  placeholder:"Módulo"  },
                { val: filterAccion, set: setFilterAccion, opts: ACCIONES,  placeholder:"Acción"  },
                { val: filterRol,    set: setFilterRol,    opts: ROLES,     placeholder:"Rol"     },
              ] as const
            ).map(({ val, set, opts, placeholder }) => (
              <select key={placeholder} value={val}
                onChange={(e)=>{(set as (v:string)=>void)(e.target.value);setPage(1);}}
                className="rounded-lg px-3 py-2 text-xs text-gray-400 outline-none"
                style={{ background:"#1F2525",border:"1px solid #2e3939" }}>
                <option value="" style={{ background:"#1F2525" }}>{placeholder}</option>
                {opts.map((o)=><option key={o} value={o} style={{ background:"#1F2525" }}>{o}</option>)}
              </select>
            ))}
            <input type="date" value={filterFecha} onChange={(e)=>{setFilterFecha(e.target.value);setPage(1);}}
              className="rounded-lg px-3 py-2 text-xs text-gray-400 outline-none"
              style={{ background:"#1F2525",border:"1px solid #2e3939",colorScheme:"dark" }} />
            {hasFilters && (
              <button onClick={clearFilters} className="p-2 rounded-lg border text-gray-600 hover:text-gray-300 transition-colors" style={{ borderColor:"#2e3939" }}>
                <RotateCcw size={12} />
              </button>
            )}
          </div>

          {/* Count */}
          <p className="text-[11px] text-gray-600 flex-shrink-0 whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? "registro" : "registros"}
          </p>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs" style={{ minWidth:900 }}>
            <thead>
              <tr style={{ background:"#1F2525" }} className="sticky top-0 z-10">
                {["ID","Fecha","Hora","Usuario","Rol","Módulo","Acción","Registro afectado",""].map((h)=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap border-b" style={{ borderColor:"#2e3939" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-600">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle size={24} />
                      <span>Sin registros para los filtros aplicados</span>
                    </div>
                  </td>
                </tr>
              )}
              {pageData.map((e, i) => {
                const isSelected = selected?.id === e.id;
                const AccIcon = ACCION_STYLE[e.accion].icon;
                return (
                  <tr key={e.id}
                    onClick={() => setSelected(isSelected ? null : e)}
                    className="cursor-pointer transition-colors group"
                    style={{ background: isSelected ? "#00ADEB12" : i%2===0 ? "#263030" : "#22292900" }}>
                    {/* ID */}
                    <td className="px-4 py-3 font-mono text-[10px]" style={{ color:"#60A5FA" }}>{e.id}</td>
                    {/* Fecha */}
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDate(e.fecha)}</td>
                    {/* Hora */}
                    <td className="px-4 py-3 text-gray-400 font-mono">{e.hora}</td>
                    {/* Usuario */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ background: ROL_COLORS[e.rol] + "40", color: ROL_COLORS[e.rol] }}>
                          {e.usuario.split(" ").pop()![0]}
                        </div>
                        <span className="text-gray-200 font-medium">{e.usuario}</span>
                      </div>
                    </td>
                    {/* Rol */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background:`${ROL_COLORS[e.rol]}18`, color:ROL_COLORS[e.rol] }}>
                        {e.rol}
                      </span>
                    </td>
                    {/* Módulo */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{ background:`${MODULO_COLORS[e.modulo]}15`, color:MODULO_COLORS[e.modulo], borderColor:`${MODULO_COLORS[e.modulo]}30` }}>
                        {e.modulo}
                      </span>
                    </td>
                    {/* Acción */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background:ACCION_STYLE[e.accion].bg, color:ACCION_STYLE[e.accion].text }}>
                        <AccIcon size={9} />
                        {e.accion}
                      </span>
                    </td>
                    {/* Registro */}
                    <td className="px-4 py-3 text-gray-400 max-w-xs">
                      <span className="line-clamp-1">{e.registro}</span>
                    </td>
                    {/* Detail button */}
                    <td className="px-4 py-3">
                      <button
                        onClick={(ev)=>{ev.stopPropagation();setSelected(isSelected?null:e);}}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        style={{ background: isSelected ? "#00ADEB20" : "#37415130", color: isSelected ? "#00ADEB" : "#9CA3AF" }}>
                        {isSelected ? <ArrowRight size={13} /> : <Eye size={13} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t flex-shrink-0" style={{ borderColor:"#2e3939" }}>
          <p className="text-[11px] text-gray-600">
            Mostrando {Math.min((page-1)*PAGE_SIZE+1,filtered.length)}–{Math.min(page*PAGE_SIZE,filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={()=>navigate(-1)} disabled={page===1}
              className="p-1.5 rounded-lg border text-gray-500 disabled:opacity-30 transition-colors hover:text-gray-300"
              style={{ borderColor:"#2e3939" }}><ChevronLeft size={13} /></button>
            {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).map((p,i,arr)=>(
              <span key={p}>
                {i>0 && arr[i-1]!==p-1 && <span className="text-gray-700 px-1 text-xs">…</span>}
                <button onClick={()=>setPage(p)}
                  className="w-7 h-7 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: page===p ? "#00ADEB" : "transparent", color: page===p ? "#fff" : "#6B7280" }}>
                  {p}
                </button>
              </span>
            ))}
            <button onClick={()=>navigate(1)} disabled={page===totalPages}
              className="p-1.5 rounded-lg border text-gray-500 disabled:opacity-30 transition-colors hover:text-gray-300"
              style={{ borderColor:"#2e3939" }}><ChevronRight size={13} /></button>
          </div>
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selected && (
        <div className="flex-shrink-0 rounded-2xl border overflow-hidden" style={{ background:"#263030",borderColor:"#2e3939" }}>
          <DetailDrawer entry={selected} onClose={()=>setSelected(null)} />
        </div>
      )}
    </div>
  );
}
