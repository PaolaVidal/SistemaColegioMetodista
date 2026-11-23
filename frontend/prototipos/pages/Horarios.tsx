import { useState, useMemo, useRef } from "react";
import {
  GraduationCap, Layers, User, BookOpen, Home, Clock,
  AlertTriangle, X, Plus, Edit3, Trash2, Save, RotateCcw,
  ChevronDown, Move,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const SLOTS = [
  { idx: 0,  label: "07:00–07:45" },
  { idx: 1,  label: "07:45–08:30" },
  { idx: 2,  label: "08:30–09:15" },
  { idx: 3,  label: "09:15–10:00" },
  { idx: 4,  label: "10:00–10:45" },
  { idx: 5,  label: "10:45–11:30" },
  { idx: 6,  label: "11:30–12:15" },
  { idx: 7,  label: "12:15–13:00" },
  { idx: 8,  label: "13:00–13:45" },
  { idx: 9,  label: "13:45–14:30" },
  { idx: 10, label: "14:30–15:15" },
  { idx: 11, label: "15:15–16:00" },
  { idx: 12, label: "16:00–16:45" },
];

const CONTENT_SLOTS = SLOTS;

const COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  "Matemáticas":          { bg: "#1E40AF18", text: "#60A5FA", dot: "#3B82F6", border: "#1E40AF40" },
  "Comunicación":         { bg: "#06520518", text: "#34D399", dot: "#10B981", border: "#06520540" },
  "Historia y Geografía": { bg: "#92400E18", text: "#FBBF24", dot: "#F59E0B", border: "#92400E40" },
  "Ciencias Naturales":   { bg: "#06424F18", text: "#22D3EE", dot: "#06B6D4", border: "#06424F40" },
  "Inglés":               { bg: "#4C1D9518", text: "#A78BFA", dot: "#8B5CF6", border: "#4C1D9540" },
  "Educación Física":     { bg: "#7C2D1218", text: "#FB923C", dot: "#F97316", border: "#7C2D1240" },
  "Arte y Cultura":       { bg: "#83184318", text: "#F472B6", dot: "#EC4899", border: "#83184340" },
  "Hora libre":           { bg: "#37415118", text: "#9CA3AF", dot: "#6B7280", border: "#37415140" },
};

const ASIGNATURAS = Object.keys(COLORS);

const DOCENTES: Record<string, string> = {
  "Matemáticas":          "Lic. Carlos Ríos",
  "Comunicación":         "Lic. María Soto",
  "Historia y Geografía": "Lic. Jorge Medina",
  "Ciencias Naturales":   "Lic. Rosa Chávez",
  "Inglés":               "Lic. Ana Torres",
  "Educación Física":     "Lic. Pedro Luna",
  "Arte y Cultura":       "Lic. Sandra Vega",
  "Hora libre":           "—",
};

const AULAS_DEFAULT: Record<string, string> = {
  "Matemáticas":          "Aula 101",
  "Comunicación":         "Aula 102",
  "Historia y Geografía": "Aula 103",
  "Ciencias Naturales":   "Lab. Ciencias",
  "Inglés":               "Aula 104",
  "Educación Física":     "Cancha",
  "Arte y Cultura":       "Taller Arte",
  "Hora libre":           "—",
};

const ALL_AULAS = ["Aula 101","Aula 102","Aula 103","Aula 104","Lab. Ciencias","Cancha","Taller Arte","Sala Cómputo"];
const GRADOS = ["1° Grado","2° Grado","3° Grado","4° Grado","5° Grado","6° Grado"];
const SECCIONES = ["A","B","C"];

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScheduleBlock {
  id: string;
  day: number;
  slotIdx: number;
  asignatura: string;
  docente: string;
  grado: string;
  seccion: string;
  aula: string;
}

interface Conflict {
  type: "docente" | "aula";
  day: number;
  slotIdx: number;
  blocks: ScheduleBlock[];
  message: string;
}

interface EvalBlock {
  id: string;
  slotIdx: number;
  asignatura: string;
  docente: string;
  grado: string;
  seccion: string;
  aula: string;
}

interface EvalConflict {
  type: "docente" | "aula";
  slotIdx: number;
  blocks: EvalBlock[];
  message: string;
}

interface EvaluationDay {
  date: string; // "YYYY-MM-DD"
  label: string;
  blocks: EvalBlock[];
}

// ─── Seed data ────────────────────────────────────────────────────────────────

let _sid = 1;
function mk(day: number, slotIdx: number, asig: string, grado: string, seccion: string): ScheduleBlock {
  return {
    id: `b${_sid++}`, day, slotIdx, asignatura: asig,
    docente: DOCENTES[asig], grado, seccion, aula: AULAS_DEFAULT[asig],
  };
}

// 3° A — full week (13 slots/day, 07:00–16:45)
const S3A: ScheduleBlock[] = [
  // Monday
  mk(0,0,"Matemáticas","3° Grado","A"),   mk(0,1,"Comunicación","3° Grado","A"),
  mk(0,2,"Ciencias Naturales","3° Grado","A"), mk(0,3,"Historia y Geografía","3° Grado","A"),
  mk(0,4,"Inglés","3° Grado","A"),        mk(0,5,"Educación Física","3° Grado","A"),
  mk(0,6,"Arte y Cultura","3° Grado","A"), mk(0,7,"Matemáticas","3° Grado","A"),
  mk(0,8,"Hora libre","3° Grado","A"),    mk(0,9,"Historia y Geografía","3° Grado","A"),
  mk(0,10,"Comunicación","3° Grado","A"), mk(0,11,"Matemáticas","3° Grado","A"),
  mk(0,12,"Hora libre","3° Grado","A"),
  // Tuesday
  mk(1,0,"Comunicación","3° Grado","A"),  mk(1,1,"Matemáticas","3° Grado","A"),
  mk(1,2,"Inglés","3° Grado","A"),        mk(1,3,"Ciencias Naturales","3° Grado","A"),
  mk(1,4,"Historia y Geografía","3° Grado","A"), mk(1,5,"Arte y Cultura","3° Grado","A"),
  mk(1,6,"Matemáticas","3° Grado","A"),   mk(1,7,"Comunicación","3° Grado","A"),
  mk(1,8,"Ciencias Naturales","3° Grado","A"), mk(1,9,"Hora libre","3° Grado","A"),
  mk(1,10,"Inglés","3° Grado","A"),       mk(1,11,"Arte y Cultura","3° Grado","A"),
  mk(1,12,"Matemáticas","3° Grado","A"),
  // Wednesday
  mk(2,0,"Historia y Geografía","3° Grado","A"), mk(2,1,"Inglés","3° Grado","A"),
  mk(2,2,"Matemáticas","3° Grado","A"),   mk(2,3,"Comunicación","3° Grado","A"),
  mk(2,4,"Ciencias Naturales","3° Grado","A"), mk(2,5,"Matemáticas","3° Grado","A"),
  mk(2,6,"Inglés","3° Grado","A"),        mk(2,7,"Educación Física","3° Grado","A"),
  mk(2,8,"Arte y Cultura","3° Grado","A"), mk(2,9,"Comunicación","3° Grado","A"),
  mk(2,10,"Hora libre","3° Grado","A"),   mk(2,11,"Historia y Geografía","3° Grado","A"),
  mk(2,12,"Ciencias Naturales","3° Grado","A"),
  // Thursday
  mk(3,0,"Educación Física","3° Grado","A"), mk(3,1,"Arte y Cultura","3° Grado","A"),
  mk(3,2,"Comunicación","3° Grado","A"),  mk(3,3,"Matemáticas","3° Grado","A"),
  mk(3,4,"Ciencias Naturales","3° Grado","A"), mk(3,5,"Historia y Geografía","3° Grado","A"),
  mk(3,6,"Comunicación","3° Grado","A"),  mk(3,7,"Inglés","3° Grado","A"),
  mk(3,8,"Matemáticas","3° Grado","A"),   mk(3,9,"Arte y Cultura","3° Grado","A"),
  mk(3,10,"Inglés","3° Grado","A"),       mk(3,11,"Hora libre","3° Grado","A"),
  mk(3,12,"Comunicación","3° Grado","A"),
  // Friday
  mk(4,0,"Matemáticas","3° Grado","A"),   mk(4,1,"Historia y Geografía","3° Grado","A"),
  mk(4,2,"Educación Física","3° Grado","A"), mk(4,3,"Arte y Cultura","3° Grado","A"),
  mk(4,4,"Comunicación","3° Grado","A"),  mk(4,5,"Ciencias Naturales","3° Grado","A"),
  mk(4,6,"Matemáticas","3° Grado","A"),   mk(4,7,"Historia y Geografía","3° Grado","A"),
  mk(4,8,"Inglés","3° Grado","A"),        mk(4,9,"Comunicación","3° Grado","A"),
  mk(4,10,"Arte y Cultura","3° Grado","A"), mk(4,11,"Matemáticas","3° Grado","A"),
  mk(4,12,"Hora libre","3° Grado","A"),
];

