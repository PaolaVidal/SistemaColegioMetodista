import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, BadgePercent, Calendar, Clock, DollarSign, Filter, GraduationCap, Receipt, RotateCcw, Tag,
  TrendingUp,
  Users, Wallet,
} from 'lucide-react';
import Alerta from '../../../components/ui/Alerta';
import Buscador from '../../../components/ui/Buscador';
import Cargando from '../../../components/ui/Cargando';
import Paginacion, { paginar } from '../../../components/ui/Paginacion';
import SelectFiltro from '../../../components/ui/SelectFiltro';
import { mensajeError } from '../../../services/api';
import { cargarFinanzas } from '../../../services/pagos';
import { dinero, nombreCompleto } from '../../../utils/formato';
import ArancelesDescuentos from './aranceles/ArancelesDescuentos';
import EstadoCuentaDrawer from './EstadoCuentaDrawer';
import { ESTADOS_CUENTA, PRIORIDAD } from './estados';
import RegistrarPagoModal from './RegistrarPagoModal';
import { TablaCuentas, TablaEstados, TablaPagosRecibidos } from './TablasPagos';

const FILAS = 12;
const FILTROS_VACIOS = {
  buscar: '', concepto: '', estado: '', grado: '',
};
const PESTANAS = [
  { id: 'cuentas', etiqueta: 'Cuentas por cobrar', icono: DollarSign },
  { id: 'estados', etiqueta: 'Estados de cuenta', icono: Activity },
  { id: 'pendientes', etiqueta: 'Pagos pendientes', icono: AlertTriangle },
  { id: 'recibidos', etiqueta: 'Pagos recibidos', icono: Receipt },
  { id: 'aranceles', etiqueta: 'Aranceles', icono: Tag },
  { id: 'descuentos', etiqueta: 'Descuentos y becas', icono: BadgePercent },
];
const PESTANAS_ARANCELES = ['aranceles', 'descuentos'];

function Kpi({
  icono: Icono, etiqueta, valor, detalle, color,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-card p-5">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
        <Icono size={20} style={{ color }} />
      </div>
      <div>
        <p className="font-display text-2xl leading-none font-bold" style={{ color }}>{valor}</p>
        <p className="mt-1 font-display text-xs font-medium text-white">{etiqueta}</p>
        <p className="mt-0.5 text-[11px] text-gray-500">{detalle}</p>
      </div>
    </div>
  );
}

function coincideEstudiante(estudiante, termino) {
  return !termino || nombreCompleto(estudiante).toLowerCase().includes(termino)
    || estudiante?.codigo_nie.includes(termino);
}

