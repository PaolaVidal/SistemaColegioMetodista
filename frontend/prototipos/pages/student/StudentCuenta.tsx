import { DollarSign, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type EstadoPago = "Pagado" | "Pendiente" | "Vencido" | "Parcial";

interface Pago {
  id: string;
  concepto: string;
  fecha: string;
  vencimiento: string;
  monto: number;
  montoPagado?: number;
  estado: EstadoPago;
}

const ESTADO_STYLE: Record<EstadoPago,{color:string;bg:string;icon:React.ComponentType<{size?:number}>}> = {
  "Pagado":   {color:"#10B981",bg:"#10B98120",icon:CheckCircle},
  "Pendiente":{color:"#F59E0B",bg:"#F59E0B20",icon:Clock      },
  "Vencido":  {color:"#EF4444",bg:"#EF444420",icon:XCircle    },
  "Parcial":  {color:"#00ADEB",bg:"#00ADEB20",icon:AlertCircle},
};

const PAGOS: Pago[] = [
  {id:"PAG-001",concepto:"Matrícula 2026",         fecha:"2026-03-01",vencimiento:"2026-03-01",monto:250,                estado:"Pagado"},
  {id:"PAG-002",concepto:"Mensualidad Abril 2026",  fecha:"2026-04-01",vencimiento:"2026-04-05",monto:320,                estado:"Pagado"},
  {id:"PAG-003",concepto:"Mensualidad Mayo 2026",   fecha:"2026-05-01",vencimiento:"2026-05-05",monto:320,                estado:"Pagado"},
  {id:"PAG-004",concepto:"Materiales educativos",   fecha:"2026-05-10",vencimiento:"2026-05-20",monto:85,                 estado:"Pagado"},
  {id:"PAG-005",concepto:"Mensualidad Junio 2026",  fecha:"2026-06-01",vencimiento:"2026-06-05",monto:320,                estado:"Pagado"},
  {id:"PAG-006",concepto:"Actividad deportiva",     fecha:"2026-06-20",vencimiento:"2026-06-28",monto:45,                 estado:"Pagado"},
  {id:"PAG-007",concepto:"Mensualidad Julio 2026",  fecha:"2026-07-01",vencimiento:"2026-07-05",monto:320,                estado:"Pagado"},
  {id:"PAG-008",concepto:"Mensualidad Agosto 2026", fecha:"2026-08-01",vencimiento:"2026-08-05",monto:320,                estado:"Pagado"},
  {id:"PAG-009",concepto:"Seguro estudiantil",      fecha:"2026-08-15",vencimiento:"2026-08-30",monto:60,                 estado:"Pagado"},
  {id:"PAG-010",concepto:"Mensualidad Sep. 2026",   fecha:"2026-09-01",vencimiento:"2026-09-05",monto:320,montoPagado:160,estado:"Parcial"},
  {id:"PAG-011",concepto:"Excursión académica",     fecha:"2026-09-05",vencimiento:"2026-09-20",monto:75,                 estado:"Pendiente"},
];

function fmt(n:number){return `S/ ${n.toFixed(2)}`;}
function fmtDate(iso:string){
  const [y,m,d]=iso.split("-");
  const mos=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${mos[Number(m)-1]} ${y}`;
}

const totalFacturado = PAGOS.reduce((s,p)=>s+p.monto,0);
const totalPagado    = PAGOS.reduce((s,p)=>s+(p.montoPagado??( p.estado==="Pagado"?p.monto:0)),0);
const totalPendiente = totalFacturado - totalPagado;

const PIE_DATA = [
  {name:"Pagado",   value:totalPagado,    fill:"#10B981"},
  {name:"Pendiente",value:totalPendiente, fill:"#F59E0B"},
];

const CustomTip = ({active,payload}:{active?:boolean;payload?:{name:string;value:number;payload:{fill:string}}[]}) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 border text-xs" style={{background:"#111616",borderColor:"#1e2c2c"}}>
      <p style={{color:payload[0].payload.fill}} className="font-bold">{payload[0].name}: {fmt(payload[0].value)}</p>
    </div>
  );
};

export default function StudentCuenta() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Estado de Cuenta</h2>
        <p className="text-xs text-gray-500 mt-0.5">Valeria Torres · 3° Grado C · Año 2026</p>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Donut */}
        <div className="rounded-2xl border p-5" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3">Resumen de pagos</p>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={PIE_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={44} strokeWidth={0}>
                  {PIE_DATA.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                </Pie>
                <Tooltip content={<CustomTip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {PIE_DATA.map(p=>(
                <div key={p.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:p.fill}}/>
                  <div>
                    <p className="text-[10px] text-gray-600">{p.name}</p>
                    <p className="text-sm font-bold text-white" style={{fontFamily:"var(--font-display)"}}>{fmt(p.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="col-span-2 grid grid-cols-3 gap-4">
          {[
            {label:"Total facturado", value:fmt(totalFacturado), sub:`${PAGOS.length} conceptos`,      color:"#9CA3AF",bg:"#37415118",icon:DollarSign},
            {label:"Total pagado",    value:fmt(totalPagado),    sub:"Al día",                          color:"#10B981", bg:"#10B98118",icon:CheckCircle},
            {label:"Saldo pendiente", value:fmt(totalPendiente), sub:totalPendiente>0?"Por regularizar":"Sin deuda",color:totalPendiente>0?"#F59E0B":"#10B981",bg:totalPendiente>0?"#F59E0B18":"#10B98118",icon:totalPendiente>0?Clock:CheckCircle},
          ].map(({label,value,sub,color,bg,icon:Icon})=>(
            <div key={label} className="rounded-2xl border p-5" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:bg}}>
                <Icon size={16} style={{color}}/>
              </div>
              <p className="text-xl font-bold text-white" style={{fontFamily:"var(--font-display)"}}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="rounded-xl border px-4 py-3 flex items-center gap-3" style={{background:"#10B98110",borderColor:"#10B98130"}}>
        <AlertCircle size={14} style={{color:"#10B981"}}/>
        <p className="text-xs text-gray-400">Los pagos en línea no están disponibles en este portal. Para realizar un pago, acércate a la oficina administrativa.</p>
      </div>

      {/* Historial */}
      <div className="rounded-2xl border overflow-hidden" style={{background:"#1a1f1f",borderColor:"#1e2c2c"}}>
        <div className="px-5 py-3 border-b" style={{borderColor:"#1e2c2c",background:"#1e2525"}}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Historial de pagos · 2026</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{background:"#161b1b"}}>
              {["Concepto","Fecha","Vencimiento","Monto","Pagado","Estado"].map(h=>(
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{borderColor:"#1e2c2c"}}>
            {[...PAGOS].reverse().map((p,i)=>{
              const s=ESTADO_STYLE[p.estado]; const Icon=s.icon;
              const efectivo=p.montoPagado??(p.estado==="Pagado"?p.monto:0);
              return (
                <tr key={p.id} style={{background:i%2===0?"#1a1f1f":"#161b1b"}}>
                  <td className="px-5 py-3 font-medium text-gray-200">{p.concepto}</td>
                  <td className="px-5 py-3 text-gray-500">{fmtDate(p.fecha)}</td>
                  <td className="px-5 py-3 text-gray-500">{fmtDate(p.vencimiento)}</td>
                  <td className="px-5 py-3 font-mono text-gray-300">{fmt(p.monto)}</td>
                  <td className="px-5 py-3 font-mono" style={{color:efectivo>=p.monto?"#10B981":efectivo>0?"#00ADEB":"#9CA3AF"}}>{fmt(efectivo)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{background:s.bg,color:s.color}}>
                      <Icon size={10}/>{p.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
