import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen, Calendar, GraduationCap, Layers,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Cargando from '../../../components/ui/Cargando';
import { cargarAcademico } from '../../../services/academico';
import { mensajeError } from '../../../services/api';
import TabAsignaturas from './TabAsignaturas';
import TabCiclos from './TabCiclos';
import TabGrados from './TabGrados';
import TabSecciones from './TabSecciones';

const PESTANAS = [
  { id: 'ciclos', etiqueta: 'Ciclos académicos', icono: Calendar },
  { id: 'grados', etiqueta: 'Grados', icono: GraduationCap },
  { id: 'secciones', etiqueta: 'Secciones', icono: Layers },
  { id: 'asignaturas', etiqueta: 'Asignaturas', icono: BookOpen },
];

export default function Academico() {
  const [datos, setDatos] = useState(null);
  const [pestana, setPestana] = useState('ciclos');
  const [filtroGrado, setFiltroGrado] = useState('');
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      setDatos(await cargarAcademico());
    } catch (e) {
      setError(mensajeError(e, 'No se pudo cargar la información académica.'));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function alCambiar(mensaje) {
    setError('');
    setAviso(mensaje);
    await cargar();
  }

  function alError(mensaje) {
    setAviso('');
    setError(mensaje);
  }

  if (!datos) return error ? <Alerta>{error}</Alerta> : <Cargando texto="Cargando gestión académica..." />;

  return (
    <div className="space-y-4">
      <div className="flex w-fit flex-wrap items-center gap-1 rounded-xl border border-line bg-panel p-1" role="tablist">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            onClick={() => { setPestana(p.id); setAviso(''); setError(''); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold transition-all
              ${pestana === p.id ? 'bg-brand text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <p.icono size={13} />{p.etiqueta}
          </button>
        ))}
      </div>

      <Alerta tipo="exito">{aviso}</Alerta>
      <Alerta>{error}</Alerta>

      {pestana === 'ciclos' && <TabCiclos datos={datos} onCambio={alCambiar} onError={alError} />}
      {pestana === 'grados' && (
        <TabGrados
          datos={datos}
          onCambio={alCambiar}
          onError={alError}
          onVerSecciones={(idGrado) => { setFiltroGrado(String(idGrado)); setPestana('secciones'); }}
        />
      )}
      {pestana === 'secciones' && (
        <TabSecciones
          datos={datos}
          filtroGrado={filtroGrado}
          onFiltroGrado={setFiltroGrado}
          onCambio={alCambiar}
          onError={alError}
        />
      )}
      {pestana === 'asignaturas' && <TabAsignaturas datos={datos} onCambio={alCambiar} onError={alError} />}
    </div>
  );
}
