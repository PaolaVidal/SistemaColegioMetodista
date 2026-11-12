import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, GraduationCap, Lock, LogIn, Mail,
} from 'lucide-react';
import Alerta from '../../components/ui/Alerta';
import { rutaInicio } from '../../config/roles';
import { mensajeError } from '../../services/api';
import useAuthStore from '../../store/authStore';

function destinoPermitido(usuario, desde) {
  const inicio = rutaInicio(usuario);
  return desde && desde.startsWith(inicio) ? desde : inicio;
}

export default function Login() {
  const { usuario, estado, iniciarSesion } = useAuthStore();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (estado === 'autenticado' && !enviando) {
    return <Navigate to={rutaInicio(usuario)} replace />;
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const sesion = await iniciarSesion(correo.trim(), contrasena);
      navegar(destinoPermitido(sesion, ubicacion.state?.desde), { replace: true });
    } catch (e) {
      const estadoHttp = e?.response?.status;
      if (estadoHttp === 401) setError('Correo o contraseña incorrectos, o la cuenta está inactiva.');
      else if (estadoHttp === 429) setError('Demasiados intentos. Espere un minuto e intente de nuevo.');
      else if (!e?.response) setError('No se pudo conectar con el servidor. Verifique que el backend esté encendido.');
      else setError(mensajeError(e, 'No se pudo iniciar sesión.'));
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-base px-4 py-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#8e244033,transparent_60%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-brand-gradient mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg">
            <GraduationCap size={26} className="text-white" />
          </div>
          <h1 className="font-display text-xl font-bold text-white">Sistema Colegio Metodista</h1>
          <p className="mt-1 text-xs text-gray-500">Gestión académica y administrativa escolar</p>
        </div>

        <form onSubmit={enviar} className="space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-2xl">
          <div>
            <h2 className="font-display text-base font-bold text-white">Iniciar sesión</h2>
            <p className="mt-0.5 text-xs text-gray-500">Ingrese con su correo o su nombre de usuario</p>
          </div>

          <Alerta>{error}</Alerta>

          <div>
            <label htmlFor="correo" className="mb-1.5 block font-display text-[11px] font-medium text-gray-400">
              Correo o nombre de usuario
            </label>
            <div className="relative">
              <Mail size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
              <input
                id="correo"
                type="text"
                autoCapitalize="none"
                spellCheck={false}
                autoComplete="username"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@colegiometodista.edu.sv o 2026wrivas"
                className="input-field py-2.5 pl-9"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contrasena" className="mb-1.5 block font-display text-[11px] font-medium text-gray-400">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
              <input
                id="contrasena"
                type={verContrasena ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                className="input-field py-2.5 pr-9 pl-9"
              />
              <button
                type="button"
                onClick={() => setVerContrasena((v) => !v)}
                aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300"
              >
                {verContrasena ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="bg-brand-gradient flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-display
              text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <LogIn size={15} />
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-gray-600">
          El sistema detecta su rol y lo lleva a su portal correspondiente.
        </p>
      </div>
    </div>
  );
}
