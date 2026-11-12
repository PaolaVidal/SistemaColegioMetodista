import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle, ClipboardList, ClipboardPlus, ClipboardX, Eye, Filter, GraduationCap, Heart, Pencil, Pill, Plus, ShieldAlert, Users, XCircle,
} from 'lucide-react';
import Credenciales from '../../../components/cuentas/Credenciales';
import credencialesDe from '../../../components/cuentas/credencialesDe';
import Alerta from '../../../components/ui/Alerta';
import Buscador from '../../../components/ui/Buscador';
import Cargando from '../../../components/ui/Cargando';
import EstadoBadge from '../../../components/ui/EstadoBadge';
import Paginacion, { paginar } from '../../../components/ui/Paginacion';
import SelectFiltro from '../../../components/ui/SelectFiltro';
import StatCard from '../../../components/ui/StatCard';
import { mensajeError } from '../../../services/api';
import { cargarEstudiantes } from '../../../services/estudiantes';
import {
  edad, iniciales, nombreCiclo, nombreCompleto,
} from '../../../utils/formato';
import MatricularEstudiante from '../matriculas/MatricularEstudiante';
import ResponsableModal from '../responsables/ResponsableModal';
import AsociarResponsable from './AsociarResponsable';
import EstudianteModal from './EstudianteModal';
import ExpedienteModal from './ExpedienteModal';
import SiguientesPasos from './SiguientesPasos';

const FILAS = 10;
const FILTROS_VACIOS = {
  buscar: '', grado: '', seccion: '', estado: '', matricula: '',
};

function tieneAlertaSalud(ficha) {
  return Boolean(ficha && (ficha.padece_enfermedad || ficha.posee_discapacidad || ficha.alergico_medicamento));
}

function IndicadoresSalud({ ficha }) {
  if (!tieneAlertaSalud(ficha)) return <span className="text-[10px] text-gray-600">—</span>;
  return (
    <div className="flex items-center gap-1">
      {ficha.padece_enfermedad && (
        <span title={ficha.tipo_enfermedad || 'Enfermedad'} className="rounded bg-[#EF444420] p-1">
          <Heart size={11} className="text-[#EF4444]" />
        </span>
      )}
      {ficha.posee_discapacidad && (
        <span title={ficha.tipo_discapacidad || 'Discapacidad'} className="rounded bg-[#F59E0B20] p-1">
          <ShieldAlert size={11} className="text-[#F59E0B]" />
        </span>
      )}
      {ficha.alergico_medicamento && (
        <span title={`Alergia: ${ficha.nombre_medicamento_alergico || 'medicamento'}`} className="rounded bg-[#A78BFA20] p-1">
          <Pill size={11} className="text-[#A78BFA]" />
        </span>
      )}
    </div>
  );
}

function descripcion(e) {
  const partes = [];
  if (e.ficha?.sexo) partes.push(e.ficha.sexo.trim() === 'F' ? 'Femenino' : 'Masculino');
  const anios = edad(e.ficha?.fecha_nacimiento);
  if (anios !== null) partes.push(`${anios} años`);
  if (e.ficha?.tipo_sangre) partes.push(e.ficha.tipo_sangre);
  return partes.join(' · ') || 'Sin ficha registrada';
}

