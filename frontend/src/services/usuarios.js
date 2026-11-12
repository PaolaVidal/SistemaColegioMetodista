import { actualizar, crear, obtenerTodos } from './recursos';

const VINCULOS = [
  { recurso: 'docentes', tipo: 'Docente' },
  { recurso: 'estudiantes', tipo: 'Estudiante' },
  { recurso: 'responsables', tipo: 'Encargado' },
];

// Usuarios con su rol y la persona (docente, estudiante o encargado) vinculada a la cuenta.
export async function cargarUsuarios() {
  const [usuarios, roles, ...personas] = await Promise.all([
    obtenerTodos('usuarios'),
    obtenerTodos('roles'),
    ...VINCULOS.map((v) => obtenerTodos(v.recurso)),
  ]);

  const rolPorId = Object.fromEntries(roles.map((r) => [r.id, r.nombre]));
  const personaPorUsuario = {};
  VINCULOS.forEach((vinculo, i) => {
    personas[i].filter((p) => p.id_usuario).forEach((p) => {
      personaPorUsuario[p.id_usuario] = {
        tipo: vinculo.tipo, nombres: p.nombres, apellidos: p.apellidos, telefono: p.telefono || null,
      };
    });
  });

  return {
    roles: [...roles].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    usuarios: usuarios.map((u) => ({
      ...u,
      rol: rolPorId[u.id_rol] || '—',
      persona: personaPorUsuario[u.id] || null,
    })),
  };
}

export function guardarUsuario(id, datos) {
  return id ? actualizar('usuarios', id, datos) : crear('usuarios', datos);
}
