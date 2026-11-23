import {
  Check, CheckCircle2, ClipboardPlus, Link2, UserPlus,
} from 'lucide-react';
import Credenciales from '../../../components/cuentas/Credenciales';
import Boton from '../../../components/ui/Boton';
import Modal from '../../../components/ui/Modal';
import { iniciales, nombreCompleto } from '../../../utils/formato';

function Hecho({ children }) {
  return (
    <p className="flex items-center gap-2 text-xs text-gray-300">
      <Check size={13} className="flex-shrink-0 text-[#10B981]" />{children}
    </p>
  );
}

function Accion({
  icono: Icono, titulo, descripcion, onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 text-left transition-all
        hover:border-brand/50 hover:bg-brand/5"
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand-soft">
        <Icono size={16} />
      </span>
      <span>
        <span className="block font-display text-sm font-semibold text-white">{titulo}</span>
        <span className="block text-[11px] text-gray-500">{descripcion}</span>
      </span>
    </button>
  );
}

// Pantalla final del registro de un estudiante: resume lo creado y ofrece los pasos siguientes.
export default function SiguientesPasos({
  flujo, onMatricular, onAsociar, onCrearResponsable, onFinalizar,
}) {
  const {
    estudiante, credenciales, matricula, responsables,
  } = flujo;
  return (
    <Modal
      titulo="Estudiante registrado"
      subtitulo="Complete el proceso asociando a su responsable y registrando la matrícula"
      ancho="max-w-xl"
      onClose={onFinalizar}
      pie={<Boton onClick={onFinalizar}><CheckCircle2 size={13} />Finalizar</Boton>}
    >
      <div className="space-y-2 rounded-xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-brand-gradient flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white">
            {iniciales(estudiante.nombres, estudiante.apellidos)}
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">{nombreCompleto(estudiante)}</p>
            <p className="font-mono text-[11px] text-gray-500">{estudiante.codigo_nie}</p>
          </div>
        </div>
        <Hecho>Expediente y ficha guardados</Hecho>
        {credenciales && <Hecho>{`Cuenta de acceso creada: ${credenciales.usuario}`}</Hecho>}
        {matricula && <Hecho>{`Matriculado en ${matricula}`}</Hecho>}
        {responsables.map((r) => <Hecho key={r.nombre}>{`Responsable asociado: ${r.nombre}`}</Hecho>)}
      </div>

      {credenciales && (
        <Credenciales
          titulo="Credenciales del estudiante"
          usuario={credenciales.usuario}
          correo={credenciales.correo}
          contrasena={credenciales.contrasena}
        />
      )}
      {responsables.filter((r) => r.credenciales).map((r) => (
        <Credenciales
          key={`cred-${r.nombre}`}
          titulo={`Credenciales de ${r.nombre}`}
          usuario={r.credenciales.usuario}
          correo={r.credenciales.correo}
          contrasena={r.credenciales.contrasena}
        />
      ))}

      <p className="pt-1 font-display text-xs font-semibold text-gray-400">Responsable del estudiante</p>
      <Accion
        icono={Link2}
        titulo="Asociar responsable existente"
        descripcion="Para padres o encargados ya registrados (por ejemplo, si tiene hermanos en el colegio)"
        onClick={onAsociar}
      />
      <Accion
        icono={UserPlus}
        titulo="Crear nuevo responsable"
        descripcion="Registra al padre, madre o encargado con este estudiante ya asociado"
        onClick={onCrearResponsable}
      />
      {!matricula && (
        <>
          <p className="pt-1 font-display text-xs font-semibold text-gray-400">Matrícula</p>
          <Accion
            icono={ClipboardPlus}
            titulo="Matricular estudiante"
            descripcion="Ciclo, grado, sección y confirmación"
            onClick={onMatricular}
          />
        </>
      )}
    </Modal>
  );
}
