import { describe, expect, it } from 'vitest';
import explicarConflicto from './conflictos';

const matematica = {
  id: 1, id_seccion: 10, id_docente: 100, asignatura: 'Matemática', docente: 'Ana López', grado: '3.º grado', seccion: 'A',
};
const fisica = {
  id: 2, id_seccion: 20, id_docente: 100, asignatura: 'Física', docente: 'Ana López', grado: '4.º grado', seccion: 'B',
};
const lenguaje = {
  id: 3, id_seccion: 10, id_docente: 200, asignatura: 'Lenguaje', docente: 'Luis Pérez', grado: '3.º grado', seccion: 'A',
};
const bloque = (id, asignacion, inicio, fin) => ({
  id, asignacion, dia_semana: 'Lunes', inicio, fin,
});
const bloques = [bloque(1, matematica, '07:30', '08:20'), bloque(2, lenguaje, '09:00', '09:50')];

describe('explicarConflicto', () => {
  it('por sección: el docente ya da clase en otra sección y se ofrece su horario', () => {
    const r = explicarConflicto(bloques, fisica, { dia: 'Lunes', inicio: '08:00', fin: '08:50' }, [], 'seccion');
    expect(r.mensaje).toBe('El docente Ana López ya tiene otra clase: Matemática con 3.º grado — Sección A el lunes de 07:30 a 08:20.');
    expect(r.previa.tipo).toBe('docente');
    expect(r.previa.resaltados).toEqual([1]);
    expect(bloques.filter(r.previa.filtro).map((b) => b.id)).toEqual([1]);
  });

  it('por docente: la sección ya tiene otra clase y se ofrece el horario de la sección', () => {
    const r = explicarConflicto(bloques, matematica, { dia: 'Lunes', inicio: '09:20', fin: '10:10' }, [1], 'docente');
    expect(r.mensaje).toBe('La sección 3.º grado — Sección A ya tiene Lenguaje con Luis Pérez el lunes de 09:00 a 09:50.');
    expect(r.previa.tipo).toBe('seccion');
  });

  it('choque visible en la vista actual: mensaje sin vista previa', () => {
    const r = explicarConflicto(bloques, lenguaje, { dia: 'Lunes', inicio: '08:00', fin: '08:50' }, [], 'seccion');
    expect(r.mensaje).toBe('La sección ya tiene Matemática con Ana López el lunes de 07:30 a 08:20.');
    expect(r.previa).toBeNull();
  });

  it('sin choques devuelve null', () => {
    expect(explicarConflicto(bloques, fisica, { dia: 'Martes', inicio: '07:30', fin: '08:20' }, [], 'seccion')).toBeNull();
  });
});
