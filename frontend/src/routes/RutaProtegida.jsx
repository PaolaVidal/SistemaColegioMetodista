import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Cargando from '../components/ui/Cargando';
import { rutaInicio } from '../config/roles';
import useAuthStore from '../store/authStore';

// Exige sesión iniciada y, si se indica, uno de los roles permitidos.
export default function RutaProtegida({ roles }) {
  const { usuario, estado } = useAuthStore();
  const ubicacion = useLocation();

  if (estado === 'verificando') {
    return <div className="flex h-full items-center justify-center"><Cargando texto="Verificando sesión..." /></div>;
  }
  if (estado !== 'autenticado') {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={rutaInicio(usuario)} replace />;
  }
  return <Outlet />;
}
