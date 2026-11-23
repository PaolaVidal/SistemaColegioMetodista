import { useState } from 'react';
import {
  Check, Copy, KeyRound, X,
} from 'lucide-react';
import { copiarCredenciales } from '../../services/cuentas';

// Muestra las credenciales recién creadas para entregarlas a su dueño (la contraseña no se vuelve a mostrar).
export default function Credenciales({
  titulo, usuario, correo, contrasena, onCerrar,
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await copiarCredenciales({ usuario, correo, contrasena });
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#8B5CF650] bg-[#8B5CF612] p-3">
      <div className="mb-2 flex items-center gap-2">
        <KeyRound size={13} className="text-[#A78BFA]" />
        <p className="flex-1 font-display text-xs font-semibold text-[#C4B5FD]">{titulo}</p>
        <button type="button" onClick={copiar} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white">
          {copiado ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
        {onCerrar && (
          <button type="button" onClick={onCerrar} aria-label="Ocultar credenciales" className="text-gray-500 hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <p><span className="block text-[10px] text-gray-500">Usuario</span><span className="font-mono font-bold text-white">{usuario}</span></p>
        <p className="min-w-0"><span className="block text-[10px] text-gray-500">Correo de acceso</span><span className="block truncate text-gray-200">{correo}</span></p>
        <p>
          <span className="block text-[10px] text-gray-500">Contraseña</span>
          <span className="font-mono font-bold tracking-wider text-white">{contrasena}</span>
        </p>
      </div>
      <p className="mt-2 text-[10px] text-gray-500">Entréguelas ahora: por seguridad la contraseña no se podrá volver a consultar.</p>
    </div>
  );
}