// 3° B — staggered to avoid teacher clashes
const S3B: ScheduleBlock[] = [
  // Monday
  mk(0,0,"Comunicación","3° Grado","B"),  mk(0,1,"Matemáticas","3° Grado","B"),
  mk(0,2,"Historia y Geografía","3° Grado","B"), mk(0,3,"Ciencias Naturales","3° Grado","B"),
  mk(0,4,"Arte y Cultura","3° Grado","B"), mk(0,5,"Inglés","3° Grado","B"),
  mk(0,6,"Educación Física","3° Grado","B"), mk(0,7,"Comunicación","3° Grado","B"),
  mk(0,8,"Matemáticas","3° Grado","B"),   mk(0,9,"Ciencias Naturales","3° Grado","B"),
  mk(0,10,"Historia y Geografía","3° Grado","B"), mk(0,11,"Arte y Cultura","3° Grado","B"),
  mk(0,12,"Inglés","3° Grado","B"),
  // Tuesday
  mk(1,0,"Matemáticas","3° Grado","B"),   mk(1,1,"Ciencias Naturales","3° Grado","B"),
  mk(1,2,"Comunicación","3° Grado","B"),  mk(1,3,"Inglés","3° Grado","B"),
  mk(1,4,"Matemáticas","3° Grado","B"),   mk(1,5,"Historia y Geografía","3° Grado","B"),
  mk(1,6,"Arte y Cultura","3° Grado","B"), mk(1,7,"Matemáticas","3° Grado","B"),
  mk(1,8,"Hora libre","3° Grado","B"),    mk(1,9,"Comunicación","3° Grado","B"),
  mk(1,10,"Ciencias Naturales","3° Grado","B"), mk(1,11,"Inglés","3° Grado","B"),
  mk(1,12,"Historia y Geografía","3° Grado","B"),
  // Wednesday
  mk(2,0,"Inglés","3° Grado","B"),        mk(2,1,"Historia y Geografía","3° Grado","B"),
  mk(2,2,"Comunicación","3° Grado","B"),  mk(2,3,"Matemáticas","3° Grado","B"),
  mk(2,4,"Educación Física","3° Grado","B"), mk(2,5,"Comunicación","3° Grado","B"),
  mk(2,6,"Ciencias Naturales","3° Grado","B"), mk(2,7,"Inglés","3° Grado","B"),
  mk(2,8,"Matemáticas","3° Grado","B"),   mk(2,9,"Arte y Cultura","3° Grado","B"),
  mk(2,10,"Comunicación","3° Grado","B"), mk(2,11,"Hora libre","3° Grado","B"),
  mk(2,12,"Matemáticas","3° Grado","B"),
  // Thursday
  mk(3,0,"Arte y Cultura","3° Grado","B"), mk(3,1,"Comunicación","3° Grado","B"),
  mk(3,2,"Matemáticas","3° Grado","B"),   mk(3,3,"Educación Física","3° Grado","B"),
  mk(3,4,"Inglés","3° Grado","B"),        mk(3,5,"Comunicación","3° Grado","B"),
  mk(3,6,"Historia y Geografía","3° Grado","B"), mk(3,7,"Ciencias Naturales","3° Grado","B"),
  mk(3,8,"Arte y Cultura","3° Grado","B"), mk(3,9,"Matemáticas","3° Grado","B"),
  mk(3,10,"Comunicación","3° Grado","B"), mk(3,11,"Inglés","3° Grado","B"),
  mk(3,12,"Hora libre","3° Grado","B"),
  // Friday
  mk(4,0,"Historia y Geografía","3° Grado","B"), mk(4,1,"Arte y Cultura","3° Grado","B"),
  mk(4,2,"Matemáticas","3° Grado","B"),   mk(4,3,"Comunicación","3° Grado","B"),
  mk(4,4,"Ciencias Naturales","3° Grado","B"), mk(4,5,"Matemáticas","3° Grado","B"),
  mk(4,6,"Inglés","3° Grado","B"),        mk(4,7,"Arte y Cultura","3° Grado","B"),
  mk(4,8,"Comunicación","3° Grado","B"),  mk(4,9,"Historia y Geografía","3° Grado","B"),
  mk(4,10,"Hora libre","3° Grado","B"),   mk(4,11,"Ciencias Naturales","3° Grado","B"),
  mk(4,12,"Matemáticas","3° Grado","B"),
];

// 1° A — shares some teacher slots with 3B to demo conflicts
const S1A: ScheduleBlock[] = [
  // Monday
  mk(0,0,"Comunicación","1° Grado","A"),  mk(0,1,"Matemáticas","1° Grado","A"),
  mk(0,2,"Ciencias Naturales","1° Grado","A"), mk(0,3,"Arte y Cultura","1° Grado","A"),
  mk(0,4,"Educación Física","1° Grado","A"), mk(0,5,"Comunicación","1° Grado","A"),
  mk(0,6,"Matemáticas","1° Grado","A"),   mk(0,7,"Comunicación","1° Grado","A"),
  mk(0,8,"Arte y Cultura","1° Grado","A"), mk(0,9,"Matemáticas","1° Grado","A"),
  mk(0,10,"Ciencias Naturales","1° Grado","A"), mk(0,11,"Comunicación","1° Grado","A"),
  mk(0,12,"Hora libre","1° Grado","A"),
  // Tuesday
  mk(1,0,"Matemáticas","1° Grado","A"),   mk(1,1,"Comunicación","1° Grado","A"),
  mk(1,2,"Arte y Cultura","1° Grado","A"), mk(1,3,"Matemáticas","1° Grado","A"),
  mk(1,4,"Ciencias Naturales","1° Grado","A"), mk(1,5,"Arte y Cultura","1° Grado","A"),
  mk(1,6,"Comunicación","1° Grado","A"),  mk(1,7,"Matemáticas","1° Grado","A"),
  mk(1,8,"Educación Física","1° Grado","A"), mk(1,9,"Arte y Cultura","1° Grado","A"),
  mk(1,10,"Matemáticas","1° Grado","A"),  mk(1,11,"Comunicación","1° Grado","A"),
  mk(1,12,"Hora libre","1° Grado","A"),
  // Wednesday
  mk(2,0,"Educación Física","1° Grado","A"), mk(2,1,"Comunicación","1° Grado","A"),
  mk(2,2,"Matemáticas","1° Grado","A"),   mk(2,3,"Ciencias Naturales","1° Grado","A"),
  mk(2,4,"Comunicación","1° Grado","A"),  mk(2,5,"Matemáticas","1° Grado","A"),
  mk(2,6,"Arte y Cultura","1° Grado","A"), mk(2,7,"Ciencias Naturales","1° Grado","A"),
  mk(2,8,"Comunicación","1° Grado","A"),  mk(2,9,"Hora libre","1° Grado","A"),
  mk(2,10,"Matemáticas","1° Grado","A"),  mk(2,11,"Arte y Cultura","1° Grado","A"),
  mk(2,12,"Ciencias Naturales","1° Grado","A"),
  // Thursday
  mk(3,0,"Ciencias Naturales","1° Grado","A"), mk(3,1,"Arte y Cultura","1° Grado","A"),
  mk(3,2,"Comunicación","1° Grado","A"),  mk(3,3,"Matemáticas","1° Grado","A"),
  mk(3,4,"Educación Física","1° Grado","A"), mk(3,5,"Ciencias Naturales","1° Grado","A"),
  mk(3,6,"Matemáticas","1° Grado","A"),   mk(3,7,"Comunicación","1° Grado","A"),
  mk(3,8,"Arte y Cultura","1° Grado","A"), mk(3,9,"Matemáticas","1° Grado","A"),
  mk(3,10,"Comunicación","1° Grado","A"), mk(3,11,"Hora libre","1° Grado","A"),
  mk(3,12,"Arte y Cultura","1° Grado","A"),
  // Friday
  mk(4,0,"Arte y Cultura","1° Grado","A"), mk(4,1,"Matemáticas","1° Grado","A"),
  mk(4,2,"Comunicación","1° Grado","A"),  mk(4,3,"Educación Física","1° Grado","A"),
  mk(4,4,"Matemáticas","1° Grado","A"),   mk(4,5,"Comunicación","1° Grado","A"),
  mk(4,6,"Ciencias Naturales","1° Grado","A"), mk(4,7,"Arte y Cultura","1° Grado","A"),
  mk(4,8,"Matemáticas","1° Grado","A"),   mk(4,9,"Comunicación","1° Grado","A"),
  mk(4,10,"Arte y Cultura","1° Grado","A"), mk(4,11,"Ciencias Naturales","1° Grado","A"),
  mk(4,12,"Hora libre","1° Grado","A"),
];

