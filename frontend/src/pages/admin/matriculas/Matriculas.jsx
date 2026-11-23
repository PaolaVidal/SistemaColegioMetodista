import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar, Check, CheckCircle, ClipboardList, Eye, Filter, GraduationCap, Layers, Pencil, Plus, RotateCcw, UserPlus,
  XCircle,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Buscador from '../../../components/ui/Buscador';
import Cargando from '../../../components/ui/Cargando';
import Paginacion, { paginar } from '../../../components/ui/Paginacion';
import Pill from '../../../components/ui/Pill';
import SelectFiltro from '../../../components/ui/SelectFiltro';
import StatCard from '../../../components/ui/StatCard';
import { mensajeError } from '../../../services/api';
import { cargarMatriculas } from '../../../services/matriculas';
import {
  fechaCorta, iniciales, nombreCiclo, nombreCompleto,
} from '../../../utils/formato';
import { ESTADOS_MATRICULA, codigoMatricula } from './estados';
import MatriculaModal from './MatriculaModal';
import MatriculaWizard from './MatriculaWizard';

const FILAS = 10;

function filtrosIniciales(cicloActivo) {
  return {
    buscar: '', ciclo: cicloActivo ? String(cicloActivo.id) : '', grado: '', seccion: '', estado: '',
  };
}

