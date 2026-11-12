import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { nombreRol } from '../../config/roles';
import useAuthStore from '../../store/authStore';

// Destino temporal para los roles cuyo portal aún no está construido.
export default function PortalPendiente() {
  const { usuario, cerrarSesion } = useAuthStore();
  const navegar = useNavigate();

  async function salir() {
    await cerrarSesion();
    navegar('/login', { replace: true });
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-base px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-8 text-center">
        <div className="bg-brand-gradient mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
          <GraduationCap size={26} className="text-white" />
        </div>
        <h1 className="font-display text-lg font-bold text-white">Hola, {usuario?.nombre_usuario}</h1>
        <p className="mt-1 text-xs text-brand-soft">{nombreRol(usuario?.rol)}</p>
        <p className="mt-4 text-sm text-gray-400">
          El portal para su rol estará disponible próximamente.
          Por ahora solo está habilitado el portal del administrador.
        </p>
        <button
          type="button"
          onClick={salir}
          className="mx-auto mt-6 flex items-center gap-2 rounded-lg border border-line px-4 py-2 font-display text-xs
            font-semibold text-gray-300 transition-colors hover:bg-line hover:text-white"
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
