import { lazy } from 'react';

// Cada pantalla se descarga solo al visitarla. `precargar` permite adelantar la descarga
// (por ejemplo al pasar el cursor sobre el menú) para que la navegación sea inmediata.
function perezosa(importar) {
  const Componente = lazy(importar);
  Componente.precargar = importar;
  return Componente;
}

export const Dashboard = perezosa(() => import('../pages/admin/dashboard/Dashboard'));
export const Estudiantes = perezosa(() => import('../pages/admin/estudiantes/Estudiantes'));
export const Responsables = perezosa(() => import('../pages/admin/responsables/Responsables'));
export const Docentes = perezosa(() => import('../pages/admin/docentes/Docentes'));
export const Usuarios = perezosa(() => import('../pages/admin/usuarios/Usuarios'));
export const Matriculas = perezosa(() => import('../pages/admin/matriculas/Matriculas'));
export const Pagos = perezosa(() => import('../pages/admin/pagos/Pagos'));
export const Asistencia = perezosa(() => import('../pages/admin/asistencia/Asistencia'));
export const Academico = perezosa(() => import('../pages/admin/academico/Academico'));
export const Calificaciones = perezosa(() => import('../pages/admin/calificaciones/Calificaciones'));
export const Horarios = perezosa(() => import('../pages/admin/horarios/Horarios'));
export const Comunicados = perezosa(() => import('../pages/admin/comunicados/Comunicados'));
export const Reportes = perezosa(() => import('../pages/admin/reportes/Reportes'));
export const Auditoria = perezosa(() => import('../pages/admin/auditoria/Auditoria'));

export const DashboardSecretaria = perezosa(() => import('../pages/secretaria/DashboardSecretaria'));
export const AnunciosSecretaria = perezosa(() => import('../pages/secretaria/Anuncios'));

export const PAGINAS_ADMIN = [
  { ruta: '/admin', componente: Dashboard },
  { ruta: '/admin/estudiantes', componente: Estudiantes },
  { ruta: '/admin/responsables', componente: Responsables },
  { ruta: '/admin/docentes', componente: Docentes },
  { ruta: '/admin/usuarios', componente: Usuarios },
  { ruta: '/admin/matriculas', componente: Matriculas },
  { ruta: '/admin/pagos', componente: Pagos },
  { ruta: '/admin/asistencia', componente: Asistencia },
  { ruta: '/admin/academico', componente: Academico },
  { ruta: '/admin/calificaciones', componente: Calificaciones },
  { ruta: '/admin/horarios', componente: Horarios },
  { ruta: '/admin/comunicados', componente: Comunicados },
  { ruta: '/admin/reportes', componente: Reportes },
  { ruta: '/admin/auditoria', componente: Auditoria },
];

// Secretaría reutiliza las páginas de pagos y reportes del administrador.
export const PAGINAS_SECRETARIA = [
  { ruta: '/secretaria', componente: DashboardSecretaria },
  { ruta: '/secretaria/pagos', componente: Pagos },
  { ruta: '/secretaria/reportes', componente: Reportes },
  { ruta: '/secretaria/anuncios', componente: AnunciosSecretaria },
];

export function precargarPagina(ruta) {
  [...PAGINAS_ADMIN, ...PAGINAS_SECRETARIA].find((p) => p.ruta === ruta)?.componente.precargar().catch(() => {});
}
