import {
  BarChart2, Bell, BookMarked, Briefcase, Calendar, CalendarClock, ClipboardList, Contact, Megaphone,
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

// Menú de secretaría: finanzas, reportes y lectura de anuncios. Mismo diseño que el del administrador.
export const navegacionSecretaria = [
  {
    etiqueta: 'Dashboard',
    icono: LayoutDashboard,
    ruta: '/secretaria',
    titulo: 'Dashboard de Secretaría',
    subtitulo: 'Resumen de cobros, pagos y cuentas pendientes',
    disponible: true,
  },
  {
    etiqueta: 'Pagos',
    icono: DollarSign,
    ruta: '/secretaria/pagos',
    titulo: 'Gestión Financiera',
    subtitulo: 'Registro de pagos, estados de cuenta, aranceles y descuentos',
    disponible: true,
  },
  {
    etiqueta: 'Reportes',
    icono: BarChart2,
    ruta: '/secretaria/reportes',
    titulo: 'Reportes',
    subtitulo: 'Información consolidada del sistema',
    disponible: true,
  },
  {
    etiqueta: 'Anuncios',
    icono: Megaphone,
    ruta: '/secretaria/anuncios',
    titulo: 'Anuncios',
    subtitulo: 'Comunicados publicados por la administración',
    disponible: true,
  },
];

// Sección del menú que corresponde a la ruta actual (la raíz del menú solo coincide exactamente).
export function buscarSeccion(pathname, menu = navegacionAdmin) {
  return menu.find((item) => item.ruta === pathname)
    || menu.find((item) => item.ruta !== menu[0].ruta && pathname.startsWith(item.ruta))
    || menu[0];
}

export default navegacionAdmin;
