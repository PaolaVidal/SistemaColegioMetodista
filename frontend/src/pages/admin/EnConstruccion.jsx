import { useLocation } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import { buscarSeccion } from '../../config/navegacion';

export default function EnConstruccion() {
  const { pathname } = useLocation();
  const seccion = buscarSeccion(pathname);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
        <Hammer size={28} className="text-brand" />
      </div>
      <p className="mb-2 font-display text-lg font-bold text-white">{seccion.titulo}</p>
      <p className="text-sm text-gray-500">Esta pantalla estará disponible próximamente.</p>
    </div>
  );
}
