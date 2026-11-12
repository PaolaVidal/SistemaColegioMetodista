import { useState, useMemo } from "react";
import {
  Plus, Search, X, Edit3, Trash2, CheckCircle, XCircle,
  ChevronRight, Mail, Phone, BookOpen, GraduationCap,
  Calendar, Clock, User, RotateCcw, Save, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Estado = "activo" | "inactivo";

interface Asignatura {
  nombre: string;
  grado: string;
  seccion: string;
  horasSem: number;
}

interface Docente {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  especialidad: string;
  titulo: string;
  fechaIngreso: string;
  estado: Estado;
  asignaturas: Asignatura[];
  color: string;
}

type RightMode = "view" | "edit" | "create";

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#00ADEB","#10B981","#8B5CF6","#F59E0B","#EC4899","#107A9F","#EF4444","#6366F1","#14B8A6",
];

const ASIGNATURAS_LISTA = [
  "Matemática","Comunicación","Ciencias Naturales","Historia y Geografía",
  "Arte y Cultura","Educación Física","Inglés","Música","Tecnología e Informática",
  "Educación Religiosa","Personal Social","Educación Cívica",
];

const GRADOS = ["1° Grado","2° Grado","3° Grado","4° Grado","5° Grado","6° Grado"];
const SECCIONES = ["A","B","C"];
const TITULOS = ["Lic. en Educación","Mg. en Educación","Dr. en Educación","Bach. en Educación","Prof. de Educación Primaria","Prof. de Educación Secundaria"];

// ─── Seed ─────────────────────────────────────────────────────────────────────

let _did = 1;
function doc(
  nombres:string, apellidos:string, dni:string, email:string, telefono:string,
  especialidad:string, titulo:string, fechaIngreso:string, estado:Estado,
  asignaturas:Asignatura[], colorIdx:number
): Docente {
  return { id:`DOC-${String(_did++).padStart(3,"0")}`, nombres, apellidos, dni, email, telefono, especialidad, titulo, fechaIngreso, estado, asignaturas, color:AVATAR_COLORS[colorIdx] };
}

