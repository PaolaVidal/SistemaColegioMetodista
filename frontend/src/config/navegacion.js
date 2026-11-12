import {
  BarChart2, Bell, BookMarked, Briefcase, Calendar, CalendarClock, ClipboardList, Contact,
  DollarSign, FileText, GraduationCap, LayoutDashboard, Shield, Users,
} from 'lucide-react';

// Menú del administrador. Las secciones sin `disponible` muestran la página "en construcción".
const navegacionAdmin = [
  {
    etiqueta: 'Dashboard',
    icono: LayoutDashboard,
    ruta: '/admin',
    titulo: 'Dashboard Administrador',
    subtitulo: 'Visión general del estado del colegio',
    disponible: true,
  },
  {
    etiqueta: 'Estudiantes',
    icono: GraduationCap,
    ruta: '/admin/estudiantes',
    titulo: 'Gestión de Estudiantes',
    subtitulo: 'Registro y administración de estudiantes',
    disponible: true,
  },
  {
    etiqueta: 'Responsables',
    icono: Contact,
    ruta: '/admin/responsables',
    titulo: 'Gestión de Responsables',
    subtitulo: 'Padres, madres y encargados con los estudiantes a su cargo',
    disponible: true,
  },
  {
    etiqueta: 'Matrículas',
    icono: ClipboardList,
    ruta: '/admin/matriculas',
    titulo: 'Matrículas',
    subtitulo: 'Administra las matrículas de los estudiantes',
    disponible: true,
  },
  {
    etiqueta: 'Docentes',
    icono: Briefcase,
    ruta: '/admin/docentes',
    titulo: 'Gestión de Docentes',
    subtitulo: 'Visualización, edición y administración del cuerpo docente',
    disponible: true,
  },
  {
    etiqueta: 'Usuarios',
    icono: Users,
    ruta: '/admin/usuarios',
    titulo: 'Gestión de Usuarios',
    subtitulo: 'Administra las cuentas de acceso al sistema',
    disponible: true,
  },
  {
    etiqueta: 'Pagos',
    icono: DollarSign,
    ruta: '/admin/pagos',
    titulo: 'Gestión Financiera',
    subtitulo: 'Supervisión de pagos, estados de cuenta y saldos pendientes',
    disponible: true,
  },
  {
    etiqueta: 'Asistencia',
    icono: Calendar,
    ruta: '/admin/asistencia',
    titulo: 'Asistencia',
    subtitulo: 'Supervisión de la asistencia registrada por los docentes',
    disponible: true,
  },
  {
    etiqueta: 'Académico',
    icono: BookMarked,
    ruta: '/admin/academico',
    titulo: 'Gestión Académica',
    subtitulo: 'Ciclos, grados, secciones y asignaturas',
    disponible: true,
  },
  {
    etiqueta: 'Calificaciones',
    icono: FileText,
    ruta: '/admin/calificaciones',
    titulo: 'Calificaciones y rendimiento',
    subtitulo: 'Consulta de calificaciones y promedios',
    disponible: true,
  },
  {
    etiqueta: 'Horarios',
    icono: CalendarClock,
    ruta: '/admin/horarios',
    titulo: 'Horarios',
    subtitulo: 'Distribución semanal de clases',
    disponible: true,
  },
  {
    etiqueta: 'Comunicados',
    icono: Bell,
    ruta: '/admin/comunicados',
    titulo: 'Anuncios y Comunicaciones',
    subtitulo: 'Comunicados institucionales para la comunidad educativa',
    disponible: true,
  },
  {
    etiqueta: 'Reportes',
    icono: BarChart2,
    ruta: '/admin/reportes',
    titulo: 'Reportes',
    subtitulo: 'Información consolidada del sistema',
    disponible: true,
  },
  {
    etiqueta: 'Auditoría',
    icono: Shield,
    ruta: '/admin/auditoria',
    titulo: 'Auditoría del Sistema',
    subtitulo: 'Registro de acciones realizadas dentro de la plataforma',
    disponible: true,
  },
];

export function buscarSeccion(pathname) {
  return navegacionAdmin.find((item) => item.ruta === pathname)
    || navegacionAdmin.find((item) => item.ruta !== '/admin' && pathname.startsWith(item.ruta))
    || navegacionAdmin[0];
}

export default navegacionAdmin;
