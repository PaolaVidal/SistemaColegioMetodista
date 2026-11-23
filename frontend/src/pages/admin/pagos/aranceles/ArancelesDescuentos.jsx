import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  BadgePercent, Calendar, Lock, Pencil, Plus, Tag, Trash2,
} from 'lucide-react';
import Alerta from '../../../../components/ui/Alerta';
import Buscador from '../../../../components/ui/Buscador';
import Cargando from '../../../../components/ui/Cargando';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import SelectFiltro from '../../../../components/ui/SelectFiltro';
import {
  TIPOS_COBRO, cargarAranceles, eliminarArancel, eliminarDescuento,
} from '../../../../services/aranceles';
import { mensajeError } from '../../../../services/api';
import { dinero, nombreCiclo, nombreCompleto } from '../../../../utils/formato';
import ArancelModal from './ArancelModal';
import DescuentoModal from './DescuentoModal';

function Encabezado({ columnas }) {
  return (
    <thead>
      <tr className="border-b border-line bg-base">
        {columnas.map((h) => <th key={h} className="px-4 py-3 text-left font-display font-semibold whitespace-nowrap text-gray-400">{h}</th>)}
      </tr>
    </thead>
  );
}

function BotonAccion({
  titulo, onClick, peligro = false, deshabilitado = false, children,
}) {
  return (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      onClick={onClick}
      disabled={deshabilitado}
      className={`rounded-lg p-1.5 text-gray-400 transition-all disabled:cursor-not-allowed disabled:opacity-30
        ${peligro ? 'hover:bg-[#EF4444]/10 hover:text-[#EF4444]' : 'hover:bg-[#F59E0B]/10 hover:text-[#F59E0B]'}`}
    >
      {children}
    </button>
  );
}

function mensajeEliminacion({ tipo, registro, pagos }) {
  if (tipo === 'descuento') {
    return `¿Eliminar el descuento de ${nombreCompleto(registro.estudiante)}? Sus cuotas pendientes volverán al monto normal.`;
  }
  if (pagos) {
    return `El arancel «${registro.nombre_concepto}» tiene ${pagos} pago(s) registrado(s). Si continúa se eliminarán `
      + 'esos pagos, sus cuentas por cobrar y sus descuentos. Esta acción no se puede deshacer.';
  }
  const extras = [registro.cuentas && `${registro.cuentas} cuenta(s) por cobrar`, registro.descuentos && `${registro.descuentos} descuento(s)`]
    .filter(Boolean);
  return `¿Eliminar el arancel «${registro.nombre_concepto}»?${extras.length ? ` También se eliminarán ${extras.join(' y ')}.` : ''}`;
}

