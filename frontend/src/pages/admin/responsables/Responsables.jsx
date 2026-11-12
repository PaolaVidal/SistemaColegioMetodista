import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Contact, Filter, KeyRound, Pencil, Plus, Star, UserX, Users,
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
import { cargarResponsables } from '../../../services/responsables';
import { iniciales, nombreCompleto } from '../../../utils/formato';
import ResponsableModal from './ResponsableModal';

const FILAS = 10;
const FILTROS_VACIOS = { buscar: '', vinculo: '', estado: '' };

export default function Responsables() {
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState(null); // { responsable | null }
  const [credenciales, setCredenciales] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setDatos(await cargarResponsables());
      setError('');
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los responsables.'));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (ubicacion.state?.crear) {
      setModal({ responsable: null });
      navegar(ubicacion.pathname, { replace: true, state: null });
    }
  }, [ubicacion.state, ubicacion.pathname, navegar]);

  const filtrados = useMemo(() => {
    const termino = filtros.buscar.trim().toLowerCase();
    return (datos?.responsables || [])
      .filter((r) => !termino || nombreCompleto(r).toLowerCase().includes(termino) || r.dui.includes(termino)
        || r.estudiantes.some((e) => nombreCompleto(e).toLowerCase().includes(termino)))
      .filter((r) => !filtros.vinculo || (filtros.vinculo === 'con' ? r.estudiantes.length > 0 : r.estudiantes.length === 0))
      .filter((r) => !filtros.estado || String(Boolean(r.activo)) === filtros.estado);
  }, [datos, filtros]);

  if (error && !datos) return <Alerta>{error}</Alerta>;
  if (!datos) return <Cargando texto="Cargando responsables..." />;

  const { pagina: paginaActual, totalPaginas, filas } = paginar(filtrados, pagina, FILAS);
  const hayFiltros = Object.values(filtros).some(Boolean);
  const { responsables } = datos;

  function cambiarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
    setPagina(1);
  }

  async function alGuardar(mensaje, familia) {
    setModal(null);
    setAviso(mensaje);
    setCredenciales(credencialesDe(familia) && { ...credencialesDe(familia), titulo: `Cuenta de ${nombreCompleto(familia.responsable)}` });
    await cargar();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icono={Contact} etiqueta="Total responsables" valor={responsables.length} color="#c2416b" />
        <StatCard icono={CheckCircle} etiqueta="Activos" valor={responsables.filter((r) => r.activo).length} color="#10B981" />
        <StatCard icono={KeyRound} etiqueta="Con cuenta de acceso" valor={responsables.filter((r) => r.id_usuario).length} color="#8B5CF6" />
        <StatCard icono={UserX} etiqueta="Sin estudiantes" valor={responsables.filter((r) => !r.estudiantes.length).length} color="#F59E0B" />
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
            id="buscar-responsable"
            etiqueta="Buscar responsable"
            placeholder="Buscar por responsable, DUI o estudiante..."
            valor={filtros.buscar}
            onChange={(v) => cambiarFiltro('buscar', v)}
          />
          <SelectFiltro id="filtro-vinculo" etiqueta="Estudiantes" icono={Users} valor={filtros.vinculo} onChange={(v) => cambiarFiltro('vinculo', v)}>
            <option value="con">Con estudiantes</option>
            <option value="sin">Sin estudiantes</option>
          </SelectFiltro>
          <SelectFiltro id="filtro-estado-resp" etiqueta="Estado" icono={Filter} valor={filtros.estado} onChange={(v) => cambiarFiltro('estado', v)}>
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
            <span className="text-xs text-gray-500">{`${filtrados.length} resultado${filtrados.length !== 1 ? 's' : ''}`}</span>
            <button
              type="button"
              onClick={() => { setAviso(''); setModal({ responsable: null }); }}
              className="bg-brand-gradient flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold
                text-white transition-opacity hover:opacity-90"
            >
              <Plus size={14} />Registrar responsable
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-base">
                {['Responsable', 'DUI', 'Contacto', 'Estudiantes a cargo', 'Cuenta', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <Contact size={36} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-sm text-gray-500">No se encontraron responsables</p>
                  </td>
                </tr>
              )}
              {filas.map((r) => (
                <tr key={r.id} className={`group border-b border-line transition-colors hover:bg-line/50 ${r.activo ? '' : 'opacity-60'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-dark flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                        {iniciales(r.nombres, r.apellidos)}
                      </div>
                      <div>
                        <p className="font-display font-semibold whitespace-nowrap text-white">{nombreCompleto(r)}</p>
                        <p className="text-[10px] text-gray-500">{r.parentesco?.trim() || 'Parentesco sin especificar'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-400">{r.dui}</td>
                  <td className="px-4 py-3 text-gray-300">
                    <p>{r.telefono || '—'}</p>
                    <p className="text-[10px] text-gray-500">{r.correo || ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-72 flex-wrap gap-1">
                      {r.estudiantes.length === 0 && <span className="text-gray-600">Ninguno</span>}
                      {r.estudiantes.map((e) => (
                        <span key={e.id} className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] text-brand-soft">
                          {e.es_contacto_principal && <Star size={9} fill="currentColor" className="text-[#F59E0B]" />}
                          {nombreCompleto(e)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.id_usuario
                      ? <span className="rounded-full bg-[#8B5CF620] px-2 py-0.5 text-[10px] text-[#A78BFA]">Con cuenta</span>
                      : <span className="text-[10px] text-gray-600">Sin cuenta</span>}
                  </td>
                  <td className="px-4 py-3"><EstadoBadge activo={r.activo} /></td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => { setAviso(''); setModal({ responsable: r }); }}
                      title="Editar"
                      aria-label={`Editar a ${nombreCompleto(r)}`}
                      className="rounded-lg p-1.5 text-gray-400 opacity-70 transition-all group-hover:opacity-100 hover:bg-[#F59E0B]/10
                        hover:text-[#F59E0B]"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginacion pagina={paginaActual} totalPaginas={totalPaginas} total={filtrados.length} porPagina={FILAS} onCambiar={setPagina} />
      </div>

      <p className="flex items-center gap-1 text-[11px] text-gray-500">
        <Star size={10} fill="currentColor" className="text-[#F59E0B]" />Contacto principal del estudiante
      </p>

      {modal && (
        <ResponsableModal
          key={modal.responsable?.id || 'nuevo'}
          responsable={modal.responsable}
          estudiantes={datos.estudiantes}
          onClose={() => setModal(null)}
          onGuardado={alGuardar}
        />
      )}
    </div>
  );
}
