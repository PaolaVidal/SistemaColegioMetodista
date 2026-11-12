import { Suspense, useState } from 'react';
import {
  NavLink, Outlet, useLocation, useNavigate,
} from 'react-router-dom';
import {
  ChevronRight, GraduationCap, LogOut, Menu, X,
} from 'lucide-react';
import Cargando from '../components/ui/Cargando';
import navegacionAdmin, { buscarSeccion } from '../config/navegacion';
import { nombreRol } from '../config/roles';
import { precargarPagina } from '../routes/paginas';
import useAuthStore from '../store/authStore';

function claseEnlace({ isActive }) {
  const base = 'mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-100';
  return isActive ? `${base} bg-brand/10 text-brand-soft` : `${base} text-gray-400 hover:bg-card hover:text-gray-200`;
}

export default function AdminLayout() {
  const [menuAbierto, setMenuAbierto] = useState(true);
  const { usuario, cerrarSesion } = useAuthStore();
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const seccion = buscarSeccion(pathname);

  async function salir() {
    await cerrarSesion();
    navegar('/login', { replace: true });
  }

  return (
    <div className="flex h-full overflow-hidden bg-base">
      <aside
        className={`flex h-full flex-shrink-0 flex-col overflow-hidden border-line bg-panel transition-all duration-200
          ${menuAbierto ? 'w-64 border-r' : 'w-0'}`}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
          <div className="bg-brand-gradient flex h-8 w-8 items-center justify-center rounded-lg">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display text-sm leading-tight font-bold text-white">Colegio Metodista</p>
            <p className="text-[10px] text-gray-500">Sistema Escolar</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menú principal">
          <p className="mb-2 px-2 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Menú principal</p>
          {navegacionAdmin.map((item) => (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              end={item.ruta === '/admin'}
              className={claseEnlace}
              onMouseEnter={() => precargarPagina(item.ruta)}
              onFocus={() => precargarPagina(item.ruta)}
            >
              {({ isActive }) => (
                <>
                  <item.icono size={16} />
                  <span className="font-display text-xs font-medium">{item.etiqueta}</span>
                  {isActive && <ChevronRight size={12} className="ml-auto" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-card px-2 py-2">
            <div className="bg-brand-gradient flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
              {(usuario?.nombre_usuario || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xs font-semibold text-white">{usuario?.nombre_usuario}</p>
              <p className="text-[10px] text-gray-500">{nombreRol(usuario?.rol)}</p>
            </div>
            <button
              type="button"
              onClick={salir}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="p-1 text-gray-500 transition-colors hover:text-gray-200"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex flex-shrink-0 items-center justify-between border-b border-line bg-panel px-4 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label={menuAbierto ? 'Ocultar menú' : 'Mostrar menú'}
              className="text-gray-400 transition-colors hover:text-white"
            >
              {menuAbierto ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <h1 className="font-display text-base font-bold text-white">{seccion.titulo}</h1>
              <p className="text-xs text-gray-500">{seccion.subtitulo}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Suspense fallback={<Cargando />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
