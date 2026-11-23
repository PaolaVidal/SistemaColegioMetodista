import { useState } from "react";
import Layout, { type Page } from "./components/Layout";
import StudentLayout, { type StudentPage } from "./components/StudentLayout";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import AcademicManagement from "./pages/AcademicManagement";
import StudentManagement from "./pages/StudentManagement";
import StudentRecord, { type Student as StudentType } from "./pages/StudentRecord";
import Matriculas from "./pages/Matriculas";
import Asistencia from "./pages/Asistencia";
import Calificaciones from "./pages/Calificaciones";
import Horarios from "./pages/Horarios";
import Financiero from "./pages/Financiero";
import Anuncios from "./pages/Anuncios";
import Reportes from "./pages/Reportes";
import Auditoria from "./pages/Auditoria";
import Docentes from "./pages/Docentes";
import StudentDashboard     from "./pages/student/StudentDashboard";
import StudentRendimiento   from "./pages/student/StudentRendimiento";
import StudentAsistencia    from "./pages/student/StudentAsistencia";
import StudentTareas        from "./pages/student/StudentTareas";
import StudentHorario       from "./pages/student/StudentHorario";
import StudentEvaluaciones  from "./pages/student/StudentEvaluaciones";
import StudentCuenta        from "./pages/student/StudentCuenta";
import StudentAnuncios      from "./pages/student/StudentAnuncios";
import { GraduationCap } from "lucide-react";

// ─── Student portal stub ───────────────────────────────────────────────────────

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background:"#10B98118" }}>
        <GraduationCap size={28} style={{ color:"#10B981" }} />
      </div>
      <p className="text-lg font-bold text-white mb-2" style={{ fontFamily:"var(--font-display)" }}>{label}</p>
      <p className="text-sm text-gray-500">Esta pantalla estará disponible próximamente.</p>
    </div>
  );
}

// ─── Student portal wrapper ────────────────────────────────────────────────────

function StudentPortal({ onSwitchMode }: { onSwitchMode: () => void }) {
  const [page, setPage] = useState<StudentPage>("s-dashboard");
  return (
    <StudentLayout currentPage={page} onNavigate={setPage} onSwitchMode={onSwitchMode}>
      {page === "s-dashboard"      && <StudentDashboard    onNavigate={setPage} />}
      {page === "s-calificaciones" && <StudentRendimiento />}
      {page === "s-asistencia"     && <StudentAsistencia />}
      {page === "s-tareas"         && <StudentTareas />}
      {page === "s-horario"        && <StudentHorario />}
      {page === "s-evaluaciones"   && <StudentEvaluaciones />}
      {page === "s-cuenta"         && <StudentCuenta />}
      {page === "s-anuncios"       && <StudentAnuncios />}
    </StudentLayout>
  );
}

// ─── Admin portal ─────────────────────────────────────────────────────────────

export default function App() {
  const [mode,          setMode]          = useState<"admin"|"student">("admin");
  const [currentPage,   setCurrentPage]   = useState<Page>("dashboard");
  const [selectedStudent,setSelectedStudent]=useState<StudentType|null>(null);

  if (mode === "student") {
    return <StudentPortal onSwitchMode={() => setMode("admin")} />;
  }

  function openRecord(s: StudentType) { setSelectedStudent(s); setCurrentPage("record"); }
  function backToStudents() { setCurrentPage("students"); }

  const pageMeta: Record<Page, { title: string; subtitle: string }> = {
    dashboard:     { title:"Dashboard Administrador",       subtitle:"Visión general del estado del colegio" },
    users:         { title:"Gestión de Usuarios",           subtitle:"Administra las cuentas de acceso al sistema" },
    academic:      { title:"Gestión Académica",             subtitle:"Ciclos, grados, secciones y asignaturas" },
    students:      { title:"Gestión de Estudiantes",        subtitle:"Registro y administración de estudiantes matriculados" },
    record:        { title:"Expediente Estudiantil",        subtitle:selectedStudent ? `${selectedStudent.nombres} ${selectedStudent.apellidos}` : "" },
    matriculas:    { title:"Matrículas",                    subtitle:"Administra las matrículas de los estudiantes" },
    asistencia:    { title:"Asistencia",                    subtitle:"Supervisión de la asistencia registrada por los docentes" },
    calificaciones:{ title:"Calificaciones y rendimiento",  subtitle:"Consulta de calificaciones, promedios e identificación de bajo rendimiento" },
    horarios:      { title:"Horarios",                      subtitle:"Distribución semanal de clases por sección, grado y docente" },
    financiero:    { title:"Gestión Financiera",            subtitle:"Supervisión de pagos, estados de cuenta y saldos pendientes" },
    anuncios:      { title:"Anuncios y Comunicaciones",     subtitle:"Gestión de comunicados institucionales para la comunidad educativa" },
    reportes:      { title:"Reportes",                      subtitle:"Generación de información consolidada del sistema" },
    auditoria:     { title:"Auditoría del Sistema",         subtitle:"Registro de acciones realizadas dentro de la plataforma" },
    docentes:      { title:"Gestión de Docentes",           subtitle:"Visualización, edición y administración del cuerpo docente" },
  };

  const meta = pageMeta[currentPage];

  // Mode-switch button passed into the admin header
  const modeSwitcher = (
    <button onClick={() => setMode("student")}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
      style={{ background:"#10B98115", color:"#10B981", borderColor:"#10B98130", fontFamily:"var(--font-display)" }}>
      <GraduationCap size={14} style={{ color:"#10B981" }} />
      Modo Estudiante
    </button>
  );

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} pageTitle={meta.title} pageSubtitle={meta.subtitle} headerRight={modeSwitcher}>
      {currentPage === "dashboard"      && <Dashboard />}
      {currentPage === "users"          && <UserManagement />}
      {currentPage === "academic"       && <AcademicManagement />}
      {currentPage === "students"       && <StudentManagement onViewRecord={openRecord} />}
      {currentPage === "record"         && selectedStudent && <StudentRecord student={selectedStudent} onBack={backToStudents} />}
      {currentPage === "matriculas"     && <Matriculas />}
      {currentPage === "asistencia"     && <Asistencia />}
      {currentPage === "calificaciones" && <Calificaciones />}
      {currentPage === "horarios"       && <Horarios />}
      {currentPage === "financiero"     && <Financiero />}
      {currentPage === "anuncios"       && <Anuncios />}
      {currentPage === "reportes"       && <Reportes />}
      {currentPage === "auditoria"      && <Auditoria />}
      {currentPage === "docentes"       && <Docentes />}
    </Layout>
  );
}
