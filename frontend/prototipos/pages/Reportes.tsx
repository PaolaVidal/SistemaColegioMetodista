import { useState, useCallback } from "react";
import {
  FileText, Users, DollarSign, Calendar, BarChart2, BookOpen,
  GraduationCap, ClipboardList, Download, Printer, RefreshCw,
  ChevronRight, Filter, TrendingUp, AlertCircle, CheckCircle,
  Clock, XCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ReportId =
  | "calificaciones" | "asistencia" | "rendimiento" | "boletas"
  | "matriculas"     | "estudiantes" | "pagos"       | "estados-cuenta";

interface FilterDef {
  id: string;
  label: string;
  type: "select" | "date";
  options?: string[];
}

interface ReportDef {
  id: ReportId;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  category: "academico" | "administrativo";
  filters: FilterDef[];
  color: string;
}

// ─── Report Catalog ─────────────────────────────────────────────────────────────

const REPORTS: ReportDef[] = [
  {
    id: "calificaciones", label: "Calificaciones", category: "academico", color: "#00ADEB",
    description: "Notas por asignatura, bimestre y grado",
    icon: BookOpen,
    filters: [
      { id: "bimestre",  label: "Bimestre",    type: "select", options: ["I Bimestre","II Bimestre","III Bimestre","IV Bimestre"] },
      { id: "grado",     label: "Grado",       type: "select", options: ["Todos","1° Grado","2° Grado","3° Grado","4° Grado","5° Grado","6° Grado"] },
      { id: "seccion",   label: "Sección",     type: "select", options: ["Todas","A","B","C"] },
      { id: "asignatura",label: "Asignatura",  type: "select", options: ["Todas","Matemática","Comunicación","Ciencias","Historia","Arte","Educación Física"] },
    ],
  },
  {
    id: "asistencia", label: "Asistencia", category: "academico", color: "#10B981",
    description: "Registro de asistencia por período y grupo",
    icon: Calendar,
    filters: [
      { id: "fecha_inicio", label: "Fecha inicio", type: "date" },
      { id: "fecha_fin",    label: "Fecha fin",    type: "date" },
      { id: "grado",    label: "Grado",   type: "select", options: ["Todos","1° Grado","2° Grado","3° Grado","4° Grado","5° Grado","6° Grado"] },
      { id: "seccion",  label: "Sección", type: "select", options: ["Todas","A","B","C"] },
    ],
  },
  {
    id: "rendimiento", label: "Rendimiento", category: "academico", color: "#8B5CF6",
    description: "Análisis de rendimiento y bajo rendimiento",
    icon: TrendingUp,
    filters: [
      { id: "bimestre", label: "Bimestre", type: "select", options: ["I Bimestre","II Bimestre","III Bimestre","IV Bimestre"] },
      { id: "grado",    label: "Grado",    type: "select", options: ["Todos","1° Grado","2° Grado","3° Grado","4° Grado","5° Grado","6° Grado"] },
      { id: "umbral",   label: "Filtro",   type: "select", options: ["Todos los estudiantes","Solo bajo rendimiento","Destacados"] },
    ],
  },
  {
    id: "boletas", label: "Boletas", category: "academico", color: "#F59E0B",
    description: "Boletas de notas individuales por período",
    icon: FileText,
    filters: [
      { id: "bimestre", label: "Bimestre", type: "select", options: ["I Bimestre","II Bimestre","III Bimestre","IV Bimestre"] },
      { id: "grado",    label: "Grado",    type: "select", options: ["1° Grado","2° Grado","3° Grado","4° Grado","5° Grado","6° Grado"] },
      { id: "seccion",  label: "Sección",  type: "select", options: ["A","B","C"] },
    ],
  },
  {
    id: "matriculas", label: "Matrículas", category: "administrativo", color: "#EC4899",
    description: "Estado y estadísticas del proceso de matrícula",
    icon: ClipboardList,
    filters: [
      { id: "año",    label: "Año escolar", type: "select", options: ["2026","2025","2024"] },
      { id: "estado", label: "Estado",      type: "select", options: ["Todos","Activo","Retirado","Trasladado","Egresado"] },
    ],
  },
  {
    id: "estudiantes", label: "Estudiantes", category: "administrativo", color: "#107A9F",
    description: "Padrón general de estudiantes matriculados",
    icon: GraduationCap,
    filters: [
      { id: "grado",   label: "Grado",   type: "select", options: ["Todos","1° Grado","2° Grado","3° Grado","4° Grado","5° Grado","6° Grado"] },
      { id: "estado",  label: "Estado",  type: "select", options: ["Todos","Activo","Retirado","Trasladado"] },
      { id: "genero",  label: "Género",  type: "select", options: ["Todos","Masculino","Femenino"] },
    ],
  },
  {
    id: "pagos", label: "Pagos", category: "administrativo", color: "#10B981",
    description: "Historial de pagos y cobranza por período",
    icon: DollarSign,
    filters: [
      { id: "fecha_inicio", label: "Fecha inicio", type: "date" },
      { id: "fecha_fin",    label: "Fecha fin",    type: "date" },
      { id: "concepto",     label: "Concepto",     type: "select", options: ["Todos","Mensualidad","Matrícula","Materiales","Actividades","Seguro"] },
      { id: "estado",       label: "Estado",       type: "select", options: ["Todos","Pagado","Pendiente","Vencido","Parcial"] },
    ],
  },
  {
    id: "estados-cuenta", label: "Estados de cuenta", category: "administrativo", color: "#F87171",
    description: "Saldos y deudas por familia",
    icon: BarChart2,
    filters: [
      { id: "grado",        label: "Grado",         type: "select", options: ["Todos","1° Grado","2° Grado","3° Grado","4° Grado","5° Grado","6° Grado"] },
      { id: "estado_pago",  label: "Estado de pago",type: "select", options: ["Todos","Al día","Con deuda","Vencido"] },
    ],
  },
];

const CHART_COLORS = ["#00ADEB","#10B981","#8B5CF6","#F59E0B","#EC4899","#F87171","#60A5FA","#34D399"];

// ─── Mock data generators ──────────────────────────────────────────────────────

function mockCalificaciones(filters: Record<string, string>) {
  const asignaturas = ["Matemática","Comunicación","Ciencias","Historia","Arte","Ed. Física"];
  const rows = [
    { nombre:"Ana García",       grado:"3° A", mat:18, com:16, cie:17, his:15, art:19, ef:18, prom:17.2 },
    { nombre:"Carlos Mendoza",   grado:"3° A", mat:12, com:14, cie:11, his:13, art:15, ef:16, prom:13.5 },
    { nombre:"Lucía Paredes",    grado:"3° B", mat:16, com:18, cie:15, his:17, art:14, ef:17, prom:16.2 },
    { nombre:"Diego Ríos",       grado:"3° B", mat:10, com:11, cie: 9, his:10, art:13, ef:14, prom:11.2 },
    { nombre:"Valeria Torres",   grado:"3° C", mat:19, com:18, cie:20, his:18, art:17, ef:19, prom:18.5 },
    { nombre:"Sebastián Luna",   grado:"3° C", mat:14, com:13, cie:15, his:12, art:16, ef:15, prom:14.2 },
    { nombre:"Isabella Flores",  grado:"4° A", mat:17, com:16, cie:18, his:17, art:15, ef:18, prom:16.8 },
    { nombre:"Rodrigo Castillo", grado:"4° A", mat: 9, com:10, cie:11, his: 9, art:12, ef:13, prom:10.7 },
  ].filter((r) => !filters.grado || filters.grado === "Todos" || r.grado.startsWith(filters.grado.split(" ")[0]));

  const byAsig = asignaturas.map((a, i) => {
    const vals = [rows.map(r=>[r.mat,r.com,r.cie,r.his,r.art,r.ef][i])];
    const avg = vals[0].reduce((s,v)=>s+v,0)/vals[0].length;
    return { asignatura: a.slice(0,6), promedio: +avg.toFixed(1) };
  });

  return {
    kpis: [
      { label:"Promedio general", value: "15.4", sub:"I Bimestre", icon: BookOpen, color:"#00ADEB" },
      { label:"Destacados",       value: `${rows.filter(r=>r.prom>=17).length}`, sub:"Promedio ≥ 17", icon: CheckCircle, color:"#10B981" },
      { label:"Bajo rendimiento", value: `${rows.filter(r=>r.prom<11).length}`, sub:"Promedio < 11",  icon: AlertCircle, color:"#EF4444" },
      { label:"Total evaluados",  value: `${rows.length}`, sub:"Estudiantes",    icon: Users,        color:"#8B5CF6" },
    ],
    chartData: byAsig,
    chartType: "bar" as const,
    chartKey: "promedio",
    chartLabel: "Promedio",
    rows,
    columns: ["Nombre","Grado","Mat.","Com.","Cie.","His.","Art.","E.F.","Promedio"],
    rowFn: (r: typeof rows[0]) => [r.nombre,r.grado,r.mat,r.com,r.cie,r.his,r.art,r.ef,r.prom.toFixed(1)],
    colorFn: (r: typeof rows[0]) => r.prom < 11 ? "#EF444430" : r.prom >= 17 ? "#10B98120" : "transparent",
  };
}

function mockAsistencia(filters: Record<string, string>) {
  const rows = [
    { nombre:"Ana García",       grado:"3° A", presentes:42, tardanzas:2, faltas:1, justificadas:1, pct:"93.3%" },
    { nombre:"Carlos Mendoza",   grado:"3° A", presentes:38, tardanzas:5, faltas:2, justificadas:2, pct:"84.4%" },
    { nombre:"Lucía Paredes",    grado:"3° B", presentes:44, tardanzas:1, faltas:0, justificadas:0, pct:"97.8%" },
    { nombre:"Diego Ríos",       grado:"3° B", presentes:35, tardanzas:6, faltas:4, justificadas:1, pct:"77.8%" },
    { nombre:"Valeria Torres",   grado:"3° C", presentes:45, tardanzas:0, faltas:0, justificadas:0, pct:"100%" },
    { nombre:"Sebastián Luna",   grado:"3° C", presentes:40, tardanzas:3, faltas:2, justificadas:2, pct:"88.9%" },
    { nombre:"Isabella Flores",  grado:"4° A", presentes:43, tardanzas:2, faltas:0, justificadas:0, pct:"95.6%" },
    { nombre:"Rodrigo Castillo", grado:"4° A", presentes:32, tardanzas:8, faltas:5, justificadas:0, pct:"71.1%" },
  ];
  const trend = [
    { sem:"S1", asistencia:96 }, { sem:"S2", asistencia:94 },
    { sem:"S3", asistencia:91 }, { sem:"S4", asistencia:93 },
    { sem:"S5", asistencia:88 }, { sem:"S6", asistencia:90 },
  ];
  return {
    kpis: [
      { label:"Asistencia promedio", value:"90.1%",  sub:"Del período",      icon: CheckCircle, color:"#10B981" },
      { label:"Tardanzas totales",   value:"27",     sub:"Registradas",      icon: Clock,       color:"#F59E0B" },
      { label:"Faltas injustificadas",value:"14",    sub:"Sin justificación", icon: XCircle,    color:"#EF4444" },
      { label:"Asistencia perfecta", value:"2",      sub:"Estudiantes",       icon: Users,      color:"#00ADEB" },
    ],
    chartData: trend, chartType:"line" as const, chartKey:"asistencia", chartLabel:"% Asistencia",
    rows, columns:["Nombre","Grado","Presentes","Tardanzas","Faltas","Justificadas","Asistencia"],
    rowFn:(r:typeof rows[0])=>[r.nombre,r.grado,r.presentes,r.tardanzas,r.faltas,r.justificadas,r.pct],
    colorFn:(r:typeof rows[0])=>parseInt(r.pct)<80?"#EF444430":"transparent",
  };
}

function mockRendimiento() {
  const niveles = [
    { nivel:"Destacado (17-20)", cantidad:8, pct:26.7, fill:"#10B981" },
    { nivel:"Logrado (14-16)",   cantidad:12, pct:40.0, fill:"#00ADEB" },
    { nivel:"En proceso (11-13)",cantidad:7,  pct:23.3, fill:"#F59E0B" },
    { nivel:"En inicio (<11)",   cantidad:3,  pct:10.0, fill:"#EF4444" },
  ];
  const rows = [
    { nombre:"Rodrigo Castillo", grado:"4° A", prom:"10.7", nivel:"En inicio",  asig:"Matemática" },
    { nombre:"Diego Ríos",       grado:"3° B", prom:"11.2", nivel:"En proceso", asig:"Ciencias" },
    { nombre:"Carlos Mendoza",   grado:"3° A", prom:"13.5", nivel:"En proceso", asig:"Matemática" },
    { nombre:"Sebastián Luna",   grado:"3° C", prom:"14.2", nivel:"Logrado",    asig:"Historia" },
    { nombre:"Lucía Paredes",    grado:"3° B", prom:"16.2", nivel:"Logrado",    asig: "—" },
    { nombre:"Isabella Flores",  grado:"4° A", prom:"16.8", nivel:"Logrado",    asig: "—" },
    { nombre:"Ana García",       grado:"3° A", prom:"17.2", nivel:"Destacado",  asig: "—" },
    { nombre:"Valeria Torres",   grado:"3° C", prom:"18.5", nivel:"Destacado",  asig: "—" },
  ];
  return {
    kpis:[
      { label:"Promedio institucional", value:"14.7", sub:"I Bimestre",    icon:TrendingUp,  color:"#00ADEB" },
      { label:"Destacados",             value:"8",    sub:"17 a 20 pts",   icon:CheckCircle, color:"#10B981" },
      { label:"En inicio",              value:"3",    sub:"Menos de 11 pts",icon:AlertCircle,color:"#EF4444" },
      { label:"Total estudiantes",      value:"30",   sub:"Evaluados",     icon:Users,        color:"#8B5CF6" },
    ],
    chartData:niveles, chartType:"pie" as const, chartKey:"cantidad", chartLabel:"Estudiantes",
    rows, columns:["Nombre","Grado","Promedio","Nivel","Asig. riesgo"],
    rowFn:(r:typeof rows[0])=>[r.nombre,r.grado,r.prom,r.nivel,r.asig],
    colorFn:(r:typeof rows[0])=>r.nivel==="En inicio"?"#EF444430":r.nivel==="Destacado"?"#10B98115":"transparent",
  };
}

function mockBoletas() {
  const rows = [
    { nombre:"Ana García",       codigo:"2024-001", prom:"17.2", estado:"Logrado",    entregada: true  },
    { nombre:"Carlos Mendoza",   codigo:"2024-002", prom:"13.5", estado:"En proceso", entregada: true  },
    { nombre:"Lucía Paredes",    codigo:"2024-003", prom:"16.2", estado:"Logrado",    entregada: false },
    { nombre:"Diego Ríos",       codigo:"2024-004", prom:"11.2", estado:"En proceso", entregada: false },
    { nombre:"Valeria Torres",   codigo:"2024-005", prom:"18.5", estado:"Destacado",  entregada: true  },
    { nombre:"Sebastián Luna",   codigo:"2024-006", prom:"14.2", estado:"Logrado",    entregada: true  },
    { nombre:"Isabella Flores",  codigo:"2024-007", prom:"16.8", estado:"Logrado",    entregada: false },
    { nombre:"Rodrigo Castillo", codigo:"2024-008", prom:"10.7", estado:"En inicio",  entregada: false },
  ];
  return {
    kpis:[
      { label:"Total boletas",   value:"8",  sub:"Generadas",        icon:FileText,    color:"#00ADEB" },
      { label:"Entregadas",      value:"4",  sub:"A encargados",     icon:CheckCircle, color:"#10B981" },
      { label:"Pendientes",      value:"4",  sub:"Por entregar",     icon:Clock,       color:"#F59E0B" },
      { label:"Promedio sección",value:"14.8",sub:"I Bimestre",      icon:BarChart2,   color:"#8B5CF6" },
    ],
    chartData:[], chartType:"bar" as const, chartKey:"", chartLabel:"",
    rows, columns:["Nombre","Código","Promedio","Nivel","Entregada"],
    rowFn:(r:typeof rows[0])=>[r.nombre,r.codigo,r.prom,r.estado,r.entregada?"Sí":"No"],
    colorFn:(r:typeof rows[0])=>r.estado==="En inicio"?"#EF444420":"transparent",
  };
}

function mockMatriculas() {
  const byGrado=[
    {grado:"1° Grado",total:28},{grado:"2° Grado",total:31},{grado:"3° Grado",total:30},
    {grado:"4° Grado",total:29},{grado:"5° Grado",total:27},{grado:"6° Grado",total:25},
  ];
  const rows=[
    {grado:"1° Grado",matriculados:28,capacidad:30,activos:26,retirados:2,pct:"93.3%"},
    {grado:"2° Grado",matriculados:31,capacidad:30,activos:30,retirados:1,pct:"96.8%"},
    {grado:"3° Grado",matriculados:30,capacidad:30,activos:29,retirados:1,pct:"96.7%"},
    {grado:"4° Grado",matriculados:29,capacidad:30,activos:27,retirados:2,pct:"93.1%"},
    {grado:"5° Grado",matriculados:27,capacidad:30,activos:25,retirados:2,pct:"92.6%"},
    {grado:"6° Grado",matriculados:25,capacidad:30,activos:24,retirados:1,pct:"96.0%"},
  ];
  return {
    kpis:[
      {label:"Total matriculados",value:"170",sub:"Año 2026",    icon:GraduationCap,color:"#00ADEB"},
      {label:"Activos",           value:"161",sub:"En clases",   icon:CheckCircle,  color:"#10B981"},
      {label:"Retirados",         value:"9",  sub:"Del período", icon:XCircle,      color:"#EF4444"},
      {label:"Capacidad usada",   value:"94.4%",sub:"6 grados",  icon:BarChart2,    color:"#8B5CF6"},
    ],
    chartData:byGrado,chartType:"bar" as const,chartKey:"total",chartLabel:"Matriculados",
    rows,columns:["Grado","Matriculados","Capacidad","Activos","Retirados","% Activos"],
    rowFn:(r:typeof rows[0])=>[r.grado,r.matriculados,r.capacidad,r.activos,r.retirados,r.pct],
    colorFn:()=>"transparent" as string,
  };
}

function mockEstudiantes() {
  const rows=[
    {nombre:"Ana García",       codigo:"2024-001",grado:"3° A",genero:"F",estado:"Activo",  ingreso:"2024-03-01"},
    {nombre:"Carlos Mendoza",   codigo:"2024-002",grado:"3° A",genero:"M",estado:"Activo",  ingreso:"2024-03-01"},
    {nombre:"Lucía Paredes",    codigo:"2024-003",grado:"3° B",genero:"F",estado:"Activo",  ingreso:"2023-03-05"},
    {nombre:"Diego Ríos",       codigo:"2024-004",grado:"3° B",genero:"M",estado:"Retirado",ingreso:"2024-03-01"},
    {nombre:"Valeria Torres",   codigo:"2024-005",grado:"3° C",genero:"F",estado:"Activo",  ingreso:"2022-03-07"},
    {nombre:"Sebastián Luna",   codigo:"2024-006",grado:"3° C",genero:"M",estado:"Activo",  ingreso:"2024-03-01"},
    {nombre:"Isabella Flores",  codigo:"2024-007",grado:"4° A",genero:"F",estado:"Activo",  ingreso:"2025-03-03"},
    {nombre:"Rodrigo Castillo", codigo:"2024-008",grado:"4° A",genero:"M",estado:"Activo",  ingreso:"2025-03-03"},
  ];
  const porGenero=[{name:"Femenino",value:88,fill:"#EC4899"},{name:"Masculino",value:82,fill:"#00ADEB"}];
  return {
    kpis:[
      {label:"Total estudiantes",value:"170",sub:"Activos",      icon:Users,        color:"#00ADEB"},
      {label:"Género femenino",  value:"88", sub:"51.8%",        icon:GraduationCap,color:"#EC4899"},
      {label:"Género masculino", value:"82", sub:"48.2%",        icon:GraduationCap,color:"#107A9F"},
      {label:"Ingresaron 2026",  value:"43", sub:"Nuevos",       icon:ClipboardList,color:"#10B981"},
    ],
    chartData:porGenero,chartType:"pie" as const,chartKey:"value",chartLabel:"Estudiantes",
    rows,columns:["Nombre","Código","Grado","Género","Estado","Ingreso"],
    rowFn:(r:typeof rows[0])=>[r.nombre,r.codigo,r.grado,r.genero==="F"?"Femenino":"Masculino",r.estado,r.ingreso],
    colorFn:(r:typeof rows[0])=>r.estado==="Retirado"?"#EF444420":"transparent" as string,
  };
}

function mockPagos() {
  const trend=[
    {mes:"Abr",recaudado:18400},{mes:"May",recaudado:21200},{mes:"Jun",recaudado:19800},
    {mes:"Jul",recaudado:22100},{mes:"Ago",recaudado:20500},{mes:"Sep",recaudado:17300},
  ];
  const rows=[
    {estudiante:"Ana García",       concepto:"Mensualidad",fecha:"2026-09-01",monto:"S/ 320.00",estado:"Pagado"},
    {estudiante:"Carlos Mendoza",   concepto:"Mensualidad",fecha:"2026-09-01",monto:"S/ 320.00",estado:"Pendiente"},
    {estudiante:"Lucía Paredes",    concepto:"Materiales",  fecha:"2026-08-15",monto:"S/ 85.00", estado:"Pagado"},
    {estudiante:"Diego Ríos",       concepto:"Mensualidad",fecha:"2026-08-01",monto:"S/ 320.00",estado:"Vencido"},
    {estudiante:"Valeria Torres",   concepto:"Actividades", fecha:"2026-09-05",monto:"S/ 45.00", estado:"Pagado"},
    {estudiante:"Sebastián Luna",   concepto:"Mensualidad",fecha:"2026-09-01",monto:"S/ 320.00",estado:"Parcial"},
    {estudiante:"Isabella Flores",  concepto:"Matrícula",   fecha:"2026-03-01",monto:"S/ 250.00",estado:"Pagado"},
    {estudiante:"Rodrigo Castillo", concepto:"Mensualidad",fecha:"2026-08-01",monto:"S/ 320.00",estado:"Vencido"},
  ];
  return {
    kpis:[
      {label:"Recaudado",          value:"S/ 119,300",sub:"Período",      icon:DollarSign,color:"#10B981"},
      {label:"Pagos al día",       value:"72.4%",     sub:"De estudiantes",icon:CheckCircle,color:"#00ADEB"},
      {label:"Deuda total",        value:"S/ 28,640", sub:"Pendiente",    icon:AlertCircle,color:"#EF4444"},
      {label:"Vencidos",           value:"23",        sub:"Pagos",        icon:XCircle,    color:"#F59E0B"},
    ],
    chartData:trend,chartType:"line" as const,chartKey:"recaudado",chartLabel:"S/ Recaudado",
    rows,columns:["Estudiante","Concepto","Fecha","Monto","Estado"],
    rowFn:(r:typeof rows[0])=>[r.estudiante,r.concepto,r.fecha,r.monto,r.estado],
    colorFn:(r:typeof rows[0])=>r.estado==="Vencido"?"#EF444420":r.estado==="Pagado"?"#10B98110":"transparent" as string,
  };
}

function mockEstadosCuenta() {
  const rows=[
    {nombre:"Fam. García",    grado:"3° A",total:"S/ 320.00",pagado:"S/ 320.00",pendiente:"S/ 0.00",   estado:"Al día"},
    {nombre:"Fam. Mendoza",   grado:"3° A",total:"S/ 960.00",pagado:"S/ 640.00",pendiente:"S/ 320.00", estado:"Con deuda"},
    {nombre:"Fam. Paredes",   grado:"3° B",total:"S/ 405.00",pagado:"S/ 405.00",pendiente:"S/ 0.00",   estado:"Al día"},
    {nombre:"Fam. Ríos",      grado:"3° B",total:"S/ 640.00",pagado:"S/ 0.00",  pendiente:"S/ 640.00", estado:"Vencido"},
    {nombre:"Fam. Torres",    grado:"3° C",total:"S/ 365.00",pagado:"S/ 365.00",pendiente:"S/ 0.00",   estado:"Al día"},
    {nombre:"Fam. Luna",      grado:"3° C",total:"S/ 320.00",pagado:"S/ 160.00",pendiente:"S/ 160.00", estado:"Con deuda"},
    {nombre:"Fam. Flores",    grado:"4° A",total:"S/ 570.00",pagado:"S/ 570.00",pendiente:"S/ 0.00",   estado:"Al día"},
    {nombre:"Fam. Castillo",  grado:"4° A",total:"S/ 640.00",pagado:"S/ 0.00",  pendiente:"S/ 640.00", estado:"Vencido"},
  ];
  const pie=[
    {name:"Al día",    value:105,fill:"#10B981"},
    {name:"Con deuda", value:38, fill:"#F59E0B"},
    {name:"Vencido",   value:27, fill:"#EF4444"},
  ];
  return {
    kpis:[
      {label:"Familias al día",    value:"105",sub:"62.1% del total",icon:CheckCircle,color:"#10B981"},
      {label:"Con deuda activa",   value:"38", sub:"22.5% del total",icon:Clock,      color:"#F59E0B"},
      {label:"Cuentas vencidas",   value:"27", sub:"15.4% del total",icon:XCircle,    color:"#EF4444"},
      {label:"Deuda total",        value:"S/ 28,640",sub:"Pendiente",icon:DollarSign, color:"#F87171"},
    ],
    chartData:pie,chartType:"pie" as const,chartKey:"value",chartLabel:"Familias",
    rows,columns:["Familia","Grado","Total","Pagado","Pendiente","Estado"],
    rowFn:(r:typeof rows[0])=>[r.nombre,r.grado,r.total,r.pagado,r.pendiente,r.estado],
    colorFn:(r:typeof rows[0])=>r.estado==="Vencido"?"#EF444420":r.estado==="Al día"?"#10B98110":"transparent" as string,
  };
}

function getReportData(id: ReportId, filters: Record<string, string>) {
  switch (id) {
    case "calificaciones":   return mockCalificaciones(filters);
    case "asistencia":       return mockAsistencia(filters);
    case "rendimiento":      return mockRendimiento();
    case "boletas":          return mockBoletas();
    case "matriculas":       return mockMatriculas();
    case "estudiantes":      return mockEstudiantes();
    case "pagos":            return mockPagos();
    case "estados-cuenta":   return mockEstadosCuenta();
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color }: { label:string;value:string;sub:string;icon:React.ComponentType<{size?:number;style?:React.CSSProperties}>;color:string }) {
  return (
    <div className="rounded-xl p-4 border flex items-start gap-3" style={{ background:"#1F2525",borderColor:"#2e3939" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:`${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-white leading-tight" style={{ fontFamily:"var(--font-display)" }}>{value}</p>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5" style={{ fontFamily:"var(--font-display)" }}>{label}</p>
        <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }: { active?: boolean; payload?: {value:number;name:string}[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 border text-xs" style={{ background:"#1F2525",borderColor:"#2e3939" }}>
      {label && <p className="text-gray-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: CHART_COLORS[i] }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────

type ViewState = "idle" | "configuring" | "generating" | "preview";

export default function Reportes() {
  const [selectedId,  setSelectedId]  = useState<ReportId | null>(null);
  const [viewState,   setViewState]   = useState<ViewState>("idle");
  const [filters,     setFilters]     = useState<Record<string,string>>({});
  const [reportData,  setReportData]  = useState<ReturnType<typeof getReportData> | null>(null);

  const selectedDef = REPORTS.find((r) => r.id === selectedId) ?? null;

  const selectReport = useCallback((id: ReportId) => {
    setSelectedId(id);
    setViewState("configuring");
    setFilters({});
    setReportData(null);
  }, []);

  function handleGenerate() {
    if (!selectedId) return;
    setViewState("generating");
    setTimeout(() => {
      setReportData(getReportData(selectedId, filters));
      setViewState("preview");
    }, 1400);
  }

  function handleReset() {
    setViewState("configuring");
    setFilters({});
    setReportData(null);
  }

  function handlePrint() { window.print(); }

  const academico = REPORTS.filter((r) => r.category === "academico");
  const administrativo = REPORTS.filter((r) => r.category === "administrativo");

  const NOW_LABEL = "08/09/2026 — 10:43 a.m.";

  return (
    <div className="flex gap-4 h-full" style={{ minHeight:0 }}>

      {/* ── Left catalog panel ── */}
      <div className="flex flex-col flex-shrink-0 rounded-2xl border overflow-hidden" style={{ width:320,background:"#263030",borderColor:"#2e3939" }}>
        <div className="px-5 py-4 border-b flex-shrink-0" style={{ borderColor:"#2e3939" }}>
          <p className="text-sm font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>Centro de Reportes</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Selecciona un tipo de reporte</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Académicos */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-2 mb-2">Académicos</p>
            <div className="space-y-1">
              {academico.map((r) => {
                const Icon = r.icon;
                const active = selectedId === r.id;
                return (
                  <button key={r.id} onClick={() => selectReport(r.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all"
                    style={{
                      background: active ? `${r.color}15` : "transparent",
                      borderColor: active ? `${r.color}40` : "transparent",
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background:`${r.color}18` }}>
                      <Icon size={15} style={{ color:r.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-tight"
                        style={{ color: active ? r.color : "#D1D5DB", fontFamily:"var(--font-display)" }}>{r.label}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 truncate">{r.description}</p>
                    </div>
                    {active && <ChevronRight size={12} style={{ color:r.color }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Administrativos */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-2 mb-2">Administrativos</p>
            <div className="space-y-1">
              {administrativo.map((r) => {
                const Icon = r.icon;
                const active = selectedId === r.id;
                return (
                  <button key={r.id} onClick={() => selectReport(r.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all"
                    style={{
                      background: active ? `${r.color}15` : "transparent",
                      borderColor: active ? `${r.color}40` : "transparent",
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background:`${r.color}18` }}>
                      <Icon size={15} style={{ color:r.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-tight"
                        style={{ color: active ? r.color : "#D1D5DB", fontFamily:"var(--font-display)" }}>{r.label}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 truncate">{r.description}</p>
                    </div>
                    {active && <ChevronRight size={12} style={{ color:r.color }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 rounded-2xl border overflow-hidden flex flex-col" style={{ background:"#263030",borderColor:"#2e3939" }}>

        {/* Idle */}
        {viewState === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background:"#1F2525" }}>
              <BarChart2 size={28} className="text-gray-600" />
            </div>
            <p className="text-lg font-bold text-white mb-2" style={{ fontFamily:"var(--font-display)" }}>Selecciona un reporte</p>
            <p className="text-sm text-gray-500 max-w-xs">Elige una categoría del panel izquierdo para configurar y generar tu reporte institucional.</p>
          </div>
        )}

        {/* Configuring */}
        {(viewState === "configuring") && selectedDef && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b flex-shrink-0" style={{ borderColor:"#2e3939" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${selectedDef.color}18` }}>
                  <selectedDef.icon size={18} style={{ color:selectedDef.color }} />
                </div>
                <div>
                  <p className="text-base font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>Reporte: {selectedDef.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedDef.description}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex-1 overflow-y-auto px-7 py-6">
              <div className="flex items-center gap-2 mb-5">
                <Filter size={13} className="text-gray-500" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filtros del reporte</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                {selectedDef.filters.map((f) => (
                  <div key={f.id}>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                    {f.type === "select" ? (
                      <select value={filters[f.id] ?? ""} onChange={(e) => setFilters((prev) => ({ ...prev, [f.id]: e.target.value }))}
                        className="w-full rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none"
                        style={{ background:"#1F2525",border:"1px solid #2e3939" }}>
                        {!f.options?.[0].includes(f.label) && <option value="" style={{ background:"#1F2525" }}>Seleccionar...</option>}
                        {f.options?.map((o) => <option key={o} value={o} style={{ background:"#1F2525" }}>{o}</option>)}
                      </select>
                    ) : (
                      <input type="date" value={filters[f.id] ?? ""} onChange={(e) => setFilters((prev) => ({ ...prev, [f.id]: e.target.value }))}
                        className="w-full rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none"
                        style={{ background:"#1F2525",border:"1px solid #2e3939",colorScheme:"dark" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Divider + info */}
              <div className="mt-8 max-w-2xl rounded-xl border p-4 flex items-start gap-3" style={{ background:"#1F2525",borderColor:"#2e3939" }}>
                <AlertCircle size={15} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  El reporte se generará con los datos actualizados al <span className="text-gray-300">{NOW_LABEL}</span>.
                  Los filtros vacíos incluirán todos los registros disponibles.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-7 py-4 border-t flex-shrink-0" style={{ borderColor:"#2e3939" }}>
              <button onClick={handleGenerate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background:`linear-gradient(135deg,${selectedDef.color},#107A9F)`,fontFamily:"var(--font-display)" }}>
                <BarChart2 size={14} />Generar reporte
              </button>
            </div>
          </div>
        )}

        {/* Generating */}
        {viewState === "generating" && selectedDef && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-transparent"
                style={{ borderTopColor: selectedDef.color, animation:"spin 0.8s linear infinite" }} />
              <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background:`${selectedDef.color}15` }}>
                <selectedDef.icon size={16} style={{ color:selectedDef.color }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold" style={{ fontFamily:"var(--font-display)" }}>Generando reporte...</p>
              <p className="text-xs text-gray-500 mt-1">Procesando datos del sistema</p>
            </div>
          </div>
        )}

        {/* Preview */}
        {viewState === "preview" && selectedDef && reportData && (
          <div className="flex flex-col h-full">
            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-7 py-4 border-b flex-shrink-0" style={{ borderColor:"#2e3939" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:`${selectedDef.color}18` }}>
                  <selectedDef.icon size={15} style={{ color:selectedDef.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>Reporte de {selectedDef.label}</p>
                  <p className="text-[11px] text-gray-500">Generado: {NOW_LABEL}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
                  style={{ borderColor:"#2e3939",color:"#9CA3AF" }}>
                  <RefreshCw size={12} />Nuevo reporte
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:border-gray-500"
                  style={{ borderColor:"#2e3939",color:"#9CA3AF" }}>
                  <Printer size={12} />Imprimir
                </button>
                <button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                  style={{ background:`linear-gradient(135deg,${selectedDef.color},#107A9F)`,fontFamily:"var(--font-display)" }}>
                  <Download size={12} />Descargar PDF
                </button>
              </div>
            </div>

            {/* Preview document */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="rounded-2xl border overflow-hidden" style={{ background:"#1F2525",borderColor:"#2e3939" }}>
                {/* Document header */}
                <div className="px-8 py-6 border-b flex items-center justify-between" style={{ borderColor:"#2e3939",background:"#263030" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"#00ADEB" }}>
                      <GraduationCap size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>EduAdmin — Sistema Escolar</p>
                      <p className="text-[10px] text-gray-500">Generado el {NOW_LABEL} · Confidencial</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold" style={{ color:selectedDef.color,fontFamily:"var(--font-display)" }}>
                      Reporte de {selectedDef.label}
                    </p>
                    {Object.entries(filters).filter(([,v])=>v).length > 0 && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {Object.entries(filters).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-8 py-6 space-y-6">
                  {/* KPIs */}
                  <div className="grid grid-cols-4 gap-4">
                    {reportData.kpis.map((k, i) => <KpiCard key={i} {...k} />)}
                  </div>

                  {/* Chart + Table split */}
                  <div className={`grid gap-6 ${reportData.chartData.length > 0 ? "grid-cols-5" : "grid-cols-1"}`}>

                    {/* Chart */}
                    {reportData.chartData.length > 0 && (
                      <div className="col-span-2 rounded-xl border p-5" style={{ background:"#263030",borderColor:"#2e3939" }}>
                        <p className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                          {reportData.chartLabel}
                        </p>
                        {reportData.chartType === "bar" && (
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={reportData.chartData as Record<string,unknown>[]} barSize={20}>
                              <XAxis dataKey={Object.keys(reportData.chartData[0] as Record<string,unknown>).find(k=>k!==reportData.chartKey)} tick={{fontSize:10,fill:"#6B7280"}} axisLine={false} tickLine={false} />
                              <YAxis tick={{fontSize:10,fill:"#6B7280"}} axisLine={false} tickLine={false} width={28} />
                              <Tooltip content={<CUSTOM_TOOLTIP />} />
                              <Bar dataKey={reportData.chartKey} fill={selectedDef.color} radius={[4,4,0,0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                        {reportData.chartType === "line" && (
                          <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={reportData.chartData as Record<string,unknown>[]} >
                              <XAxis dataKey={Object.keys(reportData.chartData[0] as Record<string,unknown>).find(k=>k!==reportData.chartKey)} tick={{fontSize:10,fill:"#6B7280"}} axisLine={false} tickLine={false} />
                              <YAxis tick={{fontSize:10,fill:"#6B7280"}} axisLine={false} tickLine={false} width={40} />
                              <Tooltip content={<CUSTOM_TOOLTIP />} />
                              <Line type="monotone" dataKey={reportData.chartKey} stroke={selectedDef.color} strokeWidth={2} dot={{ fill:selectedDef.color,r:3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                        {reportData.chartType === "pie" && (
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie data={reportData.chartData} dataKey={reportData.chartKey} cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                                {reportData.chartData.map((entry: Record<string,unknown>, index: number) => (
                                  <Cell key={index} fill={(entry.fill as string) ?? CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<CUSTOM_TOOLTIP />} />
                              <Legend iconSize={8} iconType="circle" wrapperStyle={{fontSize:10,color:"#9CA3AF"}} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    )}

                    {/* Table */}
                    <div className={`${reportData.chartData.length > 0 ? "col-span-3" : "col-span-1"} rounded-xl border overflow-hidden`} style={{ borderColor:"#2e3939" }}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ background:"#2e3939" }}>
                            {reportData.columns.map((col: string) => (
                              <th key={col} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor:"#2e3939" }}>
                          {reportData.rows.map((row: unknown, i: number) => {
                            const cells = reportData.rowFn(row as never);
                            const bg = reportData.colorFn(row as never);
                            return (
                              <tr key={i} style={{ background: bg !== "transparent" ? bg : i%2===0?"#1F2525":"#1a2020" }}>
                                {cells.map((cell: unknown, j: number) => (
                                  <td key={j} className="px-4 py-2.5 text-gray-300 whitespace-nowrap">
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t text-[10px] text-gray-600" style={{ borderColor:"#2e3939" }}>
                    <span>EduAdmin · Sistema de Gestión Escolar · {NOW_LABEL}</span>
                    <span>Página 1 de 1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
