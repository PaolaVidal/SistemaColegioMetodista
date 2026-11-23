import { useEffect } from 'react';
import {
  BrowserRouter, Navigate, Route, Routes,
} from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import EnConstruccion from '../pages/admin/EnConstruccion';
import Login from '../pages/auth/Login';
import PortalPendiente from '../pages/portal/PortalPendiente';
import { navegacionSecretaria } from '../config/navegacion';
import { rutaInicio } from '../config/roles';
import useAuthStore from '../store/authStore';
import { PAGINAS_ADMIN, PAGINAS_SECRETARIA } from './paginas';
import RutaProtegida from './RutaProtegida';

function Inicio() {
  const { usuario, estado } = useAuthStore();
  if (estado === 'verificando') return null;
  return <Navigate to={estado === 'autenticado' ? rutaInicio(usuario) : '/login'} replace />;
}

export default function AppRoutes() {
  const verificarSesion = useAuthStore((s) => s.verificarSesion);

  useEffect(() => {
    verificarSesion();
  }, [verificarSesion]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RutaProtegida roles={['administrador']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            {PAGINAS_ADMIN.map(({ ruta, componente: Pagina }) => (
              ruta === '/admin'
                ? <Route key={ruta} index element={<Pagina />} />
                : <Route key={ruta} path={ruta.replace('/admin/', '')} element={<Pagina />} />
            ))}
            <Route path="*" element={<EnConstruccion />} />
          </Route>
        </Route>

        <Route element={<RutaProtegida roles={['secretaria']} />}>
          <Route path="/secretaria" element={<AdminLayout menu={navegacionSecretaria} />}>
            {PAGINAS_SECRETARIA.map(({ ruta, componente: Pagina }) => (
              ruta === '/secretaria'
                ? <Route key={ruta} index element={<Pagina />} />
                : <Route key={ruta} path={ruta.replace('/secretaria/', '')} element={<Pagina />} />
            ))}
            <Route path="*" element={<Navigate to="/secretaria" replace />} />
          </Route>
        </Route>

        <Route element={<RutaProtegida />}>
          <Route path="/portal" element={<PortalPendiente />} />
        </Route>

        <Route path="*" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
  );
}