const SEED: Docente[] = [
  doc("Ana","Delgado Ríos","47823156","a.delgado@edu.pe","945-112-233","Matemática y Ciencias","Lic. en Educación","2019-03-01","activo",[
    {nombre:"Matemática",     grado:"3° Grado",seccion:"A",horasSem:4},
    {nombre:"Matemática",     grado:"3° Grado",seccion:"B",horasSem:4},
    {nombre:"Ciencias Naturales",grado:"4° Grado",seccion:"A",horasSem:3},
    {nombre:"Ciencias Naturales",grado:"4° Grado",seccion:"B",horasSem:3},
  ],0),
  doc("Pedro","Luna Vega","52341890","p.luna@edu.pe","987-654-321","Educación Física","Prof. de Educación Primaria","2017-03-05","activo",[
    {nombre:"Educación Física",grado:"1° Grado",seccion:"A",horasSem:2},
    {nombre:"Educación Física",grado:"1° Grado",seccion:"B",horasSem:2},
    {nombre:"Educación Física",grado:"2° Grado",seccion:"A",horasSem:2},
    {nombre:"Educación Física",grado:"3° Grado",seccion:"A",horasSem:2},
    {nombre:"Educación Física",grado:"4° Grado",seccion:"A",horasSem:2},
    {nombre:"Educación Física",grado:"5° Grado",seccion:"A",horasSem:2},
  ],1),
  doc("Rosa","Mamani Quispe","63214578","r.mamani@edu.pe","912-345-678","Comunicación y Arte","Mg. en Educación","2020-03-02","activo",[
    {nombre:"Comunicación",   grado:"1° Grado",seccion:"A",horasSem:5},
    {nombre:"Comunicación",   grado:"2° Grado",seccion:"A",horasSem:5},
    {nombre:"Arte y Cultura", grado:"1° Grado",seccion:"A",horasSem:2},
    {nombre:"Arte y Cultura", grado:"2° Grado",seccion:"A",horasSem:2},
  ],2),
  doc("Luis","Vera Paredes","71234560","l.vera@edu.pe","923-456-789","Historia y Geografía","Lic. en Educación","2018-03-07","activo",[
    {nombre:"Historia y Geografía",grado:"4° Grado",seccion:"A",horasSem:3},
    {nombre:"Historia y Geografía",grado:"4° Grado",seccion:"B",horasSem:3},
    {nombre:"Historia y Geografía",grado:"5° Grado",seccion:"A",horasSem:3},
    {nombre:"Historia y Geografía",grado:"6° Grado",seccion:"A",horasSem:3},
  ],3),
  doc("Carmen","López Torres","58934210","c.lopez@edu.pe","934-567-890","Matemática","Mg. en Educación","2021-03-01","activo",[
    {nombre:"Matemática",grado:"5° Grado",seccion:"A",horasSem:4},
    {nombre:"Matemática",grado:"5° Grado",seccion:"B",horasSem:4},
    {nombre:"Matemática",grado:"6° Grado",seccion:"A",horasSem:4},
    {nombre:"Matemática",grado:"6° Grado",seccion:"B",horasSem:4},
  ],4),
  doc("Marco","Ríos Castillo","64523187","m.rios@edu.pe","956-789-012","Inglés","Prof. de Educación Secundaria","2022-03-03","activo",[
    {nombre:"Inglés",grado:"3° Grado",seccion:"A",horasSem:3},
    {nombre:"Inglés",grado:"4° Grado",seccion:"A",horasSem:3},
    {nombre:"Inglés",grado:"5° Grado",seccion:"A",horasSem:3},
    {nombre:"Inglés",grado:"6° Grado",seccion:"A",horasSem:3},
  ],5),
  doc("Julia","Torres Mendoza","79012345","j.torres@edu.pe","967-890-123","Arte y Música","Lic. en Educación","2023-03-06","activo",[
    {nombre:"Arte y Cultura",grado:"3° Grado",seccion:"A",horasSem:2},
    {nombre:"Arte y Cultura",grado:"4° Grado",seccion:"A",horasSem:2},
    {nombre:"Arte y Cultura",grado:"5° Grado",seccion:"A",horasSem:2},
    {nombre:"Música",grado:"1° Grado",seccion:"A",horasSem:1},
    {nombre:"Música",grado:"2° Grado",seccion:"A",horasSem:1},
  ],6),
  doc("Diego","Fuentes Salinas","83456790","d.fuentes@edu.pe","978-901-234","Ciencias y Tecnología","Mg. en Educación","2020-08-01","activo",[
    {nombre:"Ciencias Naturales",grado:"5° Grado",seccion:"A",horasSem:3},
    {nombre:"Ciencias Naturales",grado:"6° Grado",seccion:"A",horasSem:3},
    {nombre:"Tecnología e Informática",grado:"5° Grado",seccion:"A",horasSem:2},
    {nombre:"Tecnología e Informática",grado:"6° Grado",seccion:"A",horasSem:2},
  ],7),
  doc("Patricia","Salas Vega","90123456","p.salas@edu.pe","989-012-345","Comunicación","Lic. en Educación","2016-03-01","inactivo",[
    {nombre:"Comunicación",grado:"4° Grado",seccion:"A",horasSem:5},
    {nombre:"Comunicación",grado:"5° Grado",seccion:"A",horasSem:5},
  ],8),
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const [y,m,d] = iso.split("-");
  const months=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${months[Number(m)-1]} ${y}`;
}
function fullName(d: Docente) { return `${d.nombres} ${d.apellidos}`; }
function initials(d: Docente) { return `${d.nombres[0]}${d.apellidos[0]}`; }
function totalHoras(d: Docente) { return d.asignaturas.reduce((s,a)=>s+a.horasSem,0); }
function uniqueGrados(d: Docente) { return [...new Set(d.asignaturas.map(a=>a.grado))]; }
function uniqueMaterias(d: Docente) { return [...new Set(d.asignaturas.map(a=>a.nombre))]; }

// ─── Form ─────────────────────────────────────────────────────────────────────

function DocenteForm({ initial, isNew, onSave, onCancel }: {
  initial: Partial<Docente>;
  isNew: boolean;
  onSave: (d: Omit<Docente,"id"|"color">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    nombres:      initial.nombres      ?? "",
    apellidos:    initial.apellidos    ?? "",
    dni:          initial.dni          ?? "",
    email:        initial.email        ?? "",
    telefono:     initial.telefono     ?? "",
    especialidad: initial.especialidad ?? "",
    titulo:       initial.titulo       ?? TITULOS[0],
    fechaIngreso: initial.fechaIngreso ?? "",
    estado:       initial.estado       ?? "activo" as Estado,
    asignaturas:  initial.asignaturas  ?? [] as Asignatura[],
  });

  const [newAsig, setNewAsig] = useState<Asignatura>({ nombre:ASIGNATURAS_LISTA[0], grado:GRADOS[0], seccion:"A", horasSem:3 });

  function addAsig() {
    setForm(f => ({ ...f, asignaturas: [...f.asignaturas, { ...newAsig }] }));
  }
  function removeAsig(i: number) {
    setForm(f => ({ ...f, asignaturas: f.asignaturas.filter((_,j)=>j!==i) }));
  }

  const valid = form.nombres.trim() && form.apellidos.trim() && form.email.trim() && form.dni.trim();

  const F = ({ label, children }: { label:string; children:React.ReactNode }) => (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none";
  const inputStyle = { background:"#1F2525", border:"1px solid #2e3939" };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-7 py-5 border-b flex-shrink-0" style={{ borderColor:"#2e3939" }}>
        <div>
          <p className="text-base font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>
            {isNew ? "Nuevo docente" : "Editar docente"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Completa los datos del docente</p>
        </div>
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 transition-colors"><X size={15}/></button>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
        {/* Personal */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-3">Datos personales</p>
          <div className="grid grid-cols-2 gap-4">
            <F label="Nombres"><input value={form.nombres} onChange={e=>setForm(f=>({...f,nombres:e.target.value}))} className={inputCls} style={inputStyle} placeholder="Nombres"/></F>
            <F label="Apellidos"><input value={form.apellidos} onChange={e=>setForm(f=>({...f,apellidos:e.target.value}))} className={inputCls} style={inputStyle} placeholder="Apellidos"/></F>
            <F label="DNI"><input value={form.dni} onChange={e=>setForm(f=>({...f,dni:e.target.value}))} className={inputCls} style={inputStyle} placeholder="12345678"/></F>
            <F label="Teléfono"><input value={form.telefono} onChange={e=>setForm(f=>({...f,telefono:e.target.value}))} className={inputCls} style={inputStyle} placeholder="9XX-XXX-XXX"/></F>
            <F label="Correo electrónico">
              <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className={inputCls} style={inputStyle} placeholder="docente@edu.pe" type="email"/>
            </F>
            <F label="Fecha de ingreso">
              <input type="date" value={form.fechaIngreso} onChange={e=>setForm(f=>({...f,fechaIngreso:e.target.value}))} className={inputCls} style={{...inputStyle,colorScheme:"dark"}}/>
            </F>
          </div>
        </div>

        {/* Professional */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-3">Datos profesionales</p>
          <div className="grid grid-cols-2 gap-4">
            <F label="Especialidad"><input value={form.especialidad} onChange={e=>setForm(f=>({...f,especialidad:e.target.value}))} className={inputCls} style={inputStyle} placeholder="p.ej. Matemática y Ciencias"/></F>
            <F label="Título académico">
              <select value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} className={inputCls} style={inputStyle}>
                {TITULOS.map(t=><option key={t} value={t} style={{background:"#1F2525"}}>{t}</option>)}
              </select>
            </F>
            <F label="Estado">
              <select value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value as Estado}))} className={inputCls} style={inputStyle}>
                <option value="activo"   style={{background:"#1F2525"}}>Activo</option>
                <option value="inactivo" style={{background:"#1F2525"}}>Inactivo</option>
              </select>
            </F>
          </div>
        </div>

        {/* Asignaturas */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-3">Asignaturas asignadas</p>
          {form.asignaturas.length > 0 && (
            <div className="mb-3 rounded-xl border overflow-hidden" style={{borderColor:"#2e3939"}}>
              <table className="w-full text-xs">
                <thead><tr style={{background:"#2e3939"}}>
                  {["Asignatura","Grado","Sec.","Hrs/sem",""].map(h=><th key={h} className="px-3 py-2 text-left text-[10px] text-gray-500 font-semibold uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {form.asignaturas.map((a,i)=>(
                    <tr key={i} style={{background:i%2===0?"#1F2525":"#1a2020"}}>
                      <td className="px-3 py-2 text-gray-300">{a.nombre}</td>
                      <td className="px-3 py-2 text-gray-400">{a.grado}</td>
                      <td className="px-3 py-2 text-gray-400">{a.seccion}</td>
                      <td className="px-3 py-2 text-gray-400">{a.horasSem}</td>
                      <td className="px-3 py-2">
                        <button onClick={()=>removeAsig(i)} className="text-gray-600 hover:text-[#EF4444] transition-colors"><X size={12}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add asignatura row */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <select value={newAsig.nombre} onChange={e=>setNewAsig(a=>({...a,nombre:e.target.value}))}
                className="w-full rounded-lg px-3 py-2 text-xs text-gray-300 outline-none" style={inputStyle}>
                {ASIGNATURAS_LISTA.map(n=><option key={n} value={n} style={{background:"#1F2525"}}>{n}</option>)}
              </select>
            </div>
            <select value={newAsig.grado} onChange={e=>setNewAsig(a=>({...a,grado:e.target.value}))}
              className="rounded-lg px-3 py-2 text-xs text-gray-300 outline-none" style={inputStyle}>
              {GRADOS.map(g=><option key={g} value={g} style={{background:"#1F2525"}}>{g}</option>)}
            </select>
            <select value={newAsig.seccion} onChange={e=>setNewAsig(a=>({...a,seccion:e.target.value}))}
              className="rounded-lg px-3 py-2 text-xs text-gray-300 outline-none w-16" style={inputStyle}>
              {SECCIONES.map(s=><option key={s} value={s} style={{background:"#1F2525"}}>{s}</option>)}
            </select>
            <div className="flex items-center gap-1" style={{...inputStyle,borderRadius:12,padding:"4px 10px"}}>
              <input type="number" min={1} max={10} value={newAsig.horasSem}
                onChange={e=>setNewAsig(a=>({...a,horasSem:Number(e.target.value)}))}
                className="bg-transparent outline-none text-xs text-gray-300 w-8 text-center"/>
              <span className="text-[10px] text-gray-600">h</span>
            </div>
            <button onClick={addAsig}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-white flex-shrink-0"
              style={{background:"linear-gradient(135deg,#00ADEB,#107A9F)"}}>
              <Plus size={12}/>Agregar
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-7 py-4 border-t flex-shrink-0" style={{borderColor:"#2e3939"}}>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs text-gray-500 border transition-colors hover:text-gray-300" style={{borderColor:"#2e3939"}}>Cancelar</button>
        <button onClick={()=>valid && onSave(form)} disabled={!valid}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
          style={{background:"linear-gradient(135deg,#00ADEB,#107A9F)",fontFamily:"var(--font-display)"}}>
          <Save size={12}/>{isNew ? "Crear docente" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

// ─── Profile view ─────────────────────────────────────────────────────────────

function DocenteProfile({ docente, onEdit, onToggleEstado, onDelete }: {
  docente: Docente;
  onEdit: () => void;
  onToggleEstado: () => void;
  onDelete: () => void;
}) {
  const [tab, setTab] = useState<"perfil"|"asignaturas">("perfil");
  const grados = uniqueGrados(docente);
  const materias = uniqueMaterias(docente);
  const horas = totalHoras(docente);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-7 py-6 border-b flex-shrink-0" style={{borderColor:"#2e3939"}}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
              style={{background:`linear-gradient(135deg,${docente.color},${docente.color}99)`}}>
              {initials(docente)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight" style={{fontFamily:"var(--font-display)"}}>{fullName(docente)}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{docente.especialidad}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">{docente.titulo} · {docente.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={docente.estado==="activo"
                ? {background:"#10B98120",color:"#10B981"}
                : {background:"#EF444420",color:"#EF4444"}}>
              {docente.estado==="activo" ? <CheckCircle size={11}/> : <XCircle size={11}/>}
              {docente.estado==="activo" ? "Activo" : "Inactivo"}
            </span>
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{borderColor:"#2e3939",color:"#9CA3AF"}}>
              <Edit3 size={12}/>Editar
            </button>
            <button onClick={onToggleEstado}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{borderColor:"#2e3939",color:docente.estado==="activo"?"#F59E0B":"#10B981"}}>
              {docente.estado==="activo"?"Desactivar":"Activar"}
            </button>
            <button onClick={onDelete}
              className="p-1.5 rounded-lg border text-gray-600 hover:text-[#EF4444] hover:border-[#EF4444] transition-colors"
              style={{borderColor:"#2e3939"}}>
              <Trash2 size={14}/>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {icon:BookOpen,  label:"Materias",     value:String(materias.length), color:"#00ADEB"},
            {icon:GraduationCap,label:"Grados",    value:String(grados.length),   color:"#8B5CF6"},
            {icon:Clock,     label:"Horas/sem",    value:`${horas}h`,             color:"#10B981"},
            {icon:Calendar,  label:"Ingreso",      value:fmtDate(docente.fechaIngreso), color:"#F59E0B"},
          ].map(({icon:Icon,label,value,color})=>(
            <div key={label} className="rounded-xl p-3 border" style={{background:"#1F2525",borderColor:"#2e3939"}}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={12} style={{color}}/>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
              </div>
              <p className="text-sm font-bold text-white" style={{fontFamily:"var(--font-display)"}}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b flex-shrink-0 px-7" style={{borderColor:"#2e3939"}}>
        {(["perfil","asignaturas"] as const).map((t)=>(
          <button key={t} onClick={()=>setTab(t)}
            className="px-4 py-3 text-xs font-semibold capitalize border-b-2 transition-colors"
            style={{borderColor:tab===t?"#00ADEB":"transparent",color:tab===t?"#00ADEB":"#6B7280"}}>
            {t==="perfil" ? "Perfil" : "Asignaturas"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-7 py-5">
        {tab === "perfil" && (
          <div className="space-y-4">
            {[
              {icon:User,  label:"DNI",    value:docente.dni},
              {icon:Mail,  label:"Correo", value:docente.email},
              {icon:Phone, label:"Teléfono",value:docente.telefono},
            ].map(({icon:Icon,label,value})=>(
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl border" style={{background:"#1F2525",borderColor:"#2e3939"}}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"#37415130"}}>
                  <Icon size={14} className="text-gray-400"/>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">{label}</p>
                  <p className="text-sm text-gray-200 mt-0.5">{value}</p>
                </div>
              </div>
            ))}

            {/* Materias resumen */}
            <div className="p-4 rounded-xl border" style={{background:"#1F2525",borderColor:"#2e3939"}}>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-3">Materias que imparte</p>
              <div className="flex flex-wrap gap-2">
                {materias.map(m=>(
                  <span key={m} className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{background:`${docente.color}18`,color:docente.color}}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Grados resumen */}
            <div className="p-4 rounded-xl border" style={{background:"#1F2525",borderColor:"#2e3939"}}>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-3">Grados asignados</p>
              <div className="flex flex-wrap gap-2">
                {grados.sort().map(g=>(
                  <span key={g} className="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                    style={{background:"#37415118",color:"#9CA3AF",borderColor:"#37415140"}}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "asignaturas" && (
          <div className="rounded-xl border overflow-hidden" style={{borderColor:"#2e3939"}}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{background:"#2e3939"}}>
                  {["Asignatura","Grado","Sección","Horas/sem"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{borderColor:"#2e3939"}}>
                {docente.asignaturas.map((a,i)=>(
                  <tr key={i} style={{background:i%2===0?"#1F2525":"#1a2020"}}>
                    <td className="px-4 py-3 text-gray-200 font-medium">{a.nombre}</td>
                    <td className="px-4 py-3 text-gray-400">{a.grado}</td>
                    <td className="px-4 py-3">
                      <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold"
                        style={{background:`${docente.color}20`,color:docente.color}}>
                        {a.seccion}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock size={10} className="text-gray-600"/>{a.horasSem}h/sem
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{background:"#2e3939"}}>
                  <td colSpan={3} className="px-4 py-2 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Total</td>
                  <td className="px-4 py-2 text-[11px] font-bold" style={{color:"#00ADEB"}}>{horas}h/sem</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Docentes() {
  const [docentes,    setDocentes]   = useState<Docente[]>(SEED);
  const [selectedId,  setSelectedId] = useState<string>(SEED[0].id);
  const [rightMode,   setRightMode]  = useState<RightMode>("view");
  const [search,      setSearch]     = useState("");
  const [filterEstado,setFilterEstado]=useState<""|Estado>("");
  const [filterMateria,setFilterMateria]=useState("");

  const nextColor = { current: 0 };

  const filtered = useMemo(() => docentes.filter(d=>{
    const q = search.toLowerCase();
    return (!q || fullName(d).toLowerCase().includes(q) || d.especialidad.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
      && (!filterEstado  || d.estado === filterEstado)
      && (!filterMateria || d.asignaturas.some(a=>a.nombre===filterMateria));
  }), [docentes, search, filterEstado, filterMateria]);

  const selected = docentes.find(d=>d.id===selectedId) ?? null;
  const hasFilters = !!(search||filterEstado||filterMateria);

  function handleSave(form: Omit<Docente,"id"|"color">) {
    if (rightMode === "create") {
      const newId = `DOC-${String(docentes.length+1).padStart(3,"0")}`;
      const colorIdx = docentes.length % AVATAR_COLORS.length;
      setDocentes(prev=>[...prev, {...form, id:newId, color:AVATAR_COLORS[colorIdx]}]);
      setSelectedId(newId);
    } else if (selected) {
      setDocentes(prev=>prev.map(d=>d.id===selected.id ? {...d,...form} : d));
    }
    setRightMode("view");
  }

  function handleToggleEstado() {
    if (!selected) return;
    setDocentes(prev=>prev.map(d=>d.id===selected.id ? {...d, estado:d.estado==="activo"?"inactivo":"activo"} : d));
  }

  function handleDelete() {
    const remaining = docentes.filter(d=>d.id!==selectedId);
    setDocentes(remaining);
    setSelectedId(remaining[0]?.id ?? "");
    setRightMode("view");
  }

  const MATERIAS_OPTS = [...new Set(SEED.flatMap(d=>d.asignaturas.map(a=>a.nombre)))].sort();
  void nextColor;

  return (
    <div className="flex gap-4 h-full" style={{minHeight:0}}>

      {/* ── Left list panel ── */}
      <div className="flex flex-col flex-shrink-0 rounded-2xl border overflow-hidden" style={{width:360,background:"#263030",borderColor:"#2e3939"}}>
        {/* Top */}
        <div className="flex items-center justify-between px-4 py-4 border-b flex-shrink-0" style={{borderColor:"#2e3939"}}>
          <div>
            <p className="text-sm font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Docentes</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{docentes.filter(d=>d.estado==="activo").length} activos · {docentes.filter(d=>d.estado==="inactivo").length} inactivos</p>
          </div>
          <button onClick={()=>setRightMode("create")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white flex-shrink-0"
            style={{background:"linear-gradient(135deg,#00ADEB,#107A9F)",fontFamily:"var(--font-display)"}}>
            <Plus size={13}/>Nuevo
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b flex-shrink-0" style={{borderColor:"#2e3939"}}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{background:"#1F2525",border:"1px solid #2e3939"}}>
            <Search size={12} className="text-gray-500 flex-shrink-0"/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Buscar docente..." className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-full"/>
            {search && <button onClick={()=>setSearch("")}><X size={11} className="text-gray-500"/></button>}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{borderColor:"#2e3939"}}>
          <select value={filterEstado} onChange={e=>setFilterEstado(e.target.value as ""| Estado)}
            className="flex-1 bg-transparent outline-none text-[11px] text-gray-400">
            <option value="" style={{background:"#1F2525"}}>Todos los estados</option>
            <option value="activo"   style={{background:"#1F2525"}}>Activos</option>
            <option value="inactivo" style={{background:"#1F2525"}}>Inactivos</option>
          </select>
          <select value={filterMateria} onChange={e=>setFilterMateria(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[11px] text-gray-400">
            <option value="" style={{background:"#1F2525"}}>Todas las materias</option>
            {MATERIAS_OPTS.map(m=><option key={m} value={m} style={{background:"#1F2525"}}>{m}</option>)}
          </select>
          {hasFilters && (
            <button onClick={()=>{setSearch("");setFilterEstado("");setFilterMateria("");}}
              className="p-1 rounded text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0">
              <RotateCcw size={11}/>
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y" style={{borderColor:"#2e3939"}}>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <AlertCircle size={28} className="text-gray-700 mb-3"/>
              <p className="text-sm text-gray-500">Sin resultados</p>
            </div>
          )}
          {filtered.map(d=>{
            const isSelected = d.id === selectedId && rightMode !== "create";
            return (
              <button key={d.id}
                onClick={()=>{setSelectedId(d.id);setRightMode("view");}}
                className="w-full text-left px-4 py-4 transition-all relative"
                style={{background:isSelected?"#1F2525":"transparent",borderLeft:`3px solid ${isSelected?d.color:"transparent"}`}}>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 relative"
                    style={{background:`linear-gradient(135deg,${d.color},${d.color}88)`}}>
                    {initials(d)}
                    {d.estado==="inactivo" && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{background:"#EF4444",borderColor:"#263030"}}/>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate" style={{fontFamily:"var(--font-display)"}}>{fullName(d)}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">{d.especialidad}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] text-gray-600">{uniqueMaterias(d).length} materias</span>
                      <span className="text-[9px] text-gray-700">·</span>
                      <span className="text-[9px] text-gray-600">{uniqueGrados(d).length} grados</span>
                      <span className="text-[9px] text-gray-700">·</span>
                      <span className="text-[9px] text-gray-600">{totalHoras(d)}h/sem</span>
                    </div>
                  </div>
                  {isSelected && <ChevronRight size={12} style={{color:d.color,flexShrink:0}}/>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 rounded-2xl border overflow-hidden" style={{background:"#263030",borderColor:"#2e3939"}}>
        {rightMode === "create" ? (
          <DocenteForm initial={{}} isNew onSave={handleSave} onCancel={()=>setRightMode("view")}/>
        ) : rightMode === "edit" && selected ? (
          <DocenteForm initial={selected} isNew={false} onSave={handleSave} onCancel={()=>setRightMode("view")}/>
        ) : selected ? (
          <DocenteProfile
            docente={selected}
            onEdit={()=>setRightMode("edit")}
            onToggleEstado={handleToggleEstado}
            onDelete={handleDelete}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{background:"#1F2525"}}>
              <GraduationCap size={28} className="text-gray-600"/>
            </div>
            <p className="text-base font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Selecciona un docente</p>
            <p className="text-sm text-gray-500 mt-1">o crea uno nuevo para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