export default function Estudiantes() {
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState(null); // { tipo: 'crear' | 'editar' | 'ver' | 'matricular' | 'pasos' | ..., estudiante }
  // Registro en curso de un estudiante nuevo: lo creado y los pasos siguientes ya completados.
  const [flujo, setFlujo] = useState(null);
  const [credenciales, setCredenciales] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setDatos(await cargarEstudiantes());
      setError('');
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los estudiantes.'));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (ubicacion.state?.crear) {
      setModal({ tipo: 'crear', estudiante: null });
      navegar(ubicacion.pathname, { replace: true, state: null });
    }
  }, [ubicacion.state, ubicacion.pathname, navegar]);

  const grados = useMemo(() => {
    const unicos = new Map((datos?.secciones || []).map((s) => [s.id_grado, s.grado]));
    return [...unicos.entries()].sort((a, b) => a[0] - b[0]);
  }, [datos]);

  const secciones = useMemo(
    () => [...(datos?.secciones || [])].sort((a, b) => a.id_grado - b.id_grado || a.nombre.localeCompare(b.nombre)),
    [datos],
  );

  const filtrados = useMemo(() => {
    const termino = filtros.buscar.trim().toLowerCase();
    return (datos?.estudiantes || [])
      .filter((e) => !termino || nombreCompleto(e).toLowerCase().includes(termino)
        || e.codigo_nie.toLowerCase().includes(termino))
      .filter((e) => !filtros.grado || String(e.idGrado) === filtros.grado)
      .filter((e) => !filtros.seccion || e.seccion === filtros.seccion)
      .filter((e) => !filtros.estado || String(e.activo) === filtros.estado)
      .filter((e) => !filtros.matricula || (filtros.matricula === 'con' ? Boolean(e.matricula) : !e.matricula))
      .sort((a, b) => a.apellidos.localeCompare(b.apellidos) || a.nombres.localeCompare(b.nombres));
  }, [datos, filtros]);

  if (error && !datos) return <Alerta>{error}</Alerta>;
  if (!datos) return <Cargando texto="Cargando estudiantes..." />;

  const { pagina: paginaActual, totalPaginas, filas } = paginar(filtrados, pagina, FILAS);
  const hayFiltros = Object.values(filtros).some(Boolean);
  const activos = datos.estudiantes.filter((e) => e.activo).length;
  const sinMatricula = datos.estudiantes.filter((e) => !e.matricula).length;

  function cambiarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
    setPagina(1);
  }

  // Un estudiante recién registrado pasa a la pantalla de pasos siguientes (responsable y matrícula).
  async function alGuardar(mensaje, expediente) {
    if (modal?.tipo === 'crear' && expediente?.estudiante) {
      setFlujo({
        estudiante: expediente.estudiante, credenciales: credencialesDe(expediente), matricula: null, responsables: [],
      });
      setModal({ tipo: 'pasos' });
    } else {
      setModal(null);
      const nuevas = credencialesDe(expediente);
      setCredenciales(nuevas && { ...nuevas, titulo: `Cuenta de ${nombreCompleto(expediente.estudiante)}` });
    }
    setAviso(mensaje);
    await cargar();
  }

  function volver() {
    setModal(flujo ? { tipo: 'pasos' } : null);
  }

  function finalizarFlujo() {
    setFlujo(null);
    setModal(null);
  }

  async function alMatricular(mensaje, detalle) {
    if (flujo) setFlujo((f) => ({ ...f, matricula: detalle }));
    volver();
    setAviso(mensaje);
    await cargar();
  }

  function alAsociarResponsable(nombre, credencialesResponsable = null) {
    setFlujo((f) => ({ ...f, responsables: [...f.responsables, { nombre, credenciales: credencialesResponsable }] }));
    setModal({ tipo: 'pasos' });
    setAviso(`Responsable ${nombre} asociado correctamente.`);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard icono={Users} etiqueta="Total estudiantes" valor={datos.estudiantes.length} color="#c2416b" />
        <StatCard icono={CheckCircle} etiqueta="Activos" valor={activos} color="#10B981" />
        <StatCard icono={XCircle} etiqueta="Inactivos" valor={datos.estudiantes.length - activos} color="#EF4444" />
        <StatCard
          icono={Heart}
          etiqueta="Con indicadores de salud"
          valor={datos.estudiantes.filter((e) => tieneAlertaSalud(e.ficha)).length}
          color="#F59E0B"
        />
        <button
          type="button"
          onClick={() => cambiarFiltro('matricula', filtros.matricula === 'sin' ? '' : 'sin')}
          title="Ver solo los estudiantes sin matrícula en el ciclo activo"
          aria-pressed={filtros.matricula === 'sin'}
          className={`rounded-xl text-left transition-all ${filtros.matricula === 'sin' ? 'ring-2 ring-brand' : 'hover:brightness-110'}`}
        >
          <StatCard icono={ClipboardX} etiqueta="Sin matrícula (ciclo activo)" valor={sinMatricula} color="#60A5FA" />
        </button>
      </div>

      <Alerta tipo="exito">{aviso}</Alerta>
      {credenciales && (
        <Credenciales
          titulo={credenciales.titulo}
          usuario={credenciales.usuario}
          correo={credenciales.correo}
          contrasena={credenciales.contrasena}
          onCerrar={() => setCredenciales(null)}
        />
      )}
      <Alerta>{error}</Alerta>

      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Buscador
            id="buscar-estudiante"
            etiqueta="Buscar estudiante"
            placeholder="Buscar por nombre o NIE..."
            valor={filtros.buscar}
            onChange={(v) => cambiarFiltro('buscar', v)}
          />

          <SelectFiltro
            id="filtro-grado"
            etiqueta="Grado"
            icono={GraduationCap}
            valor={filtros.grado}
            onChange={(v) => cambiarFiltro('grado', v)}
          >
            {grados.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="filtro-seccion"
            etiqueta="Sección"
            icono={Filter}
            valor={filtros.seccion}
            onChange={(v) => cambiarFiltro('seccion', v)}
          >
            {[...new Set(secciones.map((s) => s.nombre.trim()))].sort().map((s) => (
              <option key={s} value={s}>{`Sección ${s}`}</option>
            ))}
          </SelectFiltro>
          <SelectFiltro
            id="filtro-matricula"
            etiqueta="Matrícula"
            icono={ClipboardList}
            valor={filtros.matricula}
            onChange={(v) => cambiarFiltro('matricula', v)}
          >
            <option value="con">Con matrícula</option>
            <option value="sin">Sin matrícula</option>
          </SelectFiltro>
          <SelectFiltro
            id="filtro-estado"
            etiqueta="Estado"
            icono={Filter}
            valor={filtros.estado}
            onChange={(v) => cambiarFiltro('estado', v)}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </SelectFiltro>

          {hayFiltros && (
            <button
              type="button"
              onClick={() => { setFiltros(FILTROS_VACIOS); setPagina(1); }}
              className="px-2 text-xs text-gray-500 transition-colors hover:text-gray-300"
            >
              Limpiar filtros
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => { setAviso(''); setModal({ tipo: 'crear', estudiante: null }); }}
              className="bg-brand-gradient flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold
                text-white transition-opacity hover:opacity-90"
            >
              <Plus size={14} />Registrar estudiante
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-base">
                {['NIE', 'Nombre completo', 'Grado', 'Sección', 'Salud', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <GraduationCap size={36} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-sm text-gray-500">No se encontraron estudiantes</p>
                    <p className="mt-1 text-xs text-gray-600">Intenta con otros filtros o registra un nuevo estudiante</p>
                  </td>
                </tr>
              )}
              {filas.map((e, i) => (
                <tr
                  key={e.id}
                  className={`group border-b border-line transition-colors hover:bg-line/50 ${e.activo ? '' : 'opacity-60'}`}
                >
                  <td className="px-4 py-3">
                    <span className="rounded bg-line px-2 py-0.5 font-mono text-[11px] text-gray-400">{e.codigo_nie}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white
                          ${i % 2 === 0 ? 'bg-brand-dark' : 'bg-brand'}`}
                      >
                        {iniciales(e.nombres, e.apellidos)}
                      </div>
                      <div>
                        <p className="font-display font-semibold whitespace-nowrap text-white">{nombreCompleto(e)}</p>
                        <p className="text-[10px] text-gray-500">{descripcion(e)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-200">{e.grado || <span className="text-gray-600">Sin matrícula</span>}</td>
                  <td className="px-4 py-3">
                    {e.seccion ? (
                      <span className="bg-brand-gradient flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-white">
                        {e.seccion}
                      </span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3"><IndicadoresSalud ficha={e.ficha} /></td>
                  <td className="px-4 py-3"><EstadoBadge activo={e.activo} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setModal({ tipo: 'ver', estudiante: e })}
                        title="Ver expediente"
                        aria-label={`Ver expediente de ${nombreCompleto(e)}`}
                        className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-brand/10 hover:text-brand-soft"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAviso(''); setModal({ tipo: 'editar', estudiante: e }); }}
                        title="Editar"
                        aria-label={`Editar a ${nombreCompleto(e)}`}
                        className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-[#F59E0B]/10 hover:text-[#F59E0B]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAviso(''); setModal({ tipo: 'matricular', estudiante: e }); }}
                        title="Matricular"
                        aria-label={`Matricular a ${nombreCompleto(e)}`}
                        className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-[#10B981]/10 hover:text-[#10B981]"
                      >
                        <ClipboardPlus size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Paginacion
          pagina={paginaActual}
          totalPaginas={totalPaginas}
          total={filtrados.length}
          porPagina={FILAS}
          onCambiar={setPagina}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500">
        <span className="font-medium text-gray-400">Indicadores de salud:</span>
        <span className="flex items-center gap-1 text-[#EF4444]"><Heart size={11} />Enfermedad</span>
        <span className="flex items-center gap-1 text-[#F59E0B]"><ShieldAlert size={11} />Discapacidad</span>
        <span className="flex items-center gap-1 text-[#A78BFA]"><Pill size={11} />Alergia a medicamentos</span>
        <span className="ml-auto">{`Grado y sección según la matrícula del ${nombreCiclo(datos.ciclo).toLowerCase()}`}</span>
      </div>

      {(modal?.tipo === 'crear' || modal?.tipo === 'editar') && (
        <EstudianteModal
          estudiante={modal.estudiante}
          onClose={() => setModal(null)}
          onGuardado={alGuardar}
        />
      )}
      {modal?.tipo === 'matricular' && (
        <MatricularEstudiante
          estudiante={modal.estudiante || flujo?.estudiante}
          onClose={volver}
          onRegistrada={alMatricular}
        />
      )}
      {modal?.tipo === 'pasos' && flujo && (
        <SiguientesPasos
          flujo={flujo}
          onMatricular={() => setModal({ tipo: 'matricular' })}
          onAsociar={() => setModal({ tipo: 'asociar' })}
          onCrearResponsable={() => setModal({ tipo: 'nuevoResponsable' })}
          onFinalizar={finalizarFlujo}
        />
      )}
      {modal?.tipo === 'asociar' && flujo && (
        <AsociarResponsable
          estudiante={flujo.estudiante}
          onClose={volver}
          onAsociado={alAsociarResponsable}
          onCrearNuevo={() => setModal({ tipo: 'nuevoResponsable' })}
        />
      )}
      {modal?.tipo === 'nuevoResponsable' && flujo && (
        <ResponsableModal
          estudiantes={datos.estudiantes}
          estudiantesIniciales={[{ ...flujo.estudiante, es_contacto_principal: flujo.responsables.length === 0 }]}
          onClose={volver}
          onGuardado={(mensaje, familia) => alAsociarResponsable(nombreCompleto(familia.responsable), credencialesDe(familia))}
        />
      )}
      {modal?.tipo === 'ver' && (
        <ExpedienteModal
          estudiante={modal.estudiante}
          onClose={() => setModal(null)}
          onEditar={() => setModal({ tipo: 'editar', estudiante: modal.estudiante })}
        />
      )}
    </div>
  );
}
