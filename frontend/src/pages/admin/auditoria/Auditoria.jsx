import { useEffect, useState } from 'react';
import {
  Database, Edit3, Eye, Filter, Lock, PlusCircle, RotateCcw, Shield, Table2, Trash2, User,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Cargando from '../../../components/ui/Cargando';
import Drawer from '../../../components/ui/Drawer';
import Paginacion from '../../../components/ui/Paginacion';
import Pill from '../../../components/ui/Pill';
import SelectFiltro from '../../../components/ui/SelectFiltro';
import StatCard from '../../../components/ui/StatCard';
import { mensajeError } from '../../../services/api';
import {
  ACCIONES, cargarPaginaAuditoria, diferencias, resumenAuditoria,
} from '../../../services/auditoria';

const POR_PAGINA = 25;
const ESTILO_ACCION = {
  Crear: { color: '#10B981', icono: PlusCircle },
  Actualizar: { color: '#F59E0B', icono: Edit3 },
  Eliminar: { color: '#EF4444', icono: Trash2 },
};
const TABLAS = { calificaciones: 'Calificaciones' };
// Valores que escribe el trigger `registrar_auditoria_calificaciones` en `origen`.
const ORIGENES = {
  api: 'Aplicación', sql: 'SQL directo', seeder: 'Datos iniciales', legado: 'Legado',
};

function fechaHora(valor) {
  return new Date(String(valor).replace(' ', 'T')).toLocaleString('es-SV', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function mostrar(valor) {
  if (valor === undefined || valor === null) return '—';
  return typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
}

function filtrosConsulta(filtros) {
  return Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''));
}

function DetalleAuditoria({ registro, onClose }) {
  const cambios = diferencias(registro);
  const { color, icono: Icono } = ESTILO_ACCION[registro.accion] || ESTILO_ACCION.Actualizar;
  return (
    <Drawer
      titulo={`${registro.accion} en ${TABLAS[registro.nombre_tabla] || registro.nombre_tabla}`}
      subtitulo={`Registro #${registro.id_registro} · ${fechaHora(registro.fecha_creacion)}`}
      onClose={onClose}
      encabezado={(
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}20` }}>
          <Icono size={18} style={{ color }} />
        </div>
      )}
    >
      <div className="space-y-4 p-5">
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          {[
            ['Usuario de la aplicación', registro.usuario?.nombre_usuario || 'Sin usuario (proceso del sistema)'],
            ['Usuario de base de datos', registro.usuario_bd || '—'],
            ['Origen', ORIGENES[registro.origen] || registro.origen],
            ['Tabla', registro.nombre_tabla],
            ['ID del registro', registro.id_registro],
            ['ID de auditoría', registro.id],
          ].map(([etiqueta, valor]) => (
            <div key={etiqueta} className="flex justify-between gap-4 border-b border-line px-4 py-2.5 text-xs last:border-b-0">
              <span className="text-gray-500">{etiqueta}</span>
              <span className="text-right font-medium text-white">{valor}</span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="border-b border-line px-4 py-3">
            <p className="font-display text-xs font-semibold text-white">{`Cambios registrados (${cambios.length})`}</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line">
                {['Campo', 'Antes', 'Después'].map((h) => <th key={h} className="px-4 py-2 text-left font-semibold text-gray-400">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {cambios.map((c) => (
                <tr key={c.campo} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-300">{c.campo}</td>
                  <td className="px-4 py-2 text-[#EF4444]">{mostrar(c.anterior)}</td>
                  <td className="px-4 py-2 text-[#10B981]">{mostrar(c.nuevo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <Lock size={11} />La bitácora es inmutable: la base de datos rechaza modificaciones o eliminaciones.
        </p>
      </div>
    </Drawer>
  );
}

const FILTROS_VACIOS = {
  accion: '', origen: '', id_usuario: '', nombre_tabla: '',
};

export default function Auditoria() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    const consulta = filtrosConsulta(filtros);
    Promise.all([
      cargarPaginaAuditoria({ pagina, porPagina: POR_PAGINA, filtros: consulta }),
      resumenAuditoria(consulta),
    ])
      .then(([pag, res]) => {
        if (!vigente) return;
        setDatos(pag);
        setResumen(res);
        setError('');
      })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudo cargar la auditoría.')); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [filtros, pagina]);

  if (!datos) return error ? <Alerta>{error}</Alerta> : <Cargando texto="Cargando auditoría..." />;

  function cambiarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
    setPagina(1);
  }

  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icono={Shield} etiqueta="Eventos registrados" valor={resumen.total.toLocaleString('es-SV')} color="#c2416b" />
        {ACCIONES.map((a) => (
          <StatCard
            key={a}
            icono={ESTILO_ACCION[a].icono}
            etiqueta={a === 'Crear' ? 'Creaciones' : `${a === 'Actualizar' ? 'Modificaciones' : 'Eliminaciones'}`}
            valor={resumen.porAccion[a].toLocaleString('es-SV')}
            color={ESTILO_ACCION[a].color}
          />
        ))}
      </div>

      <Alerta>{error}</Alerta>

      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SelectFiltro id="aud-accion" etiqueta="Todas las acciones" icono={Filter} valor={filtros.accion} onChange={(v) => cambiarFiltro('accion', v)}>
            {ACCIONES.map((a) => <option key={a} value={a}>{a}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="aud-tabla"
            etiqueta="Todos los módulos"
            icono={Table2}
            valor={filtros.nombre_tabla}
            onChange={(v) => cambiarFiltro('nombre_tabla', v)}
          >
            {Object.entries(TABLAS).map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
          </SelectFiltro>
          <SelectFiltro id="aud-origen" etiqueta="Todos los orígenes" icono={Database} valor={filtros.origen} onChange={(v) => cambiarFiltro('origen', v)}>
            {Object.entries(ORIGENES).map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
          </SelectFiltro>
          <SelectFiltro
            id="aud-usuario"
            etiqueta="Todos los usuarios"
            icono={User}
            valor={filtros.id_usuario}
            onChange={(v) => cambiarFiltro('id_usuario', v)}
          >
            {datos.usuarios.filter((u) => !u.nombre_usuario.startsWith('estudiante') && !u.nombre_usuario.startsWith('encargado'))
              .map((u) => <option key={u.id} value={u.id}>{u.nombre_usuario}</option>)}
          </SelectFiltro>
          {hayFiltros && (
            <button
              type="button"
              onClick={() => { setFiltros(FILTROS_VACIOS); setPagina(1); }}
              className="flex items-center gap-1 px-2 text-xs text-gray-500 transition-colors hover:text-gray-300"
            >
              <RotateCcw size={11} />Limpiar
            </button>
          )}
          <span className="ml-auto text-xs text-gray-500">{cargando ? 'Actualizando...' : `${datos.total.toLocaleString('es-SV')} eventos`}</span>
        </div>
      </div>

      <div className={`overflow-hidden rounded-xl border border-line bg-card transition-opacity ${cargando ? 'opacity-60' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-base">
                {['Fecha y hora', 'Usuario', 'Acción', 'Módulo', 'Registro', 'Cambios', 'Origen', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.registros.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">Sin eventos para los filtros seleccionados</td></tr>
              )}
              {datos.registros.map((r) => {
                const { color, icono } = ESTILO_ACCION[r.accion] || ESTILO_ACCION.Actualizar;
                const cambios = diferencias(r);
                return (
                  <tr key={r.id} className="group border-b border-line transition-colors hover:bg-line/40">
                    <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap text-gray-400">{fechaHora(r.fecha_creacion)}</td>
                    <td className="px-4 py-3">
                      <p className="font-display font-semibold text-white">{r.usuario?.nombre_usuario || 'Sistema'}</p>
                      <p className="text-[10px] text-gray-600">{r.usuario_bd}</p>
                    </td>
                    <td className="px-4 py-3"><Pill color={color} icono={icono}>{r.accion}</Pill></td>
                    <td className="px-4 py-3 text-gray-300">{TABLAS[r.nombre_tabla] || r.nombre_tabla}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-400">{`#${r.id_registro}`}</td>
                    <td className="max-w-64 truncate px-4 py-3 text-gray-400">
                      {cambios.slice(0, 3).map((c) => `${c.campo}: ${mostrar(c.nuevo)}`).join(' · ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-line px-2 py-0.5 text-[10px] whitespace-nowrap text-gray-400">{ORIGENES[r.origen] || r.origen}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetalle(r)}
                        aria-label={`Ver detalle del evento ${r.id}`}
                        title="Ver detalle"
                        className="rounded-lg p-1.5 text-gray-500 opacity-70 transition-all group-hover:opacity-100 hover:bg-brand/10 hover:text-brand-soft"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Paginacion
          pagina={pagina}
          totalPaginas={datos.ultimaPagina || 1}
          total={datos.total}
          porPagina={POR_PAGINA}
          onCambiar={setPagina}
          unidad="eventos"
        />
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-gray-600">
        <Lock size={11} />
        Solo lectura. Actualmente se auditan los cambios de calificaciones,
        incluidos los hechos directamente en la base.
      </p>

      {detalle && <DetalleAuditoria registro={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
}
