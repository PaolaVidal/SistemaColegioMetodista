import { LoaderCircle } from 'lucide-react';

export default function Cargando({ texto = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400" role="status">
      <LoaderCircle size={18} className="animate-spin text-brand" />
      {texto}
    </div>
  );
}