export default function Pagos() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [pestana, setPestana] = useState('cuentas');
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [pagina, setPagina] = useState(1);
  const [idEstudianteDrawer, setIdEstudianteDrawer] = useState(null);
  const [cuentaAPagar, setCuentaAPagar] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setDatos(await cargarFinanzas());
      setError('');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo cargar la información financiera.'));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Permite abrir una pestaña concreta desde otra página (p. ej. el dashboard de secretaría).
  const ubicacion = useLocation();
  const navegar = useNavigate();
  useEffect(() => {
    const pedida = ubicacion.state?.pestana;
    if (pedida && PESTANAS.some((p) => p.id === pedida)) {
      setPestana(pedida);
      navegar(ubicacion.pathname, { replace: true, state: null });
    }
  }, [ubicacion.state, ubicacion.pathname, navegar]);

  const termino = filtros.buscar.trim().toLowerCase();

  const cuentasFiltradas = useMemo(() => (datos?.cuentas || [])
    .filter((c) => coincideEstudiante(c.estudiante, termino))
    .filter((c) => !filtros.concepto || c.concepto === filtros.concepto)
    .filter((c) => !filtros.estado || c.estadoVisible === filtros.estado)
    .filter((c) => !filtros.grado || String(c.estudiante?.idGrado) === filtros.grado)
    .sort((a, b) => String(b.fecha_vencimiento).localeCompare(String(a.fecha_vencimiento))), [datos, filtros, termino]);

  const pendientes = useMemo(() => cuentasFiltradas
    .filter((c) => c.estado !== 'pagado')
    .sort((a, b) => PRIORIDAD[a.estadoVisible] - PRIORIDAD[b.estadoVisible]
      || String(a.fecha_vencimiento).localeCompare(String(b.fecha_vencimiento))), [cuentasFiltradas]);

  const estadosCuenta = useMemo(() => (datos?.estudiantes || [])
    .filter((e) => coincideEstudiante(e, termino))
    .filter((e) => !filtros.grado || String(e.idGrado) === filtros.grado)
    .map((e) => {
      const propias = datos.cuentas.filter((c) => c.id_estudiante === e.id);
      return {
        ...e,
        total: propias.reduce((s, c) => s + c.total, 0),
        pagado: propias.reduce((s, c) => s + c.abonado, 0),
        pendiente: propias.filter((c) => c.estado === 'pendiente').reduce((s, c) => s + c.saldo, 0),
        vencido: propias.filter((c) => c.estado === 'vencido').reduce((s, c) => s + c.saldo, 0),
        cuentas: propias.length,
      };
    })
    .filter((e) => e.cuentas > 0)
    .sort((a, b) => b.vencido - a.vencido || b.pendiente - a.pendiente), [datos, filtros.grado, termino]);

  const pagosRecibidos = useMemo(
    () => (datos?.pagos || [])
      .filter((p) => coincideEstudiante(p.estudiante, termino))
      .filter((p) => !filtros.grado || String(p.estudiante?.idGrado) === filtros.grado)
      .sort((a, b) => String(b.fecha_pago).localeCompare(String(a.fecha_pago)) || b.id - a.id),
    [datos, filtros.grado, termino],
  );

  if (error && !datos) return <Alerta>{error}</Alerta>;
  if (!datos) return <Cargando texto="Cargando información financiera..." />;

  const mesActual = new Date().toISOString().slice(0, 7);
  const totalRecaudado = datos.pagos.reduce((s, p) => s + Number(p.monto_pago), 0);
  const porCobrar = datos.cuentas.filter((c) => c.estado === 'pendiente');
  const vencidas = datos.cuentas.filter((c) => c.estado === 'vencido');
  const pagosMes = datos.pagos.filter((p) => String(p.fecha_pago).startsWith(mesActual));
  const conceptos = [...new Set(datos.cuentas.map((c) => c.concepto))].sort();
  const grados = [...new Map(datos.estudiantes.filter((e) => e.idGrado).map((e) => [e.idGrado, e.grado])).entries()]
    .sort((a, b) => a[0] - b[0]);
  const hayFiltros = Object.values(filtros).some(Boolean);

  const listas = {
    cuentas: cuentasFiltradas, estados: estadosCuenta, pendientes, recibidos: pagosRecibidos,
  };
  const { pagina: paginaActual, totalPaginas, filas } = paginar(listas[pestana] || [], pagina, FILAS);
  const enAranceles = PESTANAS_ARANCELES.includes(pestana);

  function cambiarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }));
    setPagina(1);
  }

  async function alRegistrarPago(mensaje) {
    setCuentaAPagar(null);
    setAviso(mensaje);
    await cargar();
  }

  const estudianteDrawer = datos.estudiantes.find((e) => e.id === idEstudianteDrawer);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icono={Wallet} etiqueta="Total recaudado" valor={dinero(totalRecaudado)} detalle={`${datos.pagos.length} pagos`} color="#c2416b" />
        <Kpi
          icono={Clock}
          etiqueta="Pendiente por cobrar"
          valor={dinero(porCobrar.reduce((s, c) => s + c.saldo, 0))}
          detalle={`${porCobrar.length} cuentas`}
          color="#F59E0B"
        />
        <Kpi
          icono={AlertTriangle}
          etiqueta="Monto vencido"
          valor={dinero(vencidas.reduce((s, c) => s + c.saldo, 0))}
          detalle={`${vencidas.length} cuentas vencidas`}
          color="#EF4444"
        />
        <Kpi
          icono={TrendingUp}
          etiqueta="Pagos este mes"
          valor={pagosMes.length}
          detalle={dinero(pagosMes.reduce((s, p) => s + Number(p.monto_pago), 0))}
          color="#10B981"
        />
      </div>

      <Alerta tipo="exito">{aviso}</Alerta>
      <Alerta>{error}</Alerta>

      <div className="flex w-fit flex-wrap items-center gap-1 rounded-xl border border-line bg-base p-1" role="tablist">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            onClick={() => { setPestana(p.id); setPagina(1); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold transition-all
              ${pestana === p.id ? 'bg-brand text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <p.icono size={13} />{p.etiqueta}
            {p.id === 'pendientes' && pendientes.length > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                  ${pestana === p.id ? 'bg-white/25 text-white' : 'bg-[#EF444420] text-[#EF4444]'}`}
              >
                {pendientes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {pestana === 'pendientes' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Kpi
            icono={Clock}
            etiqueta="Monto total pendiente"
            valor={dinero(pendientes.reduce((s, c) => s + c.saldo, 0))}
            detalle="Incluye vencidos y parciales"
            color="#F59E0B"
          />
          <Kpi
            icono={AlertTriangle}
            etiqueta="Monto vencido"
            valor={dinero(pendientes.filter((c) => c.estado === 'vencido').reduce((s, c) => s + c.saldo, 0))}
            detalle={`${pendientes.filter((c) => c.estado === 'vencido').length} cuentas`}
            color="#EF4444"
          />
          <Kpi
            icono={Users}
            etiqueta="Estudiantes con saldo"
            valor={new Set(pendientes.map((c) => c.id_estudiante)).size}
            detalle="Con al menos una cuenta pendiente"
            color="#c2416b"
          />
        </div>
      )}

      {enAranceles && <ArancelesDescuentos key={pestana} vista={pestana} onCambio={cargar} />}

      {!enAranceles && (
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Buscador
            id="buscar-pago"
            etiqueta="Buscar estudiante"
            placeholder="Buscar estudiante o NIE..."
            valor={filtros.buscar}
            onChange={(v) => cambiarFiltro('buscar', v)}
          />
          {(pestana === 'cuentas') && (
            <SelectFiltro
              id="filtro-concepto"
              etiqueta="Concepto"
              icono={Calendar}
              valor={filtros.concepto}
              onChange={(v) => cambiarFiltro('concepto', v)}
            >
              {conceptos.map((c) => <option key={c} value={c}>{c}</option>)}
            </SelectFiltro>
          )}
          {(pestana === 'cuentas' || pestana === 'pendientes') && (
            <SelectFiltro
              id="filtro-estado-cuenta"
              etiqueta="Estado"
              icono={Filter}
              valor={filtros.estado}
              onChange={(v) => cambiarFiltro('estado', v)}
            >
              {Object.entries(ESTADOS_CUENTA)
                .filter(([clave]) => pestana === 'cuentas' || clave !== 'pagado')
                .map(([clave, { etiqueta }]) => <option key={clave} value={clave}>{etiqueta}</option>)}
            </SelectFiltro>
          )}
          <SelectFiltro
            id="filtro-grado-pago"
            etiqueta="Grado"
            icono={GraduationCap}
            valor={filtros.grado}
            onChange={(v) => cambiarFiltro('grado', v)}
          >
            {grados.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
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
          <span className="ml-auto text-xs text-gray-500">{`${listas[pestana].length} registros`}</span>
        </div>
      </div>
      )}

      {!enAranceles && (
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          {pestana === 'cuentas' && (
            <TablaCuentas cuentas={filas} onVer={setIdEstudianteDrawer} onPagar={setCuentaAPagar} />
          )}
          {pestana === 'estados' && <TablaEstados estados={filas} onVer={setIdEstudianteDrawer} />}
          {pestana === 'pendientes' && (
            <TablaCuentas cuentas={filas} onVer={setIdEstudianteDrawer} onPagar={setCuentaAPagar} vacio="Sin pagos pendientes" />
          )}
          {pestana === 'recibidos' && <TablaPagosRecibidos pagos={filas} onVer={setIdEstudianteDrawer} />}
        </div>
        <Paginacion
          pagina={paginaActual}
          totalPaginas={totalPaginas}
          total={listas[pestana].length}
          porPagina={FILAS}
          onCambiar={setPagina}
          unidad="registros"
        />
      </div>
      )}

      {estudianteDrawer && (
        <EstadoCuentaDrawer
          estudiante={estudianteDrawer}
          cuentas={datos.cuentas.filter((c) => c.id_estudiante === estudianteDrawer.id)}
          pagos={datos.pagos.filter((p) => p.cuenta?.id_estudiante === estudianteDrawer.id)}
          onClose={() => setIdEstudianteDrawer(null)}
          onRegistrarPago={setCuentaAPagar}
        />
      )}
      {cuentaAPagar && (
        <RegistrarPagoModal
          cuenta={cuentaAPagar}
          onClose={() => setCuentaAPagar(null)}
          onRegistrado={alRegistrarPago}
        />
      )}
    </div>
  );
}
