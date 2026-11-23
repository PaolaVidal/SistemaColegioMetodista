import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  CheckCircle, Eye, Filter, Pencil, Plus, ToggleLeft, ToggleRight, Users, XCircle,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Buscador from '../../../components/ui/Buscador';
import Cargando from '../../../components/ui/Cargando';
import EstadoBadge from '../../../components/ui/EstadoBadge';
import Paginacion, { paginar } from '../../../components/ui/Paginacion';
import Pill from '../../../components/ui/Pill';
import SelectFiltro from '../../../components/ui/SelectFiltro';
import StatCard from '../../../components/ui/StatCard';
import { mensajeError } from '../../../services/api';
import { cargarUsuarios, guardarUsuario } from '../../../services/usuarios';
import useAuthStore from '../../../store/authStore';
import { fechaCorta, nombreCompleto } from '../../../utils/formato';
import estiloRol from './roles';
import UsuarioModal from './UsuarioModal';

const FILAS = 10;
const FILTROS_VACIOS = { buscar: '', rol: '', estado: '' };

export default function Usuarios() {
  const usuarioActual = useAuthStore((s) => s.usuario);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState(null); // { modo: 'crear' | 'editar' | 'ver', usuario }
  const [procesando, setProcesando] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setDatos(await cargarUsuarios());
      setError('');
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los usuarios.'));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const termino = filtros.buscar.trim().toLowerCase();
    return (datos?.usuarios || [])
      .filter((u) => !termino || u.nombre_usuario.toLowerCase().includes(termino)
        || u.correo.toLowerCase().includes(termino)
        || (u.persona && nombreCompleto(u.persona).toLowerCase().includes(termino)))
      .filter((u) => !filtros.rol || String(u.id_rol) === filtros.rol)
      .filter((u) => !filtros.estado || String(u.activo) === filtros.estado)
      .sort((a, b) => a.nombre_usuario.localeCompare(b.nombre_usuario, 'es', { numeric: true }));
  }, [datos, filtros]);

  if (error && !datos) return <Alerta>{error}</Alerta>;
  if (!datos) return <Cargando texto="Cargando usuarios..." />;

  const { pagina: paginaActual, totalPaginas, filas } = paginar(filtrados, pagina, FILAS);
  const activos = datos.usuarios.filter((u) => u.activo).length;
  const hayFiltros = Object.values(filtros).some(Boolean);

  function cambiarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
    setPagina(1);
  }

  async function alGuardar(mensaje) {
    setModal(null);
    setAviso(mensaje);
    await cargar();
  }

  async function alternarEstado(usuario) {
    setProcesando(usuario.id);
    setAviso('');
    try {
      await guardarUsuario(usuario.id, { activo: !usuario.activo });
      setAviso(usuario.activo ? `Usuario ${usuario.nombre_usuario} desactivado.` : `Usuario ${usuario.nombre_usuario} activado.`);
      await cargar();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo cambiar el estado.'));
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icono={Users} etiqueta="Total usuarios" valor={datos.usuarios.length} color="#c2416b" />
        <StatCard icono={CheckCircle} etiqueta="Activos" valor={activos} color="#10B981" />
        <StatCard icono={XCircle} etiqueta="Inactivos" valor={datos.usuarios.length - activos} color="#EF4444" />
        <StatCard
          icono={Users}
          etiqueta="Docentes"
          valor={datos.usuarios.filter((u) => u.rol === 'Docente').length}
          color="#F59E0B"
        />
      </div>

      <Alerta tipo="exito">{aviso}</Alerta>
      <Alerta>{error}</Alerta>

      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Buscador
            id="buscar-usuario"
            etiqueta="Buscar usuario"
            placeholder="Buscar por usuario, correo o persona..."
            valor={filtros.buscar}
            onChange={(v) => cambiarFiltro('buscar', v)}
          />
          <SelectFiltro
            id="filtro-rol"
            etiqueta="Todos los roles"
            icono={Filter}
            valor={filtros.rol}
            onChange={(v) => cambiarFiltro('rol', v)}
          >
            {datos.roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="filtro-estado-usuario"
            etiqueta="Todos los estados"
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
            <span className="text-xs text-gray-500">{`${filtrados.length} resultado${filtrados.length !== 1 ? 's' : ''}`}</span>
            <button
              type="button"
              onClick={() => { setAviso(''); setModal({ modo: 'crear', usuario: null }); }}
              className="bg-brand-gradient flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold
                text-white transition-opacity hover:opacity-90"
            >
              <Plus size={14} />Nuevo usuario
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-base">
                {['Usuario', 'Correo electrónico', 'Rol', 'Estado', 'Último acceso', 'Registro', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <Users size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No se encontraron usuarios</p>
                  </td>
                </tr>
              )}
              {filas.map((u, i) => {
                const { color, icono } = estiloRol(u.rol);
                const esPropio = u.id === usuarioActual?.id;
                let tituloEstado = u.activo ? 'Desactivar' : 'Activar';
                if (esPropio) tituloEstado = 'No puede desactivar su propia cuenta';
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-line transition-colors hover:bg-line/60 ${u.activo ? '' : 'opacity-65'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white
                            ${i % 2 === 0 ? 'bg-brand-dark' : 'bg-brand'}`}
                        >
                          {u.nombre_usuario.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-display font-semibold text-white">
                            {u.nombre_usuario}
                            {esPropio && <span className="ml-1.5 text-[10px] font-normal text-brand-soft">(tú)</span>}
                          </p>
                          <p className="text-[10px] text-gray-500">{u.persona ? nombreCompleto(u.persona) : 'Sin persona vinculada'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{u.correo}</td>
                    <td className="px-4 py-3"><Pill color={color} icono={icono}>{u.rol}</Pill></td>
                    <td className="px-4 py-3"><EstadoBadge activo={u.activo} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{u.ultimo_login ? fechaCorta(u.ultimo_login) : 'Nunca'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{fechaCorta(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setModal({ modo: 'ver', usuario: u })}
                          title="Ver"
                          aria-label={`Ver usuario ${u.nombre_usuario}`}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-brand/10 hover:text-brand-soft"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAviso(''); setModal({ modo: 'editar', usuario: u }); }}
                          title="Editar"
                          aria-label={`Editar usuario ${u.nombre_usuario}`}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#F59E0B]/10 hover:text-[#F59E0B]"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => alternarEstado(u)}
                          disabled={esPropio || procesando === u.id}
                          title={tituloEstado}
                          aria-label={`${u.activo ? 'Desactivar' : 'Activar'} usuario ${u.nombre_usuario}`}
                          className={`rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30
                            ${u.activo ? 'text-gray-400 hover:text-[#EF4444]' : 'text-[#10B981] hover:text-[#34D399]'}`}
                        >
                          {u.activo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
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
          total={filtrados.length}
          porPagina={FILAS}
          onCambiar={setPagina}
        />
      </div>

      {modal && (
        <UsuarioModal
          key={`${modal.modo}-${modal.usuario?.id ?? 'nuevo'}`}
          modo={modal.modo}
          usuario={modal.usuario}
          roles={datos.roles}
          onClose={() => setModal(null)}
          onEditar={() => setModal({ modo: 'editar', usuario: modal.usuario })}
          onGuardado={alGuardar}
        />
      )}
    </div>
  );
}
