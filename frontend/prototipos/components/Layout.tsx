import { useState } from "react";
import {
  GraduationCap, Briefcase, ClipboardList, DollarSign, BarChart2, Shield,
  FileText, LayoutDashboard, Calendar, Settings,
  LogOut, Menu, X, BookMarked, Bell, ChevronRight, Users,
} from "lucide-react";

export type Page = "dashboard" | "users" | "academic" | "students" | "record" | "matriculas" | "asistencia" | "calificaciones" | "horarios" | "financiero" | "anuncios" | "reportes" | "auditoria" | "docentes";

const navItems: { label: string; icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; page: Page }[] = [
  { label: "Dashboard",  icon: LayoutDashboard, page: "dashboard" },
  { label: "Estudiantes",icon: GraduationCap,   page: "students" },
  { label: "Docentes",   icon: Briefcase,        page: "docentes" },
  { label: "Usuarios",   icon: Users,            page: "users" },
  { label: "Matrículas", icon: ClipboardList,    page: "matriculas" },
  { label: "Pagos",      icon: DollarSign,       page: "financiero" },
  { label: "Asistencia", icon: Calendar,         page: "asistencia" },
  { label: "Académico",  icon: BookMarked,       page: "academic" },
  { label: "Calificaciones", icon: FileText,      page: "calificaciones" },
  { label: "Horarios",      icon: Calendar,       page: "horarios" },
  { label: "Comunicados",   icon: Bell,           page: "anuncios"  },
  { label: "Reportes",      icon: BarChart2,      page: "reportes"  },
  { label: "Auditoría",     icon: Shield,         page: "auditoria" },
];

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  pageTitle: string;
  pageSubtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export default function Layout({ currentPage, onNavigate, pageTitle, pageSubtitle, headerRight, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#1F2525", fontFamily: "var(--font-body)" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 h-full transition-all duration-200 overflow-hidden"
        style={{ width: sidebarOpen ? 260 : 0, background: "#161e1e", borderRight: "1px solid #2e3939" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "#2e3939" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#00ADEB" }}>
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>EduAdmin</p>
            <p className="text-[10px] text-gray-500">Sistema Escolar</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-2 mb-2">Menú principal</p>
          {navItems.map((item) => {
            const active =
            item.label === "Dashboard" ? currentPage === "dashboard" :
            item.label === "Usuarios"  ? currentPage === "users" :
            item.label === "Académico"    ? currentPage === "academic" :
            item.label === "Estudiantes"  ? (currentPage === "students" || currentPage === "record") :
            item.label === "Matrículas"   ? currentPage === "matriculas" :
            item.label === "Asistencia"       ? currentPage === "asistencia" :
            item.label === "Calificaciones"   ? currentPage === "calificaciones" :
            item.label === "Horarios"         ? currentPage === "horarios" :
            item.label === "Pagos"            ? currentPage === "financiero" :
            item.label === "Comunicados"      ? currentPage === "anuncios" :
            item.label === "Reportes"         ? currentPage === "reportes" :
            item.label === "Auditoría"        ? currentPage === "auditoria" :
            item.label === "Docentes"         ? currentPage === "docentes" : false;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-all duration-100"
                style={{
                  background: active ? "#00ADEB18" : "transparent",
                  color: active ? "#00ADEB" : "#9CA3AF",
                }}
              >
                <item.icon size={16} />
                <span className="text-xs font-medium" style={{ fontFamily: "var(--font-display)" }}>{item.label}</span>
                {active && <ChevronRight size={12} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "#2e3939" }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ background: "#263030" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#107A9F" }}>
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate" style={{ fontFamily: "var(--font-display)" }}>Admin Principal</p>
              <p className="text-[10px] text-gray-500">Administrador</p>
            </div>
            <LogOut size={13} className="text-gray-500 cursor-pointer hover:text-gray-300 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-8 py-4 flex-shrink-0"
          style={{ background: "#161e1e", borderBottom: "1px solid #2e3939" }}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <h1 className="text-white text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>{pageTitle}</h1>
              {pageSubtitle && <p className="text-gray-500 text-xs">{pageSubtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {headerRight}
            <button className="relative p-2 rounded-lg hover:bg-[#2e3939] transition-colors text-gray-400">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#EF4444" }} />
            </button>
            <button className="p-2 rounded-lg hover:bg-[#2e3939] transition-colors text-gray-400">
              <Settings size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
