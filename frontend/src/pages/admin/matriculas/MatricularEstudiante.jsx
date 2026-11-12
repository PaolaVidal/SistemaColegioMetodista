import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import { mensajeError } from '../../../services/api';
import { cargarMatriculas } from '../../../services/matriculas';
import MatriculaWizard from './MatriculaWizard';

// Abre el asistente de matrícula para un estudiante ya elegido (ciclo → grado → sección → confirmación).
export default function MatricularEstudiante({ estudiante, onClose, onRegistrada }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    cargarMatriculas()
      .then((resultado) => { if (vigente) setDatos(resultado); })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudieron cargar los datos de matrícula.')); });
    return () => { vigente = false; };
  }, []);

  if (datos) {
    return (
      <MatriculaWizard
        ciclos={datos.ciclos}
        secciones={datos.secciones}
        matriculas={datos.matriculas}
        estudianteFijo={estudiante}
        onClose={onClose}
        onRegistrada={onRegistrada}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div role="dialog" aria-modal="true" aria-label="Registrar matrícula" className="w-full max-w-sm rounded-2xl border border-line bg-base p-6">
        {error ? (
          <div className="space-y-4">
            <Alerta>{error}</Alerta>
            <div className="flex justify-end"><Boton variante="secundario" onClick={onClose}>Cerrar</Boton></div>
          </div>
        ) : (
          <p className="flex items-center justify-center gap-2 text-sm text-gray-400" role="status">
            <LoaderCircle size={18} className="animate-spin text-brand" />Preparando matrícula...
          </p>
        )}
      </div>
    </div>
  );
}