export default function Matriculas() {
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [filtros, setFiltros] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [asistente, setAsistente] = useState(false);
  const [modal, setModal] = useState(null); // { modo: 'ver' | 'editar', matricula }

  const cargar = useCallback(async () => {
    try {
      const resultado = await cargarMatriculas();
      setDatos(resultado);
      setFiltros((actual) => actual ?? filtrosIniciales(resultado.cicloActivo));
      setError('');
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar las matrículas.'));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (ubicacion.state?.crear) {
      setAsistente(true);
      navegar(ubicacion.pathname, { replace: true, state: null });
    }
  }, [ubicacion.state, ubicacion.pathname, navegar]);

  const filtradas = useMemo(() => {
    if (!datos || !filtros) return [];
    const termino = filtros.buscar.trim().toLowerCase();
    return datos.matriculas
      .filter((m) => !termino || nombreCompleto(m.estudiante).toLowerCase().includes(termino)
        || m.estudiante?.codigo_nie.includes(termino) || codigoMatricula(m).toLowerCase().includes(termino))
      .filter((m) => !filtros.ciclo || String(m.id_ciclo) === filtros.ciclo)
      .filter((m) => !filtros.grado || String(m.idGrado) === filtros.grado)
      .filter((m) => !filtros.seccion || m.seccion === filtros.seccion)
      .filter((m) => !filtros.estado || m.estadoTexto === filtros.estado)
      .sort((a, b) => a.idGrado - b.idGrado || a.seccion.localeCompare(b.seccion)
        || (a.estudiante?.apellidos || '').localeCompare(b.estudiante?.apellidos || ''));
  }, [datos, filtros]);

  if (error && !datos) return <Alerta>{error}</Alerta>;
  if (!datos || !filtros) return <Cargando texto="Cargando matrículas..." />;

  const { pagina: paginaActual, totalPaginas, filas } = paginar(filtradas, pagina, FILAS);
  const contar = (estado) => datos.matriculas.filter((m) => m.estadoTexto === estado).length;
  const grados = [...new Map(datos.secciones.map((s) => [s.id_grado, s.grado])).entries()].sort((a, b) => a[0] - b[0]);
  const nombresSeccion = [...new Set(datos.secciones.map((s) => s.nombre))].sort();
  const hayFiltros = JSON.stringify(filtros) !== JSON.stringify(filtrosIniciales(datos.cicloActivo));

  function cambiarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
    setPagina(1);
  }

  // Lleva al registro de estudiantes; al guardar, allí se abre el asistente de matrícula para el nuevo estudiante.
  function registrarEstudiante() {
    navegar('/admin/estudiantes', { state: { crear: true, matricular: true } });
  }

  async function alGuardar(mensaje) {
    setModal(null);
    setAsistente(false);
    setAviso(mensaje);
    await cargar();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icono={ClipboardList} etiqueta="Total matrículas" valor={datos.matriculas.length} color="#c2416b" />
        <StatCard icono={CheckCircle} etiqueta="Activas" valor={contar('Activa')} color="#10B981" />
        <StatCard icono={Check} etiqueta="Finalizadas" valor={contar('Finalizada')} color="#9CA3AF" />
        <StatCard icono={XCircle} etiqueta="Anuladas" valor={contar('Anulada')} color="#EF4444" />
      </div>

      <Alerta tipo="exito">{aviso}</Alerta>
      <Alerta>{error}</Alerta>

      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Buscador
            id="buscar-matricula"
            etiqueta="Buscar matrícula"
            placeholder="Buscar por estudiante, NIE o código de matrícula..."
            valor={filtros.buscar}
            onChange={(v) => cambiarFiltro('buscar', v)}
          />
          <SelectFiltro id="filtro-ciclo" etiqueta="Ciclo" icono={Calendar} valor={filtros.ciclo} onChange={(v) => cambiarFiltro('ciclo', v)}>
            {datos.ciclos.map((c) => <option key={c.id} value={c.id}>{nombreCiclo(c)}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="filtro-grado-matricula"
            etiqueta="Grado"
            icono={GraduationCap}
            valor={filtros.grado}
            onChange={(v) => cambiarFiltro('grado', v)}
          >
            {grados.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="filtro-seccion-matricula"
            etiqueta="Sección"
            icono={Layers}
            valor={filtros.seccion}
            onChange={(v) => cambiarFiltro('seccion', v)}
          >
            {nombresSeccion.map((s) => <option key={s} value={s}>{`Sección ${s}`}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="filtro-estado-matricula"
            etiqueta="Estado"
            icono={Filter}
            valor={filtros.estado}
            onChange={(v) => cambiarFiltro('estado', v)}
          >
            {Object.keys(ESTADOS_MATRICULA).map((e) => <option key={e} value={e}>{e}</option>)}
          </SelectFiltro>
          {hayFiltros && (
            <button
              type="button"
              onClick={() => { setFiltros(filtrosIniciales(datos.cicloActivo)); setPagina(1); }}
              className="flex items-center gap-1 px-2 text-xs text-gray-500 transition-colors hover:text-gray-300"
            >
              <RotateCcw size={11} />Limpiar
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500">{`${filtradas.length} resultado${filtradas.length !== 1 ? 's' : ''}`}</span>
            <button
              type="button"
              onClick={registrarEstudiante}
              title="Registrar un estudiante que aún no está en el sistema"
              className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 font-display text-xs font-semibold
                text-gray-300 transition-colors hover:border-brand/50 hover:text-brand-soft"
            >
              <UserPlus size={14} />Nuevo estudiante
            </button>
            <button
              type="button"
              onClick={() => { setAviso(''); setAsistente(true); }}
              className="bg-brand-gradient flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold
                text-white transition-opacity hover:opacity-90"
            >
              <Plus size={14} />Registrar matrícula
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-base">
                {['Código', 'Estudiante', 'Ciclo', 'Grado', 'Sección', 'Fecha de matrícula', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <ClipboardList size={36} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-sm text-gray-500">No se encontraron matrículas</p>
                    <p className="mt-1 text-xs text-gray-600">Intenta con otros filtros o registra una nueva matrícula</p>
                  </td>
                </tr>
              )}
              {filas.map((m, i) => {
                const { color, icono } = ESTADOS_MATRICULA[m.estadoTexto];
                return (
                  <tr
                    key={m.id}
                    className={`group border-b border-line transition-colors hover:bg-line/50 ${m.estadoTexto === 'Anulada' ? 'opacity-55' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="rounded bg-line px-2 py-0.5 font-mono text-[11px] text-gray-400">{codigoMatricula(m)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white
                            ${i % 2 === 0 ? 'bg-brand-dark' : 'bg-brand'}`}
                        >
                          {iniciales(m.estudiante?.nombres, m.estudiante?.apellidos)}
                        </div>
                        <div>
                          <p className="font-display font-semibold whitespace-nowrap text-white">{nombreCompleto(m.estudiante)}</p>
                          <p className="font-mono text-[10px] text-gray-500">{m.estudiante?.codigo_nie}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">{String(m.ciclo?.fecha_inicio).slice(0, 4)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-200">{m.grado}</td>
                    <td className="px-4 py-3">
                      <span className="bg-brand-gradient flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-white">
                        {m.seccion}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{fechaCorta(m.fecha_matricula)}</td>
                    <td className="px-4 py-3"><Pill color={color} icono={icono}>{m.estadoTexto}</Pill></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => setModal({ modo: 'ver', matricula: m })}
                          title="Ver detalle"
                          aria-label={`Ver matrícula de ${nombreCompleto(m.estudiante)}`}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-brand/10 hover:text-brand-soft"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAviso(''); setModal({ modo: 'editar', matricula: m }); }}
                          title="Editar"
                          aria-label={`Editar matrícula de ${nombreCompleto(m.estudiante)}`}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#F59E0B]/10 hover:text-[#F59E0B]"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Paginacion
          pagina={paginaActual}
          totalPaginas={totalPaginas}
          total={filtradas.length}
          porPagina={FILAS}
          onCambiar={setPagina}
        />
      </div>

      {asistente && (
        <MatriculaWizard
          estudiantes={datos.estudiantes}
          ciclos={datos.ciclos}
          secciones={datos.secciones}
          matriculas={datos.matriculas}
          aranceles={datos.aranceles}
          descuentos={datos.descuentos}
          onNuevoEstudiante={registrarEstudiante}
          onClose={() => setAsistente(false)}
          onRegistrada={alGuardar}
        />
      )}
      {modal && (
        <MatriculaModal
          key={`${modal.modo}-${modal.matricula.id}`}
          modo={modal.modo}
          matricula={modal.matricula}
          secciones={datos.secciones}
          onClose={() => setModal(null)}
          onEditar={() => setModal({ modo: 'editar', matricula: modal.matricula })}
          onGuardado={alGuardar}
        />
      )}
    </div>
  );
}
