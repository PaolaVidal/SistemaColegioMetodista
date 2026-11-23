import {
  Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Download, GraduationCap, Printer, RefreshCw,
} from 'lucide-react';
import BoletaEstudiante from './BoletaEstudiante';

const COLORES = ['#c2416b', '#10B981', '#8B5CF6', '#F59E0B', '#60A5FA', '#EC4899', '#F87171', '#34D399'];
const EJE = { fill: '#8b7a80', fontSize: 10 };

function TooltipReporte({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-base px-3 py-2 text-xs text-white">
      <p className="font-semibold">{payload[0].payload.nombre}</p>
      <p className="text-brand-soft">{payload[0].value}</p>
    </div>
  );
}

function Grafico({ grafico, color }) {
  if (grafico.tipo === 'pastel') {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={grafico.datos} dataKey="valor" nameKey="nombre" innerRadius={50} outerRadius={80} strokeWidth={0}>
            {grafico.datos.map((d, i) => <Cell key={d.nombre} fill={d.color || COLORES[i % COLORES.length]} />)}
          </Pie>
          <Tooltip content={<TooltipReporte />} />
          <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10, color: '#9CA3AF' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={grafico.datos} barSize={20}>
        <XAxis dataKey="nombre" tick={EJE} axisLine={false} tickLine={false} tickFormatter={(v) => String(v).slice(0, 10)} />
        <YAxis domain={[0, grafico.maximo || 'auto']} tick={EJE} axisLine={false} tickLine={false} width={32} />
        <Tooltip content={<TooltipReporte />} cursor={{ fill: '#3d262d80' }} />
        <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Vista previa imprimible del reporte generado.
export default function VistaReporte({
  definicion, resultado, filtrosTexto, generado, onNuevo, onCsv,
}) {
  const Icono = definicion.icono;
  return (
    <div className="flex h-full flex-col">
      <div className="no-imprimir flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${definicion.color}18` }}>
            <Icono size={15} style={{ color: definicion.color }} />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">{`Reporte de ${definicion.etiqueta}`}</p>
            <p className="text-[11px] text-gray-500">{`Generado: ${generado}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNuevo}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-gray-400 hover:text-white"
          >
            <RefreshCw size={12} />Cambiar filtros
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-gray-400 hover:text-white"
          >
            <Printer size={12} />Imprimir / PDF
          </button>
          <button
            type="button"
            onClick={onCsv}
            className="bg-brand-gradient flex items-center gap-1.5 rounded-lg px-4 py-2 font-display text-xs font-semibold text-white hover:opacity-90"
          >
            <Download size={12} />Descargar CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        {resultado.boletas && (
          <div className="zona-impresion space-y-6">
            {resultado.boletas.length === 0 && (
              <p className="rounded-2xl border border-line bg-base px-8 py-14 text-center text-sm text-gray-500">
                El estudiante aún no tiene calificaciones registradas para los filtros elegidos.
              </p>
            )}
            {resultado.boletas.map((b) => <BoletaEstudiante key={b.estudiante?.id} boleta={b} generado={generado} />)}
          </div>
        )}
        {!resultado.boletas && (
        <div className="zona-impresion overflow-hidden rounded-2xl border border-line bg-base">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-xl">
                <GraduationCap size={18} className="text-white" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-white">Colegio Metodista — Sistema Escolar</p>
                <p className="text-[10px] text-gray-500">{`Generado el ${generado} · Uso interno`}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-base font-bold" style={{ color: definicion.color }}>{`Reporte de ${definicion.etiqueta}`}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{filtrosTexto || 'Sin filtros: todos los registros'}</p>
            </div>
          </div>

          <div className="space-y-6 px-8 py-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {resultado.kpis.map((k) => (
                <div key={k.etiqueta} className="rounded-xl border border-line bg-card p-4">
                  <p className="font-display text-xl font-bold" style={{ color: definicion.color }}>{k.valor}</p>
                  <p className="mt-0.5 text-xs font-medium text-white">{k.etiqueta}</p>
                  <p className="text-[10px] text-gray-500">{k.detalle}</p>
                </div>
              ))}
            </div>

            <div className={`grid gap-6 ${resultado.grafico?.datos.length ? 'xl:grid-cols-5' : ''}`}>
              {resultado.grafico?.datos.length > 0 && (
                <div className="rounded-xl border border-line bg-card p-5 xl:col-span-2">
                  <p className="mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">{resultado.grafico.titulo}</p>
                  <Grafico grafico={resultado.grafico} color={definicion.color} />
                </div>
              )}
              <div className={`overflow-hidden rounded-xl border border-line ${resultado.grafico?.datos.length ? 'xl:col-span-3' : ''}`}>
                <div className="max-h-[480px] overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0">
                      <tr className="bg-line">
                        {resultado.columnas.map((c) => (
                          <th key={c} className="px-4 py-3 text-left text-[10px] font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.filas.length === 0 && (
                        <tr><td colSpan={resultado.columnas.length} className="px-4 py-10 text-center text-gray-500">Sin datos para los filtros elegidos</td></tr>
                      )}
                      {resultado.filas.map((fila, i) => (
                        // Las filas no tienen identificador propio; el índice es estable en la vista previa.
                        // eslint-disable-next-line react/no-array-index-key
                        <tr key={i} className={i % 2 === 0 ? 'bg-base' : 'bg-panel'}>
                          {fila.map((celda, j) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <td key={j} className="px-4 py-2.5 whitespace-nowrap text-gray-300">{celda ?? '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-line pt-4 text-[10px] text-gray-600">
              <span>{`Colegio Metodista · Sistema de Gestión Escolar · ${generado}`}</span>
              <span>{`${resultado.filas.length} registros`}</span>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
