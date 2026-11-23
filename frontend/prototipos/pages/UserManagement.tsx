import { useState } from "react";
import {
  Search, Plus, Eye, Pencil, ToggleLeft, ToggleRight,
  X, ChevronLeft, ChevronRight, Filter, Users,
  ShieldCheck, BookOpen, ClipboardList, GraduationCap,
  CheckCircle, XCircle,
} from "lucide-react";

type Role = "Administrador" | "Docente" | "Secretaría" | "Estudiante/Encargado";
type Status = "Activo" | "Inactivo";

interface User {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  rol: Role;
  estado: Status;
  fechaRegistro: string;
}

const initialUsers: User[] = [
  { id: 1, nombre: "María", apellidos: "González Ríos", correo: "m.gonzalez@eduadmin.pe", telefono: "987 654 321", rol: "Administrador", estado: "Activo", fechaRegistro: "2024-01-15" },
  { id: 2, nombre: "Carlos", apellidos: "Mendoza Huanca", correo: "c.mendoza@eduadmin.pe", telefono: "912 345 678", rol: "Docente", estado: "Activo", fechaRegistro: "2024-02-08" },
  { id: 3, nombre: "Lucía", apellidos: "Paredes Vega", correo: "l.paredes@eduadmin.pe", telefono: "998 112 233", rol: "Secretaría", estado: "Activo", fechaRegistro: "2024-02-20" },
  { id: 4, nombre: "Roberto", apellidos: "Flores Mamani", correo: "r.flores@eduadmin.pe", telefono: "945 667 788", rol: "Docente", estado: "Inactivo", fechaRegistro: "2024-03-01" },
  { id: 5, nombre: "Ana", apellidos: "Torres Quispe", correo: "ana.torres@gmail.com", telefono: "971 223 344", rol: "Estudiante/Encargado", estado: "Activo", fechaRegistro: "2024-03-12" },
  { id: 6, nombre: "Jorge", apellidos: "Ramírez Chávez", correo: "j.ramirez@eduadmin.pe", telefono: "963 445 566", rol: "Docente", estado: "Activo", fechaRegistro: "2024-04-05" },
  { id: 7, nombre: "Patricia", apellidos: "Salinas Cruz", correo: "p.salinas@eduadmin.pe", telefono: "954 778 899", rol: "Secretaría", estado: "Activo", fechaRegistro: "2024-04-18" },
  { id: 8, nombre: "Miguel", apellidos: "Vargas León", correo: "m.vargas@gmail.com", telefono: "932 556 677", rol: "Estudiante/Encargado", estado: "Inactivo", fechaRegistro: "2024-05-03" },
  { id: 9, nombre: "Sandra", apellidos: "Núñez Apaza", correo: "s.nunez@eduadmin.pe", telefono: "978 334 455", rol: "Docente", estado: "Activo", fechaRegistro: "2024-05-21" },
  { id: 10, nombre: "Andrés", apellidos: "Cáceres Puma", correo: "a.caceres@gmail.com", telefono: "916 889 900", rol: "Estudiante/Encargado", estado: "Activo", fechaRegistro: "2024-06-10" },
  { id: 11, nombre: "Verónica", apellidos: "Herrera Taipe", correo: "v.herrera@eduadmin.pe", telefono: "947 221 133", rol: "Docente", estado: "Activo", fechaRegistro: "2024-06-25" },
  { id: 12, nombre: "Ricardo", apellidos: "Soto Aliaga", correo: "r.soto@gmail.com", telefono: "985 443 322", rol: "Estudiante/Encargado", estado: "Activo", fechaRegistro: "2024-07-14" },
];

const ROLES: Role[] = ["Administrador", "Docente", "Secretaría", "Estudiante/Encargado"];

const roleColors: Record<Role, { bg: string; text: string; icon: React.ComponentType<{ size?: number }> }> = {
  "Administrador": { bg: "#00ADEB20", text: "#00ADEB", icon: ShieldCheck },
  "Docente": { bg: "#10B98120", text: "#10B981", icon: BookOpen },
  "Secretaría": { bg: "#F59E0B20", text: "#F59E0B", icon: ClipboardList },
  "Estudiante/Encargado": { bg: "#A78BFA20", text: "#A78BFA", icon: GraduationCap },
};

const ROWS_PER_PAGE = 8;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4"
      style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}>
      {children}
    </h2>
  );
}

type ModalMode = "create" | "edit" | "view" | null;

