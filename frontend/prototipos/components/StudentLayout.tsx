import {
  LayoutDashboard, BookOpen, Calendar, ClipboardList,
  Clock, FileText, DollarSign, ChevronRight, LogOut,
  GraduationCap, Settings, Megaphone,
} from "lucide-react";

export type StudentPage =
  | "s-dashboard" | "s-calificaciones" | "s-asistencia"
  | "s-tareas"    | "s-horario"        | "s-evaluaciones" | "s-cuenta" | "s-anuncios";

const NAV: { label:string; icon:React.ComponentType<{size?:number;className?:string}>; page:StudentPage }[] = [
  { label:"Inicio",          icon:LayoutDashboard, page:"s-dashboard"      },
  { label:"Mis Calificaciones",icon:BookOpen,      page:"s-calificaciones" },
  { label:"Asistencia",      icon:Calendar,        page:"s-asistencia"     },
  { label:"Tareas",          icon:ClipboardList,   page:"s-tareas"         },
  { label:"Horario",         icon:Clock,           page:"s-horario"        },
  { label:"Evaluaciones",    icon:FileText,        page:"s-evaluaciones"   },
  { label:"Estado de cuenta",icon:DollarSign,      page:"s-cuenta"         },
  { label:"Comunicados",     icon:Megaphone,       page:"s-anuncios"       },
];

// Student data (shared across student portal)
export const STUDENT = {
  nombre:   "Valeria Torres",
  codigo:   "2024-005",
  grado:    "3° Grado",
  seccion:  "C",
  initials: "VT",
  color:    "#10B981",
};

interface StudentLayoutProps {
  currentPage: StudentPage;
  onNavigate: (p: StudentPage) => void;
  onSwitchMode: () => void;
  children: React.ReactNode;
}

export default function StudentLayout({ currentPage, onNavigate, onSwitchMode, children }: StudentLayoutProps) {
  return (
    <div className="flex h-full overflow-hidden" style={{ background:"#1a1f1f", fontFamily:"var(--font-body)" }}>
      {/* Sidebar */}
      <aside className="flex flex-col flex-shrink-0 h-full" style={{ width:260, background:"#111616", borderRight:"1px solid #1e2c2c" }}>
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor:"#1e2c2c" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"#10B981" }}>
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight" style={{ fontFamily:"var(--font-display)" }}>Portal Estudiantil</p>
            <p className="text-[10px]" style={{ color:"#10B98180" }}>EduAdmin</p>
          </div>
        </div>

        {/* Student card */}
        <div className="px-4 py-4 border-b" style={{ borderColor:"#1e2c2c" }}>
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background:"#10B98112", border:"1px solid #10B98125" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background:"linear-gradient(135deg,#10B981,#059669)" }}>
              {STUDENT.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate" style={{ fontFamily:"var(--font-display)" }}>{STUDENT.nombre}</p>
              <p className="text-[10px] mt-0.5" style={{ color:"#10B98190" }}>{STUDENT.grado} · Sec. {STUDENT.seccion}</p>
              <p className="text-[9px] text-gray-600 mt-0.5">{STUDENT.codigo}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-2 mb-2">Menú</p>
          {NAV.map((item) => {
            const active = currentPage === item.page;
            return (
              <button key={item.page} onClick={() => onNavigate(item.page)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-all"
                style={{ background:active?"#10B98118":"transparent", color:active?"#10B981":"#9CA3AF" }}>
                <item.icon size={16} />
                <span className="text-xs font-medium" style={{ fontFamily:"var(--font-display)" }}>{item.label}</span>
                {active && <ChevronRight size={12} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t space-y-1" style={{ borderColor:"#1e2c2c" }}>
          <button onClick={onSwitchMode}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-gray-500 hover:text-gray-300">
            <Settings size={14} />
            <span className="text-xs font-medium" style={{ fontFamily:"var(--font-display)" }}>Cambiar a Admin</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-600 hover:text-gray-400 transition-all">
            <LogOut size={14} />
            <span className="text-xs font-medium" style={{ fontFamily:"var(--font-display)" }}>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 flex-shrink-0"
          style={{ background:"#111616", borderBottom:"1px solid #1e2c2c" }}>
          <div>
            <h1 className="text-white text-base font-bold" style={{ fontFamily:"var(--font-display)" }}>
              {NAV.find(n=>n.page===currentPage)?.label ?? "Portal Estudiantil"}
            </h1>
            <p className="text-xs mt-0.5" style={{ color:"#10B98180" }}>
              {STUDENT.nombre} · {STUDENT.grado} · Sec. {STUDENT.seccion}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onSwitchMode}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
              style={{ background:"#10B98115", color:"#10B981", borderColor:"#10B98130", fontFamily:"var(--font-display)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background:"#10B981" }} />
              Modo Estudiante
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