// Pestañas "Aranceles" y "Descuentos y becas" de la página de pagos.
export default function ArancelesDescuentos({ vista, onCambio }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [idCiclo, setIdCiclo] = useState('');
  const [buscar, setBuscar] = useState('');
  const [modal, setModal] = useState(null); // { tipo: 'arancel' | 'descuento', registro }
  const [eliminando, setEliminando] = useState(null); // { tipo, registro, pagos? }
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const resultado = await cargarAranceles();
      setDatos(resultado);
      setIdCiclo((actual) => actual || String(resultado.cicloActivo?.id || ''));
      setError('');
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los aranceles.'));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const termino = buscar.trim().toLowerCase();
  const aranceles = useMemo(() => (datos?.aranceles || [])
    .filter((a) => !idCiclo || String(a.id_ciclo) === idCiclo)
    .filter((a) => !termino || a.nombre_concepto.toLowerCase().includes(termino)), [datos, idCiclo, termino]);
  const descuentos = useMemo(() => (datos?.descuentos || [])
    .filter((d) => !idCiclo || String(d.arancel?.id_ciclo) === idCiclo)
    .filter((d) => !termino || nombreCompleto(d.estudiante).toLowerCase().includes(termino)
      || d.estudiante?.codigo_nie.includes(termino) || String(d.motivo).toLowerCase().includes(termino))
    .sort((a, b) => (a.estudiante?.apellidos || '').localeCompare(b.estudiante?.apellidos || '')), [datos, idCiclo, termino]);

  if (error && !datos) return <Alerta>{error}</Alerta>;
  if (!datos) return <Cargando texto="Cargando aranceles..." />;

  async function alGuardar(mensaje) {
    setModal(null);
    setAviso(mensaje);
    await cargar();
    onCambio?.();
  }

  async function confirmarEliminacion() {
    setProcesando(true);
    try {
      if (eliminando.tipo === 'arancel') await eliminarArancel(eliminando.registro.id, Boolean(eliminando.pagos));
      else await eliminarDescuento(eliminando.registro.id);
      setEliminando(null);
      await alGuardar(eliminando.tipo === 'arancel' ? 'Arancel eliminado.' : 'Descuento eliminado; las cuotas pendientes volvieron al monto normal.');
    } catch (e) {
      // El arancel tiene pagos: se pide una segunda confirmación indicando cuántos se eliminarán.
      if (e?.response?.status === 409 && e.response.data?.pagos) {
        setEliminando((actual) => ({ ...actual, pagos: e.response.data.pagos }));
        return;
      }
      setError(mensajeError(e, 'No se pudo eliminar.'));
      setEliminando(null);
    } finally {
      setProcesando(false);
    }
  }

  const esAranceles = vista === 'aranceles';

  return (
    <div className="space-y-4">
      <Alerta tipo="exito">{aviso}</Alerta>
      <Alerta>{error}</Alerta>

      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Buscador
            id="buscar-aranceles"
            etiqueta={esAranceles ? 'Buscar arancel' : 'Buscar descuento'}
            placeholder={esAranceles ? 'Buscar concepto...' : 'Buscar estudiante, NIE o motivo...'}
            valor={buscar}
            onChange={setBuscar}
          />
          <SelectFiltro id="filtro-ciclo-aranceles" etiqueta="Ciclo" icono={Calendar} valor={idCiclo} onChange={setIdCiclo}>
            {datos.ciclos.map((c) => <option key={c.id} value={c.id}>{nombreCiclo(c)}</option>)}
          </SelectFiltro>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500">{`${esAranceles ? aranceles.length : descuentos.length} registros`}</span>
            <button
              type="button"
              onClick={() => { setAviso(''); setModal({ tipo: esAranceles ? 'arancel' : 'descuento', registro: null }); }}
              className="bg-brand-gradient flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-semibold text-white hover:opacity-90"
            >
              <Plus size={14} />{esAranceles ? 'Nuevo arancel' : 'Nuevo descuento o beca'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            {esAranceles ? (
              <>
                <Encabezado columnas={['Concepto', 'Tipo', 'Monto', 'Vence', 'Mora', 'Ciclo', 'Cuentas', 'Descuentos', 'Acciones']} />
                <tbody>
                  {aranceles.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-14 text-center text-sm text-gray-500"><Tag size={32} className="mx-auto mb-3 text-gray-700" />Sin aranceles</td></tr>
                  )}
                  {aranceles.map((a) => (
                    <tr key={a.id} className="group border-b border-line hover:bg-line/50">
                      <td className="px-4 py-3 font-display font-semibold text-white">
                        {a.nombre_concepto}
                        {a.protegido && <span className="ml-2 rounded bg-line px-1.5 py-0.5 text-[9px] font-normal text-gray-400">Base</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${a.tipo_cobro === 'mensual' ? 'bg-[#8B5CF620] text-[#A78BFA]' : 'bg-line text-gray-300'}`}>
                          {TIPOS_COBRO[a.tipo_cobro] || a.tipo_cobro}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{dinero(a.monto_estandar)}</td>
                      <td className="px-4 py-3 text-gray-300">{`Día ${a.dia_vencimiento_mes}${a.tipo_cobro === 'mensual' ? ' de cada mes' : ''}`}</td>
                      <td className="px-4 py-3 text-[#F59E0B]">{Number(a.recargo_mora) > 0 ? dinero(a.recargo_mora) : '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{nombreCiclo(a.ciclo)}</td>
                      <td className="px-4 py-3 text-gray-300">{a.cuentas}</td>
                      <td className="px-4 py-3 text-gray-300">{a.descuentos}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5 opacity-70 group-hover:opacity-100">
                          <BotonAccion titulo={`Editar ${a.nombre_concepto}`} onClick={() => { setAviso(''); setModal({ tipo: 'arancel', registro: a }); }}>
                            <Pencil size={14} />
                          </BotonAccion>
                          {a.protegido ? (
                            <span title="Arancel base del sistema: no se puede eliminar" className="p-1.5 text-gray-600">
                              <Lock size={14} />
                            </span>
                          ) : (
                            <BotonAccion titulo={`Eliminar ${a.nombre_concepto}`} peligro onClick={() => setEliminando({ tipo: 'arancel', registro: a })}>
                              <Trash2 size={14} />
                            </BotonAccion>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <Encabezado columnas={['Estudiante', 'Arancel', 'Monto normal', 'Descuento', 'Pagará', 'Motivo', 'Acciones']} />
                <tbody>
                  {descuentos.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-14 text-center text-sm text-gray-500">
                        <BadgePercent size={32} className="mx-auto mb-3 text-gray-700" />Sin descuentos en este ciclo
                      </td>
                    </tr>
                  )}
                  {descuentos.map((d) => (
                    <tr key={d.id} className="group border-b border-line hover:bg-line/50">
                      <td className="px-4 py-3">
                        <p className="font-display font-semibold text-white">{nombreCompleto(d.estudiante)}</p>
                        <p className="font-mono text-[10px] text-gray-500">{d.estudiante?.codigo_nie}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{d.arancel?.nombre_concepto}</td>
                      <td className="px-4 py-3 text-gray-500 line-through">{dinero(d.arancel?.monto_estandar)}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-[#10B98120] px-2 py-0.5 text-[10px] font-semibold text-[#10B981]">{`${Number(d.porcentaje_descuento)}%`}</span></td>
                      <td className="px-4 py-3 font-semibold text-white">{dinero(d.monto_fijo_ajustado)}</td>
                      <td className="max-w-56 px-4 py-3 text-gray-400">{d.motivo}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5 opacity-70 group-hover:opacity-100">
                          <BotonAccion titulo="Editar descuento" onClick={() => { setAviso(''); setModal({ tipo: 'descuento', registro: d }); }}>
                            <Pencil size={14} />
                          </BotonAccion>
                          <BotonAccion titulo="Eliminar descuento" peligro onClick={() => setEliminando({ tipo: 'descuento', registro: d })}>
                            <Trash2 size={14} />
                          </BotonAccion>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>

      {modal?.tipo === 'arancel' && (
        <ArancelModal
          arancel={modal.registro}
          ciclos={datos.ciclos}
          cicloActivo={datos.cicloActivo}
          onClose={() => setModal(null)}
          onGuardado={alGuardar}
        />
      )}
      {modal?.tipo === 'descuento' && (
        <DescuentoModal registro={modal.registro} datos={datos} onClose={() => setModal(null)} onGuardado={alGuardar} />
      )}
      {eliminando && (
        <ConfirmDialog
          titulo={eliminando.tipo === 'arancel' ? 'Eliminar arancel' : 'Eliminar descuento'}
          mensaje={mensajeEliminacion(eliminando)}
          textoConfirmar={eliminando.pagos ? `Eliminar también ${eliminando.pagos} pago(s)` : 'Eliminar'}
          procesando={procesando}
          onConfirm={confirmarEliminacion}
          onCancel={() => setEliminando(null)}
        />
      )}
    </div>
  );
}
