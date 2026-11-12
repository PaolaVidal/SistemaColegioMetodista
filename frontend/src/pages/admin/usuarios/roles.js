import {
  BookOpen, ClipboardList, GraduationCap, ShieldCheck, Users,
} from 'lucide-react';

// Color e ícono por nombre de rol, tal como aparece en la tabla `roles`.
const ESTILO_ROL = {
  Administrador: { color: '#c2416b', icono: ShieldCheck },
  Docente: { color: '#10B981', icono: BookOpen },
  Secretaría: { color: '#F59E0B', icono: ClipboardList },
  Estudiante: { color: '#A78BFA', icono: GraduationCap },
  Encargado: { color: '#60A5FA', icono: Users },
};

export default function estiloRol(nombre) {
  return ESTILO_ROL[nombre] || { color: '#9CA3AF', icono: Users };
}