const INITIAL_BLOCKS: ScheduleBlock[] = [...S3A, ...S3B, ...S1A];

// ─── Evaluation seed data ─────────────────────────────────────────────────────

let _eid = 1;
function mke(slotIdx: number, asig: string, grado: string, seccion: string, aula?: string): EvalBlock {
  return { id: `e${_eid++}`, slotIdx, asignatura: asig, docente: DOCENTES[asig], grado, seccion, aula: aula ?? AULAS_DEFAULT[asig] };
}

const INITIAL_EVAL_DAYS: EvaluationDay[] = [
  {
    date: "2026-09-28",
    label: "Evaluaciones I Bimestre",
    blocks: [
      // 3° A — morning evaluations
      mke(0,"Matemáticas","3° Grado","A"),
      mke(2,"Comunicación","3° Grado","A"),
      mke(4,"Historia y Geografía","3° Grado","A"),
      mke(6,"Ciencias Naturales","3° Grado","A"),
      mke(8,"Inglés","3° Grado","A","Aula 104"),
      // 3° B — staggered so docentes don't clash
      mke(1,"Matemáticas","3° Grado","B","Aula 101"),
      mke(3,"Comunicación","3° Grado","B","Aula 102"),
      mke(5,"Historia y Geografía","3° Grado","B","Aula 103"),
      mke(7,"Ciencias Naturales","3° Grado","B","Lab. Ciencias"),
      mke(9,"Inglés","3° Grado","B","Aula 104"),
      // 1° A
      mke(0,"Comunicación","1° Grado","A","Aula 102"),
      mke(2,"Matemáticas","1° Grado","A","Aula 101"),
      mke(4,"Ciencias Naturales","1° Grado","A","Lab. Ciencias"),
    ],
  },
  {
    date: "2026-10-19",
    label: "Evaluaciones II Bimestre",
    blocks: [
      mke(0,"Ciencias Naturales","3° Grado","A"),
      mke(2,"Inglés","3° Grado","A"),
      mke(4,"Educación Física","3° Grado","A","Cancha"),
      mke(6,"Arte y Cultura","3° Grado","A","Taller Arte"),
      mke(1,"Ciencias Naturales","3° Grado","B"),
      mke(3,"Inglés","3° Grado","B"),
      mke(5,"Arte y Cultura","3° Grado","B","Taller Arte"),
      // deliberate conflict: same teacher same slot
      mke(4,"Educación Física","3° Grado","B","Cancha"),
    ],
  },
  {
    date: "2026-11-23",
    label: "Evaluaciones III Bimestre",
    blocks: [
      mke(0,"Matemáticas","3° Grado","A"),
      mke(3,"Comunicación","3° Grado","A"),
      mke(6,"Historia y Geografía","3° Grado","A"),
      mke(9,"Ciencias Naturales","3° Grado","A"),
      mke(1,"Matemáticas","3° Grado","B"),
      mke(4,"Comunicación","3° Grado","B"),
      mke(7,"Historia y Geografía","3° Grado","B"),
      mke(10,"Inglés","3° Grado","B"),
    ],
  },
];

// ─── Conflict detection ───────────────────────────────────────────────────────

function detectConflicts(blocks: ScheduleBlock[]): Conflict[] {
  const result: Conflict[] = [];
  const bySlot: Record<string, ScheduleBlock[]> = {};
  for (const b of blocks) {
    const key = `${b.day}|${b.slotIdx}`;
    (bySlot[key] = bySlot[key] ?? []).push(b);
  }
  for (const [key, slotBlocks] of Object.entries(bySlot)) {
    if (slotBlocks.length < 2) continue;
    const [day, slotIdx] = key.split("|").map(Number);
    const byDocente: Record<string, ScheduleBlock[]> = {};
    const byAula: Record<string, ScheduleBlock[]> = {};
    for (const b of slotBlocks) {
      if (b.asignatura === "Hora libre") continue;
      (byDocente[b.docente] = byDocente[b.docente] ?? []).push(b);
      (byAula[b.aula]       = byAula[b.aula]       ?? []).push(b);
    }
    for (const [doc, bs] of Object.entries(byDocente)) {
      if (bs.length > 1)
        result.push({ type: "docente", day, slotIdx, blocks: bs, message: `${doc} tiene ${bs.length} clases simultáneas` });
    }
    for (const [aula, bs] of Object.entries(byAula)) {
      if (bs.length > 1)
        result.push({ type: "aula", day, slotIdx, blocks: bs, message: `${aula} ocupada por ${bs.length} clases al mismo tiempo` });
    }
  }
  return result;
}