const emptyForm: Omit<User, "id" | "fechaRegistro"> = {
  nombre: "", apellidos: "", correo: "", telefono: "",
  rol: "Docente", estado: "Activo",
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState<Role | "">("");
  const [filterEstado, setFilterEstado] = useState<Status | "">("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState<Omit<User, "id" | "fechaRegistro">>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof emptyForm, string>>>({});

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.nombre.toLowerCase().includes(q) || u.apellidos.toLowerCase().includes(q) ||
      u.correo.toLowerCase().includes(q);
    const matchRol = !filterRol || u.rol === filterRol;
    const matchEstado = !filterEstado || u.estado === filterEstado;
    return matchSearch && matchRol && matchEstado;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageUsers = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  function openCreate() {
    setForm(emptyForm);
    setErrors({});
    setSelected(null);
    setModal("create");
  }

  function openEdit(u: User) {
    setForm({ nombre: u.nombre, apellidos: u.apellidos, correo: u.correo, telefono: u.telefono, rol: u.rol, estado: u.estado });
    setErrors({});
    setSelected(u);
    setModal("edit");
  }

  function openView(u: User) {
    setSelected(u);
    setModal("view");
  }

  function toggleEstado(u: User) {
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, estado: x.estado === "Activo" ? "Inactivo" : "Activo" } : x));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.apellidos.trim()) e.apellidos = "Requerido";
    if (!form.correo.trim()) e.correo = "Requerido";
    else if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = "Correo inválido";
    if (!form.telefono.trim()) e.telefono = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    if (modal === "create") {
      const newUser: User = {
        ...form,
        id: Math.max(0, ...users.map((u) => u.id)) + 1,
        fechaRegistro: new Date().toISOString().slice(0, 10),
      };
      setUsers((prev) => [newUser, ...prev]);
    } else if (modal === "edit" && selected) {
      setUsers((prev) => prev.map((u) => u.id === selected.id ? { ...u, ...form } : u));
    }
    setModal(null);
  }

  const statsData = [
    { label: "Total usuarios", value: users.length, color: "#00ADEB" },
    { label: "Activos", value: users.filter((u) => u.estado === "Activo").length, color: "#10B981" },
    { label: "Inactivos", value: users.filter((u) => u.estado === "Inactivo").length, color: "#EF4444" },
    { label: "Docentes", value: users.filter((u) => u.rol === "Docente").length, color: "#F59E0B" },
  ];

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsData.map((s) => (
          <div key={s.label} className="rounded-xl border p-4 flex items-center gap-3"
            style={{ background: "#263030", borderColor: "#2e3939" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
              <Users size={15} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
              <p className="text-[11px] text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + action bar */}
      <div className="rounded-xl border p-4" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search nombre/correo */}
          <div className="flex items-center gap-2 flex-1 min-w-48 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Search size={14} className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-xs text-white placeholder-gray-600 w-full"
              style={{ fontFamily: "var(--font-body)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300"><X size={13} /></button>
            )}
          </div>

          {/* Filter rol */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Filter size={13} className="text-gray-500" />
            <select
              value={filterRol}
              onChange={(e) => { setFilterRol(e.target.value as Role | ""); setPage(1); }}
              className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <option value="" style={{ background: "#1F2525" }}>Todos los roles</option>
              {ROLES.map((r) => <option key={r} value={r} style={{ background: "#1F2525" }}>{r}</option>)}
            </select>
          </div>

          {/* Filter estado */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#1F2525", border: "1px solid #2e3939" }}>
            <Filter size={13} className="text-gray-500" />
            <select
              value={filterEstado}
              onChange={(e) => { setFilterEstado(e.target.value as Status | ""); setPage(1); }}
              className="bg-transparent outline-none text-xs text-gray-300 cursor-pointer"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <option value="" style={{ background: "#1F2525" }}>Todos los estados</option>
              <option value="Activo" style={{ background: "#1F2525" }}>Activo</option>
              <option value="Inactivo" style={{ background: "#1F2525" }}>Inactivo</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-150 hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}
            >
              <Plus size={14} />
              Nuevo usuario
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#263030", borderColor: "#2e3939" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "#1F2525", borderBottom: "1px solid #2e3939" }}>
                {["Nombre", "Correo electrónico", "Rol", "Estado", "Fecha de registro", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 whitespace-nowrap"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <Users size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No se encontraron usuarios</p>
                  </td>
                </tr>
              ) : (
                pageUsers.map((u, idx) => {
                  const roleConf = roleColors[u.rol];
                  const RoleIcon = roleConf.icon;
                  return (
                    <tr
                      key={u.id}
                      className="transition-colors border-b hover:bg-[#2e3939]/60"
                      style={{ borderColor: "#2e3939", opacity: u.estado === "Inactivo" ? 0.65 : 1 }}
                    >
                      {/* Nombre */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: idx % 2 === 0 ? "#107A9F" : "#00ADEB" }}
                          >
                            {u.nombre[0]}{u.apellidos[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                              {u.nombre} {u.apellidos}
                            </p>
                            <p className="text-gray-500 text-[10px]">{u.telefono}</p>
                          </div>
                        </div>
                      </td>

                      {/* Correo */}
                      <td className="px-4 py-3 text-gray-300">{u.correo}</td>

                      {/* Rol */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium"
                          style={{ background: roleConf.bg, color: roleConf.text }}
                        >
                          <RoleIcon size={11} />
                          {u.rol}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium"
                          style={{
                            background: u.estado === "Activo" ? "#10B98120" : "#EF444420",
                            color: u.estado === "Activo" ? "#10B981" : "#EF4444",
                          }}
                        >
                          {u.estado === "Activo" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                          {u.estado}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(u.fechaRegistro).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openView(u)}
                            title="Ver"
                            className="p-1.5 rounded-lg transition-colors hover:bg-[#00ADEB]/10 text-gray-400 hover:text-[#00ADEB]"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            title="Editar"
                            className="p-1.5 rounded-lg transition-colors hover:bg-[#F59E0B]/10 text-gray-400 hover:text-[#F59E0B]"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => toggleEstado(u)}
                            title={u.estado === "Activo" ? "Desactivar" : "Activar"}
                            className="p-1.5 rounded-lg transition-colors text-gray-400"
                            style={{ color: u.estado === "Activo" ? undefined : "#10B981" }}
                          >
                            {u.estado === "Activo"
                              ? <ToggleRight size={16} className="hover:text-red-400 transition-colors" />
                              : <ToggleLeft size={16} className="hover:text-green-400 transition-colors" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#2e3939" }}>
          <p className="text-xs text-gray-500">
            Mostrando {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30 text-gray-400 hover:text-white hover:bg-[#2e3939]"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: p === currentPage ? "#00ADEB" : "transparent",
                  color: p === currentPage ? "#fff" : "#9CA3AF",
                  fontFamily: "var(--font-display)",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30 text-gray-400 hover:text-white hover:bg-[#2e3939]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden" style={{ background: "#1F2525", borderColor: "#2e3939" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#2e3939" }}>
              <div>
                <h2 className="text-white font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
                  {modal === "create" ? "Nuevo usuario" : modal === "edit" ? "Editar usuario" : "Detalle de usuario"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {modal === "create" ? "Complete los datos para registrar un nuevo usuario" :
                    modal === "edit" ? `Editando: ${selected?.nombre} ${selected?.apellidos}` :
                      `ID #${selected?.id} — Registrado el ${selected ? new Date(selected.fechaRegistro).toLocaleDateString("es-PE") : ""}`}
                </p>
              </div>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-[#2e3939] text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {modal === "view" && selected ? (
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: "#2e3939" }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)" }}>
                      {selected.nombre[0]}{selected.apellidos[0]}
                    </div>
                    <div>
                      <p className="text-white font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
                        {selected.nombre} {selected.apellidos}
                      </p>
                      <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: roleColors[selected.rol].bg, color: roleColors[selected.rol].text }}>
                        {selected.rol}
                      </span>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: selected.estado === "Activo" ? "#10B98120" : "#EF444420",
                        color: selected.estado === "Activo" ? "#10B981" : "#EF4444",
                      }}>
                      {selected.estado === "Activo" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      {selected.estado}
                    </span>
                  </div>
                  {[
                    ["Correo electrónico", selected.correo],
                    ["Teléfono", selected.telefono],
                    ["Fecha de registro", new Date(selected.fechaRegistro).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b" style={{ borderColor: "#2e3939" }}>
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nombre" error={errors.nombre}>
                      <input type="text" value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Ej: María" disabled={modal === "view"}
                        className="field-input" />
                    </Field>
                    <Field label="Apellidos" error={errors.apellidos}>
                      <input type="text" value={form.apellidos}
                        onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                        placeholder="Ej: González Ríos" disabled={modal === "view"}
                        className="field-input" />
                    </Field>
                  </div>
                  <Field label="Correo electrónico" error={errors.correo}>
                    <input type="email" value={form.correo}
                      onChange={(e) => setForm({ ...form, correo: e.target.value })}
                      placeholder="correo@ejemplo.com" disabled={modal === "view"}
                      className="field-input" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Teléfono" error={errors.telefono}>
                      <input type="tel" value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        placeholder="9XX XXX XXX" disabled={modal === "view"}
                        className="field-input" />
                    </Field>
                    {modal === "create" && (
                      <Field label="Contraseña">
                        <input type="password" placeholder="••••••••" className="field-input" />
                      </Field>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Rol">
                      <select value={form.rol}
                        onChange={(e) => setForm({ ...form, rol: e.target.value as Role })}
                        className="field-input cursor-pointer">
                        {ROLES.map((r) => <option key={r} value={r} style={{ background: "#263030" }}>{r}</option>)}
                      </select>
                    </Field>
                    <Field label="Estado">
                      <select value={form.estado}
                        onChange={(e) => setForm({ ...form, estado: e.target.value as Status })}
                        className="field-input cursor-pointer">
                        <option value="Activo" style={{ background: "#263030" }}>Activo</option>
                        <option value="Inactivo" style={{ background: "#263030" }}>Inactivo</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            {modal !== "view" && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "#2e3939" }}>
                <button
                  onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#2e3939] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#00ADEB,#107A9F)", fontFamily: "var(--font-display)" }}
                >
                  {modal === "create" ? "Registrar usuario" : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .field-input {
          width: 100%;
          background: #263030;
          border: 1px solid #2e3939;
          border-radius: 8px;
          padding: 8px 12px;
          color: #fff;
          font-size: 12px;
          font-family: var(--font-body);
          outline: none;
          transition: border-color 0.15s;
        }
        .field-input:focus { border-color: #00ADEB; }
        .field-input::placeholder { color: #4B5563; }
        .field-input:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400" style={{ fontFamily: "var(--font-display)" }}>{label}</label>
      {children}
      {error && <p className="text-[11px]" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}
