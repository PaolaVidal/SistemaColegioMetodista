import { useEffect, useState } from 'react';
import {
  GraduationCap, Heart, KeyRound, Pencil, User, Users,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Boton from '../../../components/ui/Boton';
import Cargando from '../../../components/ui/Cargando';
import EstadoBadge from '../../../components/ui/EstadoBadge';
import Modal from '../../../components/ui/Modal';
import { mensajeError } from '../../../services/api';
import { obtenerExpediente } from '../../../services/estudiantes';
import {
  edad, fechaCorta, iniciales, nombreCompleto,
} from '../../../utils/formato';
import { SECCIONES_FICHA } from './camposFicha';
import FormSection from './FormSection';

function Dato({ etiqueta, valor, ancho = 1 }) {
  return (
    <div className={ancho === 2 ? 'col-span-2' : ''}>
      <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">{etiqueta}</p>
      <p className="mt-0.5 text-xs text-gray-200">{valor ?? '—'}</p>
    </div>
  );
}

function siNo(valor, detalle) {
  if (!valor) return 'No';
  return detalle ? `Sí — ${detalle}` : 'Sí';
}

function valorCampo(definicion, valor) {
  if (valor === null || valor === undefined || String(valor).trim() === '') return null;
  if (definicion.tipo === 'sino') return valor ? 'Sí' : 'No';
  if (definicion.tipo === 'fecha') return fechaCorta(valor);
  const opcion = (definicion.opciones || []).find((o) => Array.isArray(o) && o[0] === String(valor).trim());
  return opcion ? opcion[1] : String(valor).trim();
}

export default function ExpedienteModal({ estudiante, onClose, onEditar }) {
  const [expediente, setExpediente] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    obtenerExpediente(estudiante.id)
      .then((datos) => { if (vigente) setExpediente(datos); })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudo cargar el expediente.')); });
    return () => { vigente = false; };
  }, [estudiante.id]);

  const ficha = expediente?.ficha;
  const anios = edad(ficha?.fecha_nacimiento);

  return (
    <Modal
      titulo="Expediente del estudiante"
      subtitulo={`NIE: ${estudiante.codigo_nie}`}
      onClose={onClose}
      pie={(
        <>
          <Boton variante="secundario" onClick={onClose}>Cerrar</Boton>
          <Boton onClick={onEditar}><Pencil size={12} />Editar</Boton>
        </>
      )}
    >
      <div className="mb-2 flex items-center gap-4 rounded-xl border border-line bg-card p-4">
        <div className="bg-brand-gradient flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
          {iniciales(estudiante.nombres, estudiante.apellidos)}
        </div>
        <div className="flex-1">
          <p className="font-display text-base leading-tight font-bold text-white">{nombreCompleto(estudiante)}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {estudiante.grado ? `${estudiante.grado} — Sección ${estudiante.seccion}` : 'Sin matrícula en el ciclo activo'}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded bg-line px-2 py-0.5 font-mono text-[11px] text-gray-400">{estudiante.codigo_nie}</span>
            <EstadoBadge activo={estudiante.activo} />
          </div>
        </div>
      </div>

      <Alerta>{error}</Alerta>
      {!expediente && !error && <Cargando texto="Cargando expediente..." />}

      {expediente && (
        <>
          <FormSection titulo="Datos personales" icono={User}>
            <Dato etiqueta="Fecha de nacimiento" valor={ficha ? fechaCorta(ficha.fecha_nacimiento) : null} />
            <Dato etiqueta="Edad" valor={anios !== null ? `${anios} años` : null} />
            <Dato etiqueta="Sexo" valor={ficha && (ficha.sexo?.trim() === 'F' ? 'Femenino' : 'Masculino')} />
            <Dato etiqueta="Nacionalidad" valor={ficha?.nacionalidad} />
            <Dato etiqueta="Tipo de sangre" valor={ficha?.tipo_sangre} />
            <Dato etiqueta="Correo" valor={expediente.estudiante.correo} />
            <Dato etiqueta="Residencia" valor={[ficha?.municipio, ficha?.departamento].filter(Boolean).join(', ') || null} ancho={2} />
          </FormSection>

          <FormSection titulo="Historial de matrículas" icono={GraduationCap}>
            {expediente.matriculas.length === 0 && <p className="col-span-2 text-xs text-gray-500">Sin matrículas registradas.</p>}
            {expediente.matriculas.map((m) => (
              <div key={m.id} className="col-span-2 flex items-center justify-between rounded-lg bg-base px-3 py-2 text-xs">
                <span className="text-gray-200">{`${m.grado} — Sección ${m.seccion.trim()}`}</span>
                <span className="text-gray-500">{`Ciclo ${String(m.fecha_inicio).slice(0, 4)}`}</span>
              </div>
            ))}
            <Dato etiqueta="¿Repite grado?" valor={ficha ? siNo(ficha.repite_grado, ficha.anio_grado_anterior) : null} ancho={2} />
          </FormSection>

          <FormSection titulo="Información de salud" icono={Heart}>
            <Dato etiqueta="Enfermedad" valor={ficha ? siNo(ficha.padece_enfermedad, ficha.tipo_enfermedad) : null} />
            <Dato etiqueta="Medicamento" valor={ficha ? siNo(ficha.toma_medicamento, ficha.nombre_medicamento) : null} />
            <Dato etiqueta="Discapacidad" valor={ficha ? siNo(ficha.posee_discapacidad, ficha.tipo_discapacidad) : null} />
            <Dato
              etiqueta="Alergia a medicamentos"
              valor={ficha ? siNo(ficha.alergico_medicamento, ficha.nombre_medicamento_alergico) : null}
            />
            <Dato etiqueta="Vacunado COVID-19" valor={ficha ? siNo(ficha.vacunado_covid) : null} />
            <Dato etiqueta="Alergia a alimentos" valor={ficha?.alimento_alergico} />
          </FormSection>

          {ficha && SECCIONES_FICHA.map((seccion) => (
            <FormSection key={seccion.titulo} titulo={seccion.titulo} icono={seccion.icono} abiertaInicial={false}>
              {seccion.campos.map((c) => (
                <Dato key={c.campo} etiqueta={c.etiqueta} valor={valorCampo(c, ficha[c.campo])} ancho={c.ancho} />
              ))}
            </FormSection>
          ))}

          <FormSection titulo="Cuenta de usuario" icono={KeyRound} abiertaInicial={false}>
            {expediente.usuario ? (
              <>
                <Dato etiqueta="Usuario" valor={expediente.usuario.nombre_usuario} />
                <Dato etiqueta="Correo de acceso" valor={expediente.usuario.correo} />
                <Dato etiqueta="Estado" valor={expediente.usuario.activo ? 'Activa' : 'Inactiva'} />
                <Dato etiqueta="Último acceso" valor={expediente.usuario.ultimo_login ? fechaCorta(expediente.usuario.ultimo_login) : 'Nunca'} />
              </>
            ) : <p className="col-span-2 text-xs text-gray-500">El estudiante no tiene una cuenta de acceso.</p>}
          </FormSection>

          <FormSection titulo="Responsables" icono={Users}>
            {expediente.responsables.length === 0 && <p className="col-span-2 text-xs text-gray-500">Sin responsables registrados.</p>}
            {expediente.responsables.map((r) => (
              <div key={r.id} className="col-span-2 rounded-lg bg-base px-3 py-2 text-xs">
                <p className="font-semibold text-gray-200">
                  {nombreCompleto(r)}
                  {r.es_contacto_principal && <span className="ml-2 text-[10px] text-brand-soft">Contacto principal</span>}
                </p>
                <p className="mt-0.5 text-gray-500">
                  {[r.parentesco, r.telefono, r.correo].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
                </p>
              </div>
            ))}
          </FormSection>
        </>
      )}
    </Modal>
  );
}