function detectEvalConflicts(blocks: EvalBlock[]): EvalConflict[] {
  const result: EvalConflict[] = [];
  const bySlot: Record<number, EvalBlock[]> = {};
  for (const b of blocks) {
    if (b.asignatura === "Hora libre") continue;
    (bySlot[b.slotIdx] = bySlot[b.slotIdx] ?? []).push(b);
  }
  for (const [slotIdx, slotBlocks] of Object.entries(bySlot)) {
    if (slotBlocks.length < 2) continue;
    const s = Number(slotIdx);
    const byDocente: Record<string, EvalBlock[]> = {};
    const byAula: Record<string, EvalBlock[]> = {};
    for (const b of slotBlocks) {
      (byDocente[b.docente] = byDocente[b.docente] ?? []).push(b);
      (byAula[b.aula]       = byAula[b.aula]       ?? []).push(b);
    }
    for (const [doc, bs] of Object.entries(byDocente))
      if (bs.length > 1) result.push({ type: "docente", slotIdx: s, blocks: bs, message: `${doc} supervisa ${bs.length} evaluaciones simultáneas` });
    for (const [aula, bs] of Object.entries(byAula))
      if (bs.length > 1) result.push({ type: "aula", slotIdx: s, blocks: bs, message: `${aula} tiene ${bs.length} evaluaciones al mismo tiempo` });
  }
  return result;
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ block, onSave, onDelete, onClose }: {
  block: ScheduleBlock;
  onSave: (b: ScheduleBlock) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...block });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }}>
      <div className="w-96 rounded-2xl border overflow-hidden shadow-2xl" style={{ background: "#1F2525", borderColor: "#2e3939" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#2e3939" }}>
          <p className="font-bold text-white text-sm" style={{ fontFamily: "var(--font-display)" }}>Editar bloque</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#2e3939] text-gray-400 transition-colors"><X size={14} /></button>
        </div>
        <div className="p-5 space-y-3">
          {/* Subject */}
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Asignatura</label>
            <select value={form.asignatura}
              onChange={(e) => setForm({ ...form, asignatura: e.target.value, docente: DOCENTES[e.target.value] ?? form.docente, aula: AULAS_DEFAULT[e.target.value] ?? form.aula })}
              className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none"
              style={{ background: "#263030", border: "1px solid #2e3939" }}>
              {ASIGNATURAS.map((a) => <option key={a} value={a} style={{ background: "#1F2525" }}>{a}</option>)}
            </select>
          </div>
          {/* Docente */}
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Docente</label>
            <input value={form.docente} onChange={(e) => setForm({ ...form, docente: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none"
              style={{ background: "#263030", border: "1px solid #2e3939" }} />
          </div>
          {/* Aula */}
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Aula</label>
            <select value={form.aula} onChange={(e) => setForm({ ...form, aula: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none"
              style={{ background: "#263030", border: "1px solid #2e3939" }}>
              {ALL_AULAS.map((a) => <option key={a} value={a} style={{ background: "#1F2525" }}>{a}</option>)}
            </select>
          </div>
          {/* Info row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2.5" style={{ background: "#263030", border: "1px solid #2e3939" }}>
              <p className="text-[10px] text-gray-500">Día</p>
              <p className="text-xs text-white font-semibold mt-0.5">{DAYS[form.day]}</p>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: "#263030", border: "1px solid #2e3939" }}>
              <p className="text-[10px] text-gray-500">Hora</p>
              <p className="text-xs text-white font-semibold mt-0.5">{CONTENT_SLOTS.find((s) => s.idx === form.slotIdx)?.label ?? "—"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-5 pb-5 gap-2">
          <button onClick={() => { onDelete(block.id); onClose(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "#EF444415", color: "#EF4444", border: "1px solid #EF444430" }}>
            <Trash2 size={12} />Eliminar
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white border transition-colors"
              style={{ borderColor: "#2e3939" }}>Cancelar</button>
            <button onClick={() => { onSave(form); onClose(); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
              <Save size={12} />Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Palette chip ─────────────────────────────────────────────────────────────

function PaletteChip({ asig, onDragStart }: { asig: string; onDragStart: () => void }) {
  const c = COLORS[asig];
  return (
    <div draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2 p-2.5 rounded-xl border cursor-grab active:cursor-grabbing select-none transition-all hover:scale-[1.02]"
      style={{ background: c.bg, borderColor: c.border }}>
      <Move size={11} style={{ color: c.text, opacity: 0.7 }} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold leading-tight truncate" style={{ color: c.text, fontFamily: "var(--font-display)" }}>{asig}</p>
        {asig !== "Hora libre" && (
        <p className="text-[10px] leading-tight truncate" style={{ color: c.text, opacity: 0.7 }}>{DOCENTES[asig]}</p>
      )}
      </div>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.dot }} />
    </div>
  );
}

// ─── Block card ───────────────────────────────────────────────────────────────

function BlockCard({ block, editMode, isConflict, isDragging, onEdit, onDragStart, docenteView }: {
  block: ScheduleBlock; editMode: boolean; isConflict: boolean;
  isDragging: boolean; onEdit: () => void; onDragStart: () => void; docenteView: boolean;
}) {
  const c = COLORS[block.asignatura];
  return (
    <div draggable={editMode} onDragStart={onDragStart}
      onClick={() => editMode && onEdit()}
      className="w-full h-full rounded-lg p-2 flex flex-col gap-0.5 transition-all select-none overflow-hidden group relative"
      style={{
        background: c.bg,
        border: `1px solid ${isConflict ? "#EF4444" : c.border}`,
        cursor: editMode ? "grab" : "default",
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isConflict ? "0 0 0 2px #EF444430" : undefined,
      }}>
      {isConflict && (
        <span className="absolute top-1 right-1">
          <AlertTriangle size={10} style={{ color: "#EF4444" }} />
        </span>
      )}
      <p className="text-[11px] font-bold leading-tight truncate pr-3" style={{ color: c.text, fontFamily: "var(--font-display)" }}>
        {block.asignatura}
      </p>
      {block.asignatura !== "Hora libre" && (
        <p className="text-[10px] leading-tight truncate" style={{ color: c.text, opacity: 0.75 }}>
          {block.docente.replace("Lic. ", "")}
        </p>
      )}
      {docenteView && (
        <p className="text-[10px] font-semibold leading-tight" style={{ color: c.dot }}>
          {block.grado.slice(0,1)}° {block.seccion}
        </p>
      )}
      <div className="flex items-center gap-1 mt-auto">
        <Home size={8} style={{ color: c.text, opacity: 0.55 }} />
        <p className="text-[9px] truncate" style={{ color: c.text, opacity: 0.55 }}>{block.aula}</p>
      </div>
      {editMode && (
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "#1F252580" }}>
          <Edit3 size={10} style={{ color: c.text }} />
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Horarios() {
  // ── Tab ──
  const [activeTab, setActiveTab] = useState<"horario" | "evaluaciones">("horario");

  // ── Horario semanal state ──
  const [filterGrado,   setFilterGrado]   = useState("3° Grado");
  const [filterSeccion, setFilterSeccion] = useState("A");
  const [filterDocente, setFilterDocente] = useState("");
  const [viewMode,      setViewMode]      = useState<"seccion" | "docente">("seccion");
  const [editMode,      setEditMode]      = useState(false);
  const [allBlocks,     setAllBlocks]     = useState<ScheduleBlock[]>(INITIAL_BLOCKS);
  const [editSnapshot,  setEditSnapshot]  = useState<ScheduleBlock[]>([]);
  const [editModal,     setEditModal]     = useState<ScheduleBlock | null>(null);
  const [dragOver,      setDragOver]      = useState<{ day: number; slotIdx: number } | null>(null);
  const [draggingId,    setDraggingId]    = useState<string | null>(null);
  const [showConflicts, setShowConflicts] = useState(true);

  // ── Evaluaciones state ──
  const [evalDays,         setEvalDays]         = useState<EvaluationDay[]>(INITIAL_EVAL_DAYS);
  const [selectedEvalDate, setSelectedEvalDate] = useState<string>(INITIAL_EVAL_DAYS[0].date);
  const [newDateInput,     setNewDateInput]      = useState("");
  const [newDateLabel,     setNewDateLabel]      = useState("");
  const [evalEditMode,     setEvalEditMode]      = useState(false);
  const [evalDragOver,     setEvalDragOver]      = useState<{ slotIdx: number; seccion: string } | null>(null);
  const [evalDraggingId,   setEvalDraggingId]    = useState<string | null>(null);
  const [evalEditModal,    setEvalEditModal]      = useState<EvalBlock | null>(null);
  const [evalFilterGrado,  setEvalFilterGrado]   = useState("3° Grado");
  const [showEvalConflicts,setShowEvalConflicts] = useState(true);

  const nextId = useRef(5000);
  const evalNextId = useRef(9000);
  const dragSource = useRef<{ type: "palette" | "block"; asignatura: string; blockId?: string } | null>(null);
  const evalDragSource = useRef<{ type: "palette" | "block"; asignatura: string; blockId?: string } | null>(null);

  const conflicts = useMemo(() => detectConflicts(allBlocks), [allBlocks]);

  // Conflict lookup set: "day|slotIdx|blockId"
  const conflictIds = useMemo(() => {
    const s = new Set<string>();
    for (const c of conflicts) for (const b of c.blocks) s.add(b.id);
    return s;
  }, [conflicts]);

  // ── Eval computed ──
  const currentEvalDay = useMemo(
    () => evalDays.find((d) => d.date === selectedEvalDate) ?? null,
    [evalDays, selectedEvalDate]
  );
  const evalBlocks = currentEvalDay?.blocks ?? [];
  const evalConflicts = useMemo(() => detectEvalConflicts(evalBlocks), [evalBlocks]);
  const evalConflictIds = useMemo(() => {
    const s = new Set<string>();
    for (const c of evalConflicts) for (const b of c.blocks) s.add(b.id);
    return s;
  }, [evalConflicts]);
  // eval block lookup: slotIdx → seccion → EvalBlock
  const evalBlockMap = useMemo(() => {
    const m: Record<number, Record<string, EvalBlock>> = {};
    for (const b of evalBlocks.filter((b) => b.grado === evalFilterGrado)) {
      (m[b.slotIdx] = m[b.slotIdx] ?? {})[b.seccion] = b;
    }
    return m;
  }, [evalBlocks, evalFilterGrado]);

  // ── Eval handlers ──
  function addEvalDay() {
    if (!newDateInput) return;
    if (evalDays.find((d) => d.date === newDateInput)) { setSelectedEvalDate(newDateInput); return; }
    const label = newDateLabel.trim() || "Día de evaluaciones";
    setEvalDays((prev) => [...prev, { date: newDateInput, label, blocks: [] }]);
    setSelectedEvalDate(newDateInput);
    setNewDateInput("");
    setNewDateLabel("");
  }

  function removeEvalDay(date: string) {
    setEvalDays((prev) => prev.filter((d) => d.date !== date));
    setSelectedEvalDate((cur) => cur === date ? (evalDays.find((d) => d.date !== date)?.date ?? "") : cur);
  }

  function handleEvalDrop(slotIdx: number, seccion: string) {
    setEvalDragOver(null);
    const src = evalDragSource.current;
    evalDragSource.current = null;
    if (!src || !selectedEvalDate) return;

    setEvalDays((prev) => prev.map((day) => {
      if (day.date !== selectedEvalDate) return day;
      const blocks = [...day.blocks];
      if (src.type === "palette") {
        const removeIdx = blocks.findIndex((b) => b.slotIdx === slotIdx && b.grado === evalFilterGrado && b.seccion === seccion);
        if (removeIdx !== -1) blocks.splice(removeIdx, 1);
        const asig = src.asignatura;
        blocks.push({ id: `e${evalNextId.current++}`, slotIdx, asignatura: asig, docente: DOCENTES[asig], grado: evalFilterGrado, seccion, aula: AULAS_DEFAULT[asig] });
      } else {
        const blockId = src.blockId!;
        const srcIdx  = blocks.findIndex((b) => b.id === blockId);
        if (srcIdx === -1) return day;
        const srcBlock = blocks[srcIdx];
        const tgtIdx = blocks.findIndex((b) => b.slotIdx === slotIdx && b.grado === srcBlock.grado && b.seccion === seccion);
        if (tgtIdx !== -1 && tgtIdx !== srcIdx) {
          const tgt = blocks[tgtIdx];
          blocks[tgtIdx] = { ...srcBlock, slotIdx: tgt.slotIdx, seccion: tgt.seccion };
          blocks[srcIdx] = { ...tgt,      slotIdx: srcBlock.slotIdx, seccion: srcBlock.seccion };
        } else {
          blocks[srcIdx] = { ...srcBlock, slotIdx, seccion };
        }
      }
      return { ...day, blocks };
    }));
    setEvalDraggingId(null);
  }

  function evalSaveBlock(updated: EvalBlock) {
    setEvalDays((prev) => prev.map((d) =>
      d.date !== selectedEvalDate ? d : { ...d, blocks: d.blocks.map((b) => b.id === updated.id ? updated : b) }
    ));
  }

  function evalDeleteBlock(id: string) {
    setEvalDays((prev) => prev.map((d) =>
      d.date !== selectedEvalDate ? d : { ...d, blocks: d.blocks.filter((b) => b.id !== id) }
    ));
  }

  function evalAddEmpty(slotIdx: number, seccion: string) {
    if (!selectedEvalDate) return;
    const existing = evalBlocks.find((b) => b.slotIdx === slotIdx && b.grado === evalFilterGrado && b.seccion === seccion);
    if (existing) return;
    const asig = "Matemáticas";
    const nb: EvalBlock = { id: `e${evalNextId.current++}`, slotIdx, asignatura: asig, docente: DOCENTES[asig], grado: evalFilterGrado, seccion, aula: AULAS_DEFAULT[asig] };
    setEvalDays((prev) => prev.map((d) => d.date !== selectedEvalDate ? d : { ...d, blocks: [...d.blocks, nb] }));
    setEvalEditModal(nb);
  }

  function formatDate(iso: string) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d} ${months[Number(m)-1]} ${y}`;
  }

  // ── Visible blocks for the grid ──
  const visibleBlocks = useMemo((): ScheduleBlock[] => {
    if (viewMode === "docente" && filterDocente)
      return allBlocks.filter((b) => b.docente === filterDocente);
    return allBlocks.filter((b) => b.grado === filterGrado && b.seccion === filterSeccion);
  }, [allBlocks, viewMode, filterGrado, filterSeccion, filterDocente]);

  // Block lookup: day → slotIdx → block[]
  const blockMap = useMemo(() => {
    const m: Record<number, Record<number, ScheduleBlock[]>> = {};
    for (const b of visibleBlocks) {
      (m[b.day] = m[b.day] ?? {});
      (m[b.day][b.slotIdx] = m[b.day][b.slotIdx] ?? []).push(b);
    }
    return m;
  }, [visibleBlocks]);

  function enterEdit() {
    setEditSnapshot([...allBlocks]);
    setEditMode(true);
  }

  function cancelEdit() {
    setAllBlocks(editSnapshot);
    setEditMode(false);
  }

  function saveEdit() {
    setEditMode(false);
  }

  function handleDrop(day: number, slotIdx: number) {
    setDragOver(null);
    const src = dragSource.current;
    dragSource.current = null;
    if (!src) return;

    setAllBlocks((prev) => {
      const next = [...prev];
      if (src.type === "palette") {
        const removeIdx = next.findIndex(
          (b) => b.day === day && b.slotIdx === slotIdx && b.grado === filterGrado && b.seccion === filterSeccion
        );
        if (removeIdx !== -1) next.splice(removeIdx, 1);
        const asig = src.asignatura;
        next.push({
          id: `b${nextId.current++}`, day, slotIdx, asignatura: asig,
          docente: DOCENTES[asig], grado: filterGrado, seccion: filterSeccion, aula: AULAS_DEFAULT[asig],
        });
      } else {
        const blockId = src.blockId!;
        const srcIdx  = next.findIndex((b) => b.id === blockId);
        if (srcIdx === -1) return prev;
        const srcBlock = next[srcIdx];
        const tgtIdx = next.findIndex(
          (b) => b.day === day && b.slotIdx === slotIdx && b.grado === srcBlock.grado && b.seccion === srcBlock.seccion
        );
        if (tgtIdx !== -1 && tgtIdx !== srcIdx) {
          const tgt = next[tgtIdx];
          next[tgtIdx] = { ...srcBlock, day: tgt.day, slotIdx: tgt.slotIdx };
          next[srcIdx] = { ...tgt,      day: srcBlock.day, slotIdx: srcBlock.slotIdx };
        } else {
          next[srcIdx] = { ...srcBlock, day, slotIdx };
        }
      }
      return next;
    });
    setDraggingId(null);
  }

  function handleBlockSave(updated: ScheduleBlock) {
    setAllBlocks((prev) => prev.map((b) => b.id === updated.id ? updated : b));
  }

  function handleBlockDelete(id: string) {
    setAllBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function addEmptyBlock(day: number, slotIdx: number) {
    const existing = allBlocks.find(
      (b) => b.day === day && b.slotIdx === slotIdx && b.grado === filterGrado && b.seccion === filterSeccion
    );
    if (existing) return;
    const asig = "Matemáticas";
    const newBlock: ScheduleBlock = {
      id: `b${nextId.current++}`, day, slotIdx, asignatura: asig,
      docente: DOCENTES[asig], grado: filterGrado, seccion: filterSeccion, aula: AULAS_DEFAULT[asig],
    };
    setAllBlocks((prev) => [...prev, newBlock]);
    setEditModal(newBlock);
  }

  const allDocentes = Object.values(DOCENTES);
  const docenteView = viewMode === "docente" && !!filterDocente;

  // Stats
  const sectionBlocks = allBlocks.filter((b) => b.grado === filterGrado && b.seccion === filterSeccion);
  const totalSlots = SLOTS.length * DAYS.length;
  const filledSlots = new Set(sectionBlocks.map((b) => `${b.day}|${b.slotIdx}`)).size;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ── Global tab bar ── */}
      <div className="flex items-center gap-1 rounded-xl border p-1 self-start" style={{ background: "#1F2525", borderColor: "#2e3939" }}>
        {([
          { key: "horario",       label: "Horario semanal",  icon: "📅" },
          { key: "evaluaciones",  label: "Evaluaciones",     icon: "📝" },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === t.key ? "#00ADEB" : "transparent",
              color: activeTab === t.key ? "#fff" : "#6B7280",
              fontFamily: "var(--font-display)",
            }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {activeTab === "evaluaciones" ? (
        /* ════════════════════════════════════════════════════════
           EVALUACIONES TAB
           ════════════════════════════════════════════════════════ */
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left panel */}
          <div className="flex flex-col gap-4 flex-shrink-0" style={{ width: 224 }}>

            {/* Date picker */}
            <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "#2e3939" }}>
                <p className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Nueva fecha</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Define un día de evaluaciones</p>
              </div>
              <div className="p-3 space-y-2">
                <input type="date" value={newDateInput} onChange={(e) => setNewDateInput(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none"
                  style={{ background: "#1F2525", border: "1px solid #2e3939", colorScheme: "dark" }} />
                <input type="text" placeholder="Nombre (ej: I Bimestre)" value={newDateLabel}
                  onChange={(e) => setNewDateLabel(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none"
                  style={{ background: "#1F2525", border: "1px solid #2e3939" }} />
                <button onClick={addEvalDay}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
                  style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)", opacity: newDateInput ? 1 : 0.4 }}>
                  <Plus size={12} />Agregar fecha
                </button>
              </div>
            </div>

            {/* Eval day list */}
            <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "#2e3939" }}>
                <p className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Fechas registradas</p>
              </div>
              <div className="divide-y max-h-52 overflow-y-auto" style={{ borderColor: "#2e3939" }}>
                {evalDays.length === 0 && (
                  <p className="text-[11px] text-gray-600 text-center py-4">Sin fechas aún</p>
                )}
                {evalDays.sort((a,b) => a.date.localeCompare(b.date)).map((d) => {
                  const isSelected = d.date === selectedEvalDate;
                  const dConflicts = detectEvalConflicts(d.blocks).length;
                  return (
                    <div key={d.date} role="button" tabIndex={0}
                      onClick={() => setSelectedEvalDate(d.date)}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedEvalDate(d.date)}
                      className="w-full px-3 py-2.5 text-left transition-colors group cursor-pointer"
                      style={{ background: isSelected ? "#00ADEB12" : "transparent", borderLeft: isSelected ? "2px solid #00ADEB" : "2px solid transparent" }}>
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <p className="text-[11px] font-semibold leading-tight" style={{ color: isSelected ? "#00ADEB" : "#D1D5DB", fontFamily: "var(--font-display)" }}>
                            {formatDate(d.date)}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{d.label}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{d.blocks.length} bloques</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {dConflicts > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "#EF444420", color: "#EF4444" }}>{dConflicts}</span>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); removeEvalDay(d.date); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#EF444420] text-gray-600 hover:text-[#EF4444] transition-all">
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Eval palette (edit mode) */}
            {evalEditMode && (
              <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
                <div className="px-3 py-2.5 border-b" style={{ borderColor: "#2e3939" }}>
                  <p className="text-[11px] font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Arrastrar evaluación</p>
                </div>
                <div className="p-2 space-y-1.5 max-h-64 overflow-y-auto">
                  {ASIGNATURAS.filter((a) => a !== "Hora libre").map((asig) => (
                    <PaletteChip key={asig} asig={asig}
                      onDragStart={() => { evalDragSource.current = { type: "palette", asignatura: asig }; }} />
                  ))}
                </div>
              </div>
            )}

            {/* Eval conflicts */}
            {evalConflicts.length > 0 && (
              <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
                <button className="w-full flex items-center justify-between px-3 py-2.5 border-b"
                  style={{ borderColor: "#2e3939" }} onClick={() => setShowEvalConflicts(!showEvalConflicts)}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={12} className="text-[#EF4444]" />
                    <p className="text-[11px] font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Conflictos</p>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#EF444420", color: "#EF4444" }}>{evalConflicts.length}</span>
                  </div>
                  <ChevronDown size={12} className="text-gray-500" style={{ transform: showEvalConflicts ? "rotate(180deg)" : undefined }} />
                </button>
                {showEvalConflicts && (
                  <div className="divide-y max-h-48 overflow-y-auto" style={{ borderColor: "#2e3939" }}>
                    {evalConflicts.map((c, i) => (
                      <div key={i} className="px-3 py-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                          style={{ background: c.type === "docente" ? "#3B82F620" : "#F59E0B20", color: c.type === "docente" ? "#60A5FA" : "#FBBF24" }}>
                          {c.type === "docente" ? "Docente" : "Aula"}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1 leading-tight">{c.message}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{SLOTS[c.slotIdx]?.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main eval area */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {!selectedEvalDate ? (
              <div className="flex-1 flex items-center justify-center rounded-2xl border" style={{ background: "#263030", borderColor: "#2e3939" }}>
                <div className="text-center">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Sin fecha seleccionada</p>
                  <p className="text-xs text-gray-500 mt-1">Agrega o selecciona una fecha de evaluaciones en el panel izquierdo</p>
                </div>
              </div>
            ) : (
              <>
                {/* Eval header bar */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Date badge */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: "#263030", borderColor: "#2e3939" }}>
                    <span className="text-lg">📝</span>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                        {currentEvalDay?.label}
                      </p>
                      <p className="text-[10px] text-[#00ADEB]">{formatDate(selectedEvalDate)}</p>
                    </div>
                  </div>

                  {/* Grado filter */}
                  <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
                    <GraduationCap size={12} className="text-gray-500" />
                    <select value={evalFilterGrado} onChange={(e) => setEvalFilterGrado(e.target.value)}
                      className="bg-transparent outline-none text-xs text-gray-300">
                      {GRADOS.map((g) => <option key={g} value={g} style={{ background: "#1F2525" }}>{g}</option>)}
                    </select>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-500">{evalBlocks.filter(b => b.grado === evalFilterGrado).length} evaluaciones · {evalFilterGrado}</span>
                    {evalEditMode ? (
                      <>
                        <button onClick={() => setEvalEditMode(false)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border text-gray-400 hover:text-white transition-colors"
                          style={{ borderColor: "#2e3939" }}>
                          <Save size={12} />Listo
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEvalEditMode(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                        style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
                        <Edit3 size={12} />Editar evaluaciones
                      </button>
                    )}
                  </div>
                </div>

                {evalEditMode && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
                    style={{ background: "#00ADEB12", border: "1px solid #00ADEB30", color: "#00ADEB" }}>
                    <Move size={12} />
                    <span>Arrastra evaluaciones desde el panel izquierdo hacia los bloques horarios. Cada sección puede tener su propia evaluación en cada franja.</span>
                  </div>
                )}

                {/* Eval grid: rows = slots, cols = secciones */}
                <div className="rounded-2xl border overflow-hidden flex-1 overflow-y-auto" style={{ background: "#263030", borderColor: "#2e3939" }}>
                  {/* Header */}
                  <div className="grid sticky top-0 z-10 border-b" style={{
                    borderColor: "#2e3939", background: "#1F2525",
                    gridTemplateColumns: "88px repeat(3, 1fr)",
                  }}>
                    <div className="px-3 py-3 flex items-center gap-1.5" style={{ borderRight: "1px solid #2e3939" }}>
                      <Clock size={12} className="text-gray-600" />
                      <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Hora</span>
                    </div>
                    {SECCIONES.map((sec, si) => (
                      <div key={sec} className="px-3 py-3 text-center" style={{ borderRight: si < 2 ? "1px solid #2e3939" : undefined }}>
                        <p className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Sección {sec}</p>
                        <p className="text-[10px] text-gray-500">{evalFilterGrado}</p>
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  <div className="divide-y" style={{ borderColor: "#2e3939" }}>
                    {SLOTS.map((slot) => (
                      <div key={slot.idx} className="grid" style={{ gridTemplateColumns: "88px repeat(3, 1fr)", minHeight: 72 }}>
                        {/* Time */}
                        <div className="px-3 py-2 flex flex-col justify-center" style={{ borderRight: "1px solid #2e3939" }}>
                          <p className="text-[10px] font-bold text-gray-400 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                            {slot.label.split("–")[0].trim()}
                          </p>
                          <p className="text-[9px] text-gray-600">45 min</p>
                        </div>
                        {/* Section cells */}
                        {SECCIONES.map((sec, si) => {
                          const block = evalBlockMap[slot.idx]?.[sec];
                          const isDragTarget = evalDragOver?.slotIdx === slot.idx && evalDragOver.seccion === sec;
                          const isConflict = block ? evalConflictIds.has(block.id) : false;
                          return (
                            <div key={sec}
                              onDragOver={(e) => { if (evalEditMode) { e.preventDefault(); setEvalDragOver({ slotIdx: slot.idx, seccion: sec }); } }}
                              onDragLeave={() => setEvalDragOver(null)}
                              onDrop={() => handleEvalDrop(slot.idx, sec)}
                              onClick={() => { if (evalEditMode && !block) evalAddEmpty(slot.idx, sec); }}
                              className="p-1.5 transition-all"
                              style={{
                                borderRight: si < 2 ? "1px solid #2e3939" : undefined,
                                background: isDragTarget ? "#00ADEB14" : "transparent",
                                cursor: evalEditMode && !block ? "cell" : undefined,
                              }}>
                              {!block ? (
                                evalEditMode && (
                                  <div className="w-full h-full min-h-14 rounded-lg border-dashed flex items-center justify-center"
                                    style={{ border: "1px dashed #2e3939", opacity: isDragTarget ? 1 : 0.3 }}>
                                    <Plus size={11} className="text-gray-600" />
                                  </div>
                                )
                              ) : (
                                <div draggable={evalEditMode}
                                  onDragStart={() => { evalDragSource.current = { type: "block", asignatura: block.asignatura, blockId: block.id }; setEvalDraggingId(block.id); }}
                                  onClick={() => evalEditMode && setEvalEditModal(block)}
                                  className="w-full h-full rounded-lg p-2 flex flex-col gap-0.5 group relative transition-all select-none"
                                  style={{
                                    background: COLORS[block.asignatura]?.bg ?? "#37415118",
                                    border: `1px solid ${isConflict ? "#EF4444" : (COLORS[block.asignatura]?.border ?? "#37415140")}`,
                                    boxShadow: isConflict ? "0 0 0 2px #EF444330" : undefined,
                                    cursor: evalEditMode ? "grab" : "default",
                                    opacity: evalDraggingId === block.id ? 0.4 : 1,
                                  }}>
                                  {isConflict && <AlertTriangle size={10} className="absolute top-1 right-1" style={{ color: "#EF4444" }} />}
                                  <p className="text-[11px] font-bold leading-tight truncate pr-3" style={{ color: COLORS[block.asignatura]?.text, fontFamily: "var(--font-display)" }}>
                                    {block.asignatura}
                                  </p>
                                  <p className="text-[10px] leading-tight truncate" style={{ color: COLORS[block.asignatura]?.text, opacity: 0.7 }}>
                                    {block.docente.replace("Lic. ", "")}
                                  </p>
                                  <div className="flex items-center gap-1 mt-auto">
                                    <Home size={8} style={{ color: COLORS[block.asignatura]?.text, opacity: 0.5 }} />
                                    <p className="text-[9px] truncate" style={{ color: COLORS[block.asignatura]?.text, opacity: 0.5 }}>{block.aula}</p>
                                  </div>
                                  {evalEditMode && (
                                    <button onClick={(e) => { e.stopPropagation(); setEvalEditModal(block); }}
                                      className="absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{ background: "#1F252580" }}>
                                      <Edit3 size={10} style={{ color: COLORS[block.asignatura]?.text }} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
      /* ════════════════════════════════════════════════════════
         HORARIO SEMANAL TAB (original content, wrapped)
         ════════════════════════════════════════════════════════ */
      <div className="flex gap-4 flex-1 min-h-0">
      {/* ── Left panel (palette + conflicts) ── */}
      <div className="flex flex-col gap-4 flex-shrink-0" style={{ width: 224 }}>

        {/* Section info card */}
        <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Sección activa</p>
          <p className="text-white font-bold text-lg leading-none" style={{ fontFamily: "var(--font-display)" }}>
            {filterGrado.slice(0,2)} — Sec. {filterSeccion}
          </p>
          <p className="text-xs text-gray-500 mt-1">Año Escolar 2026</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2 text-center" style={{ background: "#1F2525" }}>
              <p className="text-sm font-bold text-[#00ADEB]" style={{ fontFamily: "var(--font-display)" }}>{filledSlots}</p>
              <p className="text-[10px] text-gray-500">bloques</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: "#1F2525" }}>
              <p className="text-sm font-bold" style={{ color: conflicts.length > 0 ? "#EF4444" : "#10B981", fontFamily: "var(--font-display)" }}>
                {conflicts.length}
              </p>
              <p className="text-[10px] text-gray-500">conflictos</p>
            </div>
          </div>
        </div>

        {/* Palette (edit mode) */}
        {editMode && (
          <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="px-3 py-2.5 border-b" style={{ borderColor: "#2e3939" }}>
              <p className="text-[11px] font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Arrastrar asignatura</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Suelta en un bloque horario</p>
            </div>
            <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto">
              {ASIGNATURAS.map((asig) => (
                <PaletteChip key={asig} asig={asig}
                  onDragStart={() => { dragSource.current = { type: "palette", asignatura: asig }; }} />
              ))}
            </div>
          </div>
        )}

        {/* Conflicts panel */}
        {conflicts.length > 0 && (
          <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
            <button className="w-full flex items-center justify-between px-3 py-2.5 border-b transition-colors hover:bg-[#2e3939]/50"
              style={{ borderColor: "#2e3939" }}
              onClick={() => setShowConflicts(!showConflicts)}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={12} className="text-[#EF4444]" />
                <p className="text-[11px] font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Conflictos</p>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#EF444420", color: "#EF4444" }}>
                  {conflicts.length}
                </span>
              </div>
              <ChevronDown size={12} className="text-gray-500" style={{ transform: showConflicts ? "rotate(180deg)" : undefined, transition: "transform .2s" }} />
            </button>
            {showConflicts && (
              <div className="divide-y max-h-64 overflow-y-auto" style={{ borderColor: "#2e3939" }}>
                {conflicts.map((c, i) => (
                  <div key={i} className="px-3 py-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-semibold"
                        style={{ background: c.type === "docente" ? "#3B82F620" : "#F59E0B20", color: c.type === "docente" ? "#60A5FA" : "#FBBF24" }}>
                        {c.type === "docente" ? "Docente" : "Aula"}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-tight">{c.message}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{DAYS[c.day]} · {CONTENT_SLOTS.find((s) => s.idx === c.slotIdx)?.label}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.blocks.map((b) => (
                        <span key={b.id} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#1F2525", color: "#9CA3AF" }}>
                          {b.grado.slice(0,2)}{b.seccion}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="rounded-xl border p-3" style={{ background: "#263030", borderColor: "#2e3939" }}>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Leyenda</p>
          <div className="space-y-1.5">
            {ASIGNATURAS.map((a) => (
              <div key={a} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[a].dot }} />
                <span className="text-[10px] text-gray-400 truncate">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Top bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-lg border overflow-hidden flex-shrink-0" style={{ borderColor: "#2e3939" }}>
            {(["seccion","docente"] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className="px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5"
                style={{
                  background: viewMode === m ? "#00ADEB" : "#1F2525",
                  color: viewMode === m ? "#fff" : "#6B7280",
                  fontFamily: "var(--font-display)",
                }}>
                {m === "seccion" ? <><Layers size={12} />Por Sección</> : <><User size={12} />Por Docente</>}
              </button>
            ))}
          </div>

          {viewMode === "seccion" ? (
            <>
              <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
                <GraduationCap size={12} className="text-gray-500" />
                <select value={filterGrado} onChange={(e) => setFilterGrado(e.target.value)}
                  className="bg-transparent outline-none text-xs text-gray-300">
                  {GRADOS.map((g) => <option key={g} value={g} style={{ background: "#1F2525" }}>{g}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
                <Layers size={12} className="text-gray-500" />
                <select value={filterSeccion} onChange={(e) => setFilterSeccion(e.target.value)}
                  className="bg-transparent outline-none text-xs text-gray-300">
                  {SECCIONES.map((s) => <option key={s} value={s} style={{ background: "#1F2525" }}>Sección {s}</option>)}
                </select>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
              <User size={12} className="text-gray-500" />
              <select value={filterDocente} onChange={(e) => setFilterDocente(e.target.value)}
                className="bg-transparent outline-none text-xs text-gray-300">
                <option value="" style={{ background: "#1F2525" }}>Seleccionar docente...</option>
                {allDocentes.map((d) => <option key={d} value={d} style={{ background: "#1F2525" }}>{d}</option>)}
              </select>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {editMode ? (
              <>
                <button onClick={cancelEdit}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border text-gray-400 hover:text-white transition-colors"
                  style={{ borderColor: "#2e3939" }}>
                  <RotateCcw size={12} />Cancelar
                </button>
                <button onClick={saveEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#10B981,#065205)", fontFamily: "var(--font-display)" }}>
                  <Save size={12} />Guardar horario
                </button>
              </>
            ) : (
              <button onClick={enterEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
                <Edit3 size={12} />Editar horario
              </button>
            )}
          </div>
        </div>

        {/* Edit mode hint */}
        {editMode && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
            style={{ background: "#00ADEB12", border: "1px solid #00ADEB30", color: "#00ADEB" }}>
            <Move size={12} />
            <span>Arrastra asignaturas desde el panel izquierdo a los bloques, o mueve los existentes entre celdas. Haz clic en un bloque para editarlo.</span>
          </div>
        )}

        {/* Grid */}
        <div className="rounded-2xl border overflow-hidden flex-1" style={{ background: "#263030", borderColor: "#2e3939" }}>
          {/* Day headers */}
          <div className="grid border-b" style={{
            borderColor: "#2e3939",
            gridTemplateColumns: "88px repeat(5, 1fr)",
          }}>
            <div className="px-3 py-3 flex items-center gap-1.5" style={{ borderRight: "1px solid #2e3939" }}>
              <Clock size={12} className="text-gray-600" />
              <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Hora</span>
            </div>
            {DAYS.map((day, di) => (
              <div key={day} className="px-3 py-3 text-center" style={{ borderRight: di < 4 ? "1px solid #2e3939" : undefined }}>
                <p className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{day}</p>
              </div>
            ))}
          </div>

          {/* Slot rows */}
          <div className="divide-y" style={{ borderColor: "#2e3939" }}>
            {SLOTS.map((slot) => {
              const slotIdx = slot.idx;
              return (
                <div key={slot.idx} className="grid" style={{
                  gridTemplateColumns: "88px repeat(5, 1fr)",
                  minHeight: 76,
                }}>
                  {/* Time label */}
                  <div className="px-3 py-2 flex flex-col justify-center" style={{ borderRight: "1px solid #2e3939" }}>
                    <p className="text-[10px] font-bold text-gray-400 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                      {slot.label.split("–")[0].trim()}
                    </p>
                    <p className="text-[9px] text-gray-600">45 min</p>
                  </div>

                  {/* Day cells */}
                  {DAYS.map((_, di) => {
                    const cellBlocks = blockMap[di]?.[slotIdx] ?? [];
                    const isDragTarget = dragOver?.day === di && dragOver.slotIdx === slotIdx;
                    const isEmpty = cellBlocks.length === 0;
                    return (
                      <div key={di}
                        onDragOver={(e) => { if (editMode) { e.preventDefault(); setDragOver({ day: di, slotIdx }); } }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={() => handleDrop(di, slotIdx)}
                        onClick={() => { if (editMode && isEmpty) addEmptyBlock(di, slotIdx); }}
                        className="p-1.5 transition-all"
                        style={{
                          borderRight: di < 4 ? "1px solid #2e3939" : undefined,
                          background: isDragTarget ? "#00ADEB14" : "transparent",
                          border: isDragTarget ? "1px dashed #00ADEB50" : undefined,
                          cursor: editMode && isEmpty ? "cell" : undefined,
                        }}>
                        {isEmpty ? (
                          editMode && (
                            <div className="w-full h-full min-h-14 rounded-lg border-dashed flex items-center justify-center transition-colors"
                              style={{ border: "1px dashed #2e3939", opacity: isDragTarget ? 1 : 0.4 }}>
                              <Plus size={12} className="text-gray-600" />
                            </div>
                          )
                        ) : (
                          cellBlocks.map((block) => (
                            <BlockCard key={block.id} block={block} editMode={editMode}
                              isConflict={conflictIds.has(block.id)}
                              isDragging={draggingId === block.id}
                              docenteView={docenteView}
                              onEdit={() => setEditModal(block)}
                              onDragStart={() => {
                                dragSource.current = { type: "block", asignatura: block.asignatura, blockId: block.id };
                                setDraggingId(block.id);
                              }} />
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer stats */}
        <div className="flex items-center gap-4 px-1">
          <div className="flex items-center gap-2">
            {ASIGNATURAS.filter((a) => a !== "Hora libre").map((a) => {
              const count = sectionBlocks.filter((b) => b.asignatura === a).length;
              if (!count) return null;
              return (
                <div key={a} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: `${COLORS[a].dot}15`, border: `1px solid ${COLORS[a].dot}30` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[a].dot }} />
                  <span className="text-[10px] font-medium" style={{ color: COLORS[a].text }}>{a.split(" ")[0]} ({count})</span>
                </div>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-3 text-[11px] text-gray-500">
            <span>{filledSlots}/{totalSlots} bloques asignados</span>
            {conflicts.length > 0 && (
              <span className="flex items-center gap-1" style={{ color: "#EF4444" }}>
                <AlertTriangle size={11} />{conflicts.length} conflicto{conflicts.length > 1 ? "s" : ""} detectado{conflicts.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editModal && (
        <EditModal block={editModal}
          onSave={handleBlockSave}
          onDelete={handleBlockDelete}
          onClose={() => setEditModal(null)} />
      )}
      </div>
      )}

      {/* Eval edit modal */}
      {evalEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="w-96 rounded-2xl border overflow-hidden shadow-2xl" style={{ background: "#1F2525", borderColor: "#2e3939" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#2e3939" }}>
              <p className="font-bold text-white text-sm" style={{ fontFamily: "var(--font-display)" }}>Editar evaluación</p>
              <button onClick={() => setEvalEditModal(null)} className="p-1.5 rounded-lg hover:bg-[#2e3939] text-gray-400 transition-colors"><X size={14} /></button>
            </div>
            <EvalEditModalBody block={evalEditModal}
              onSave={(b) => { evalSaveBlock(b); setEvalEditModal(null); }}
              onDelete={(id) => { evalDeleteBlock(id); setEvalEditModal(null); }}
              onClose={() => setEvalEditModal(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function EvalEditModalBody({ block, onSave, onDelete, onClose }: {
  block: EvalBlock; onSave: (b: EvalBlock) => void; onDelete: (id: string) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ ...block });
  return (
    <>
      <div className="p-5 space-y-3">
        <div>
          <label className="text-[11px] text-gray-500 mb-1 block">Asignatura / Evaluación</label>
          <select value={form.asignatura}
            onChange={(e) => setForm({ ...form, asignatura: e.target.value, docente: DOCENTES[e.target.value] ?? form.docente, aula: AULAS_DEFAULT[e.target.value] ?? form.aula })}
            className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none"
            style={{ background: "#263030", border: "1px solid #2e3939" }}>
            {ASIGNATURAS.filter((a) => a !== "Hora libre").map((a) => <option key={a} value={a} style={{ background: "#1F2525" }}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-gray-500 mb-1 block">Docente supervisor</label>
          <input value={form.docente} onChange={(e) => setForm({ ...form, docente: e.target.value })}
            className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none"
            style={{ background: "#263030", border: "1px solid #2e3939" }} />
        </div>
        <div>
          <label className="text-[11px] text-gray-500 mb-1 block">Aula</label>
          <select value={form.aula} onChange={(e) => setForm({ ...form, aula: e.target.value })}
            className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none"
            style={{ background: "#263030", border: "1px solid #2e3939" }}>
            {ALL_AULAS.map((a) => <option key={a} value={a} style={{ background: "#1F2525" }}>{a}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg p-2.5" style={{ background: "#263030", border: "1px solid #2e3939" }}>
            <p className="text-[10px] text-gray-500">Sección</p>
            <p className="text-xs text-white font-semibold mt-0.5">{form.grado} — Sec. {form.seccion}</p>
          </div>
          <div className="rounded-lg p-2.5" style={{ background: "#263030", border: "1px solid #2e3939" }}>
            <p className="text-[10px] text-gray-500">Hora</p>
            <p className="text-xs text-white font-semibold mt-0.5">{SLOTS.find((s) => s.idx === form.slotIdx)?.label ?? "—"}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 pb-5 gap-2">
        <button onClick={() => onDelete(block.id)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ background: "#EF444415", color: "#EF4444", border: "1px solid #EF444430" }}>
          <Trash2 size={12} />Eliminar
        </button>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white border transition-colors" style={{ borderColor: "#2e3939" }}>Cancelar</button>
          <button onClick={() => onSave(form)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}>
            <Save size={12} />Guardar
          </button>
        </div>
      </div>
    </>
  );
}
