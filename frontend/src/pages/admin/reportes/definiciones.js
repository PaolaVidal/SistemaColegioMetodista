import {
  BookOpen, Calendar, ClipboardList, CreditCard, FileText, GraduationCap, TrendingUp, Users,
} from 'lucide-react';
import cargarAsistencias from '../../../services/asistencias';
import cargarCalificaciones from '../../../services/calificaciones';
import { cargarEstudiantes } from '../../../services/estudiantes';
import { cargarMatriculas } from '../../../services/matriculas';
import { cargarFinanzas } from '../../../services/pagos';
import { dinero, fechaCorta, nombreCompleto } from '../../../utils/formato';
import {
  NIVELES_NOTA, NOTA_MINIMA, PERIODOS, formatoNota, nivelNota, promedio,
} from '../../../utils/notas';

// Cada reporte declara sus filtros y una función `generar` que devuelve KPIs, gráfico y tabla.
// Los filtros vacíos ('') incluyen todos los registros.

const ESTADOS_CUENTA = { pagado: 'Pagado', pendiente: 'Pendiente', vencido: 'Vencido' };

const opcionesCiclo = (c) => c.ciclos.map((x) => [String(x.id), `Año escolar ${String(x.fecha_inicio).slice(0, 4)}`]);
const opcionesGrado = (c) => c.grados.map(([id, nombre]) => [String(id), nombre]);
const opcionesSeccion = (c) => c.nombresSeccion.map((s) => [s, `Sección ${s}`]);
const opcionesPeriodo = () => Object.entries(PERIODOS);
const cicloPorDefecto = (c) => String(c.cicloActivo?.id || '');

const filtroCiclo = {
  id: 'ciclo', etiqueta: 'Ciclo', opciones: opcionesCiclo, inicial: cicloPorDefecto,
};
const filtroGrado = { id: 'grado', etiqueta: 'Grado', opciones: opcionesGrado };
const filtroSeccion = { id: 'seccion', etiqueta: 'Sección', opciones: opcionesSeccion };
const filtroPeriodo = { id: 'periodo', etiqueta: 'Período', opciones: opcionesPeriodo };
const TODA_LA_SECCION = 'todos';

// Estudiantes matriculados en el ciclo, grado y sección elegidos.
const filtroEstudianteBoleta = {
  id: 'estudiante',
  etiqueta: 'Estudiante',
  vacio: 'Resumen de la sección (tabla)',
  dependeDe: ['ciclo', 'grado', 'seccion'],
  opciones: (c, f = {}) => [
    [TODA_LA_SECCION, 'Boletas individuales de toda la sección'],
    ...c.matriculas
      .filter((m) => (!f.ciclo || String(m.idCiclo) === f.ciclo) && (!f.grado || String(m.idGrado) === f.grado)
        && (!f.seccion || m.seccion === f.seccion))
      .sort((a, b) => nombreCompleto(a.estudiante).localeCompare(nombreCompleto(b.estudiante)))
      .map((m) => [String(m.estudiante.id), `${nombreCompleto(m.estudiante)} (${m.estudiante.codigo_nie})`]),
  ],
};

function contarPor(lista, clave) {
  return Object.entries(lista.reduce((acc, x) => ({ ...acc, [clave(x)]: (acc[clave(x)] || 0) + 1 }), {}))
    .map(([nombre, valor]) => ({ nombre, valor }));
}

function coincide(valor, filtro) {
  return !filtro || String(valor) === filtro;
}

async function reporteCalificaciones(f) {
  const datos = await cargarCalificaciones();
  const promedios = datos.promedios.filter((p) => p.promedio !== null && coincide(p.idCiclo, f.ciclo)
    && coincide(p.periodo, f.periodo)
    && coincide(p.idGrado, f.grado) && coincide(p.seccion, f.seccion) && coincide(p.asignatura, f.asignatura));
  const general = promedio(promedios.map((p) => p.promedio));
  const porAsignatura = Object.entries(promedios.reduce((acc, p) => ({
    ...acc, [p.asignatura]: [...(acc[p.asignatura] || []), p.promedio],
  }), {}))
    .map(([nombre, notas]) => ({ nombre, valor: promedio(notas) }));
  return {
    kpis: [
      { etiqueta: 'Promedio general', valor: formatoNota(general), detalle: 'Promedio ponderado' },
      { etiqueta: 'Excelentes', valor: promedios.filter((p) => p.promedio >= 9).length, detalle: 'Promedio ≥ 9' },
      { etiqueta: 'En riesgo', valor: promedios.filter((p) => p.promedio < NOTA_MINIMA).length, detalle: `Promedio < ${NOTA_MINIMA}` },
      { etiqueta: 'Estudiantes evaluados', valor: new Set(promedios.map((p) => p.estudiante?.id)).size, detalle: 'Con notas' },
    ],
    grafico: {
      tipo: 'barras', titulo: 'Promedio por asignatura', datos: porAsignatura, maximo: 10,
    },
    columnas: ['Estudiante', 'NIE', 'Grado', 'Sección', 'Asignatura', 'Período', 'Promedio', 'Nivel'],
    filas: promedios
      .sort((a, b) => a.idGrado - b.idGrado || a.seccion.localeCompare(b.seccion)
        || nombreCompleto(a.estudiante).localeCompare(nombreCompleto(b.estudiante))
        || a.asignatura.localeCompare(b.asignatura))
      .map((p) => [nombreCompleto(p.estudiante), p.estudiante?.codigo_nie, p.grado, p.seccion, p.asignatura,
        PERIODOS[p.periodo], formatoNota(p.promedio), nivelNota(p.promedio).etiqueta]),
  };
}

async function reporteAsistencia(f) {
  const datos = await cargarAsistencias();
  const registros = datos.registros.filter((r) => coincide(r.idCiclo, f.ciclo) && coincide(r.idGrado, f.grado)
    && coincide(r.seccion, f.seccion) && (!f.desde || r.fecha >= f.desde) && (!f.hasta || r.fecha <= f.hasta));
  const porEstudiante = Object.values(registros.reduce((acc, r) => {
    const id = r.estudiante?.id;
    const actual = acc[id] || {
      r, Presente: 0, Ausente: 0, Tardanza: 0, Justificado: 0,
    };
    return { ...acc, [id]: { ...actual, [r.estado]: actual[r.estado] + 1 } };
  }, {}));
  const pct = (x) => {
    const total = x.Presente + x.Ausente + x.Tardanza + x.Justificado;
    return total ? Math.round(((total - x.Ausente) / total) * 1000) / 10 : 0;
  };
  const porGrado = Object.entries(registros.reduce((acc, r) => ({
    ...acc, [r.grado]: [...(acc[r.grado] || []), r],
  }), {}))
    .map(([nombre, lista]) => ({ nombre, valor: Math.round((lista.filter((x) => x.estado !== 'Ausente').length / lista.length) * 1000) / 10 }));
  const asistidos = registros.filter((r) => r.estado !== 'Ausente').length;
  return {
    kpis: [
      { etiqueta: 'Asistencia promedio', valor: `${registros.length ? Math.round((asistidos / registros.length) * 1000) / 10 : 0}%`, detalle: 'Del período' },
      { etiqueta: 'Ausencias', valor: registros.filter((r) => r.estado === 'Ausente').length, detalle: 'Registradas' },
      { etiqueta: 'Tardanzas', valor: registros.filter((r) => r.estado === 'Tardanza').length, detalle: 'Registradas' },
      { etiqueta: 'Estudiantes', valor: porEstudiante.length, detalle: 'Con registros' },
    ],
    grafico: {
      tipo: 'barras', titulo: '% de asistencia por grado', datos: porGrado, maximo: 100,
    },
    columnas: ['Estudiante', 'NIE', 'Grado', 'Sección', 'Presentes', 'Ausencias', 'Tardanzas', 'Justificadas', '% Asistencia'],
    filas: porEstudiante
      .sort((a, b) => pct(a) - pct(b))
      .map((x) => [nombreCompleto(x.r.estudiante), x.r.estudiante?.codigo_nie, x.r.grado, x.r.seccion,
        x.Presente, x.Ausente, x.Tardanza, x.Justificado, `${pct(x)}%`]),
  };
}

async function reporteRendimiento(f) {
  const datos = await cargarCalificaciones();
  const promedios = datos.promedios.filter((p) => p.promedio !== null && coincide(p.idCiclo, f.ciclo)
    && coincide(p.periodo, f.periodo) && coincide(p.idGrado, f.grado));
  let estudiantes = Object.values(promedios.reduce((acc, p) => ({
    ...acc, [p.estudiante?.id]: [...(acc[p.estudiante?.id] || []), p],
  }), {})).map((lista) => ({
    p: lista[0],
    general: promedio(lista.map((x) => x.promedio)),
    riesgo: [...new Set(lista.filter((x) => x.promedio < NOTA_MINIMA).map((x) => x.asignatura))],
  }));
  if (f.umbral === 'riesgo') estudiantes = estudiantes.filter((e) => e.riesgo.length > 0);
  if (f.umbral === 'excelentes') estudiantes = estudiantes.filter((e) => e.general >= 9);
  return {
    kpis: [
      { etiqueta: 'Estudiantes', valor: estudiantes.length, detalle: 'En el reporte' },
      { etiqueta: 'Promedio general', valor: formatoNota(promedio(estudiantes.map((e) => e.general))), detalle: 'Escala 0–10' },
      { etiqueta: 'Con materias en riesgo', valor: estudiantes.filter((e) => e.riesgo.length).length, detalle: `Promedio < ${NOTA_MINIMA}` },
      { etiqueta: 'Excelentes', valor: estudiantes.filter((e) => e.general >= 9).length, detalle: 'Promedio ≥ 9' },
    ],
    grafico: {
      tipo: 'pastel',
      titulo: 'Distribución por nivel',
      datos: NIVELES_NOTA.map((n) => ({
        nombre: n.etiqueta,
        valor: estudiantes.filter((e) => nivelNota(e.general).clave === n.clave).length,
        color: n.color,
      })),
    },
    columnas: ['Estudiante', 'NIE', 'Grado', 'Sección', 'Promedio general', 'Nivel', 'Asignaturas en riesgo'],
    filas: estudiantes
      .sort((a, b) => a.general - b.general)
      .map((e) => [nombreCompleto(e.p.estudiante), e.p.estudiante?.codigo_nie, e.p.grado, e.p.seccion,
        formatoNota(e.general), nivelNota(e.general).etiqueta, e.riesgo.join(', ') || '—']),
  };
}

// Las boletas muestran un decimal; se redondea antes de promediar y calificar el desempeño
// para que lo impreso sea coherente (6.93 se imprime 6.9, no 7.0 con desempeño "Bueno").
function unDecimal(nota) {
  return nota === null ? null : Math.round(nota * 10) / 10;
}

// Boleta individual: nota de cada asignatura por período y promedio final de la asignatura.
function construirBoleta(lista, periodos, ciclo) {
  const asignaturas = [...new Set(lista.map((p) => p.asignatura))].sort();
  const filas = asignaturas.map((asignatura) => {
    const notas = Object.fromEntries(periodos.map((periodo) => [periodo, unDecimal(promedio(lista
      .filter((p) => p.asignatura === asignatura && String(p.periodo) === String(periodo)).map((p) => p.promedio)))]));
    return { asignatura, notas, final: unDecimal(promedio(Object.values(notas).filter((n) => n !== null))) };
  });
  const finales = filas.map((x) => x.final).filter((n) => n !== null);
  return {
    estudiante: lista[0].estudiante,
    grado: lista[0].grado,
    seccion: lista[0].seccion,
    ciclo: ciclo ? `Año escolar ${String(ciclo.fecha_inicio).slice(0, 4)}` : '',
    periodos,
    filas,
    general: unDecimal(promedio(finales)),
  };
}

function reporteBoletasIndividuales(f, promedios, ciclos) {
  const periodos = f.periodo ? [f.periodo] : Object.keys(PERIODOS);
  const porEstudiante = promedios
    .filter((p) => f.estudiante === TODA_LA_SECCION || String(p.estudiante?.id) === f.estudiante)
    .reduce((acc, p) => ({ ...acc, [p.estudiante?.id]: [...(acc[p.estudiante?.id] || []), p] }), {});
  const ciclo = ciclos.find((c) => String(c.id) === f.ciclo);
  const boletas = Object.values(porEstudiante).map((lista) => construirBoleta(lista, periodos, ciclo))
    .sort((a, b) => nombreCompleto(a.estudiante).localeCompare(nombreCompleto(b.estudiante)));
  return {
    boletas,
    kpis: [],
    grafico: null,
    columnas: ['Estudiante', 'NIE', 'Asignatura', ...periodos.map((p) => PERIODOS[p]), 'Promedio'],
    filas: boletas.flatMap((b) => b.filas.map((x) => [
      nombreCompleto(b.estudiante), b.estudiante?.codigo_nie, x.asignatura,
      ...periodos.map((p) => formatoNota(x.notas[p] ?? null)), formatoNota(x.final)])),
  };
}

async function reporteBoletas(f) {
  const datos = await cargarCalificaciones();
  const promedios = datos.promedios.filter((p) => p.promedio !== null && coincide(p.idCiclo, f.ciclo)
    && coincide(p.idGrado, f.grado) && coincide(p.seccion, f.seccion) && coincide(p.periodo, f.periodo));
  if (f.estudiante) return reporteBoletasIndividuales(f, promedios, datos.ciclos);
  const asignaturas = [...new Set(promedios.map((p) => p.asignatura))].sort();
  const estudiantes = Object.values(promedios.reduce((acc, p) => ({
    ...acc, [p.estudiante?.id]: [...(acc[p.estudiante?.id] || []), p],
  }), {}));
  const filas = estudiantes.map((lista) => {
    const notas = asignaturas.map((a) => promedio(lista.filter((p) => p.asignatura === a).map((p) => p.promedio)));
    return {
      lista, notas, general: promedio(notas.filter((n) => n !== null)),
    };
  }).sort((a, b) => nombreCompleto(a.lista[0].estudiante).localeCompare(nombreCompleto(b.lista[0].estudiante)));
  return {
    kpis: [
      { etiqueta: 'Boletas', valor: filas.length, detalle: 'Estudiantes' },
      { etiqueta: 'Asignaturas', valor: asignaturas.length, detalle: 'Evaluadas' },
      { etiqueta: 'Promedio de la sección', valor: formatoNota(promedio(filas.map((x) => x.general).filter((n) => n !== null))), detalle: 'Escala 0–10' },
      { etiqueta: 'Con promedio < 5', valor: filas.filter((x) => x.general < NOTA_MINIMA).length, detalle: 'Requieren refuerzo' },
    ],
    grafico: null,
    columnas: ['Estudiante', 'NIE', ...asignaturas, 'Promedio'],
    filas: filas.map((x) => [nombreCompleto(x.lista[0].estudiante), x.lista[0].estudiante?.codigo_nie,
      ...x.notas.map(formatoNota), formatoNota(x.general)]),
  };
}

async function reporteMatriculas(f) {
  const datos = await cargarMatriculas();
  const lista = datos.matriculas.filter((m) => coincide(m.id_ciclo, f.ciclo) && coincide(m.idGrado, f.grado)
    && coincide(m.estadoTexto, f.estado));
  const secciones = datos.secciones.filter((s) => coincide(s.id_ciclo, f.ciclo));
  const capacidad = secciones.reduce((s, x) => s + (x.capacidad || 0), 0);
  const activas = lista.filter((m) => m.estado).length;
  return {
    kpis: [
      { etiqueta: 'Matrículas', valor: lista.length, detalle: 'En el reporte' },
      { etiqueta: 'Vigentes', valor: activas, detalle: 'Activas o finalizadas' },
      { etiqueta: 'Anuladas', valor: lista.length - activas, detalle: 'Retiradas' },
      { etiqueta: 'Ocupación', valor: capacidad ? `${Math.round((activas / capacidad) * 100)}%` : '—', detalle: `Capacidad ${capacidad}` },
    ],
    grafico: { tipo: 'barras', titulo: 'Matrículas por grado', datos: contarPor(lista, (m) => m.grado) },
    columnas: ['Estudiante', 'NIE', 'Ciclo', 'Grado', 'Sección', 'Fecha', 'Estado'],
    filas: lista
      .sort((a, b) => a.idGrado - b.idGrado || a.seccion.localeCompare(b.seccion))
      .map((m) => [nombreCompleto(m.estudiante), m.estudiante?.codigo_nie, String(m.ciclo?.fecha_inicio).slice(0, 4),
        m.grado, m.seccion, fechaCorta(m.fecha_matricula), m.estadoTexto]),
  };
}

async function reporteEstudiantes(f) {
  const datos = await cargarEstudiantes();
  const lista = datos.estudiantes.filter((e) => coincide(e.idGrado, f.grado) && coincide(e.activo, f.estado)
    && (!f.sexo || e.ficha?.sexo?.trim() === f.sexo));
  const sexo = (e) => ({ M: 'Masculino', F: 'Femenino' }[e.ficha?.sexo?.trim()] || 'Sin dato');
  return {
    kpis: [
      { etiqueta: 'Estudiantes', valor: lista.length, detalle: 'En el reporte' },
      { etiqueta: 'Activos', valor: lista.filter((e) => e.activo).length, detalle: 'Estado activo' },
      { etiqueta: 'Femenino', valor: lista.filter((e) => sexo(e) === 'Femenino').length, detalle: 'Según ficha' },
      { etiqueta: 'Masculino', valor: lista.filter((e) => sexo(e) === 'Masculino').length, detalle: 'Según ficha' },
    ],
    grafico: { tipo: 'pastel', titulo: 'Estudiantes por sexo', datos: contarPor(lista, sexo) },
    columnas: ['Estudiante', 'NIE', 'Grado', 'Sección', 'Sexo', 'Fecha de nacimiento', 'Correo', 'Estado'],
    filas: lista
      .sort((a, b) => (a.idGrado || 99) - (b.idGrado || 99) || a.apellidos.localeCompare(b.apellidos))
      .map((e) => [nombreCompleto(e), e.codigo_nie, e.grado || 'Sin matrícula', e.seccion || '—', sexo(e),
        fechaCorta(e.ficha?.fecha_nacimiento), e.correo || '—', e.activo ? 'Activo' : 'Inactivo']),
  };
}

async function reportePagos(f) {
  const datos = await cargarFinanzas();
  const cuentas = datos.cuentas.filter((c) => coincide(c.concepto, f.concepto) && coincide(c.estado, f.estado)
    && (!f.desde || String(c.fecha_vencimiento) >= f.desde) && (!f.hasta || String(c.fecha_vencimiento) <= f.hasta));
  const suma = (lista, campo) => lista.reduce((s, c) => s + c[campo], 0);
  return {
    kpis: [
      { etiqueta: 'Total facturado', valor: dinero(suma(cuentas, 'total')), detalle: `${cuentas.length} cuentas` },
      { etiqueta: 'Recaudado', valor: dinero(suma(cuentas, 'abonado')), detalle: 'Pagos aplicados' },
      { etiqueta: 'Saldo pendiente', valor: dinero(suma(cuentas.filter((c) => c.estado === 'pendiente'), 'saldo')), detalle: 'Por vencer' },
      { etiqueta: 'Saldo vencido', valor: dinero(suma(cuentas.filter((c) => c.estado === 'vencido'), 'saldo')), detalle: 'En mora' },
    ],
    grafico: { tipo: 'pastel', titulo: 'Cuentas por estado', datos: contarPor(cuentas, (c) => ESTADOS_CUENTA[c.estado]) },
    columnas: ['Estudiante', 'NIE', 'Concepto', 'Vencimiento', 'Total', 'Abonado', 'Saldo', 'Estado'],
    filas: cuentas
      .sort((a, b) => String(a.fecha_vencimiento).localeCompare(String(b.fecha_vencimiento)))
      .map((c) => [nombreCompleto(c.estudiante), c.estudiante?.codigo_nie, c.concepto, fechaCorta(c.fecha_vencimiento),
        dinero(c.total), dinero(c.abonado), dinero(c.saldo), ESTADOS_CUENTA[c.estado]]),
  };
}

async function reporteEstadosCuenta(f) {
  const datos = await cargarFinanzas();
  const estados = datos.estudiantes.filter((e) => coincide(e.idGrado, f.grado)).map((e) => {
    const cuentas = datos.cuentas.filter((c) => c.id_estudiante === e.id);
    const vencido = cuentas.filter((c) => c.estado === 'vencido').reduce((s, c) => s + c.saldo, 0);
    const pendiente = cuentas.filter((c) => c.estado === 'pendiente').reduce((s, c) => s + c.saldo, 0);
    let situacion = 'Al día';
    if (vencido > 0) situacion = 'Vencido';
    else if (pendiente > 0) situacion = 'Con deuda';
    return {
      e, cuentas, vencido, pendiente, situacion, pagado: cuentas.reduce((s, c) => s + c.abonado, 0),
    };
  }).filter((x) => x.cuentas.length && (!f.situacion || x.situacion === f.situacion));
  return {
    kpis: [
      { etiqueta: 'Estudiantes', valor: estados.length, detalle: 'Con cuentas' },
      { etiqueta: 'Al día', valor: estados.filter((x) => x.situacion === 'Al día').length, detalle: 'Sin saldo' },
      { etiqueta: 'Con saldo vencido', valor: estados.filter((x) => x.situacion === 'Vencido').length, detalle: 'En mora' },
      { etiqueta: 'Saldo total', valor: dinero(estados.reduce((s, x) => s + x.vencido + x.pendiente, 0)), detalle: 'Pendiente + vencido' },
    ],
    grafico: { tipo: 'pastel', titulo: 'Situación de pago', datos: contarPor(estados, (x) => x.situacion) },
    columnas: ['Estudiante', 'NIE', 'Grado', 'Cuentas', 'Pagado', 'Pendiente', 'Vencido', 'Situación'],
    filas: estados
      .sort((a, b) => b.vencido - a.vencido || b.pendiente - a.pendiente)
      .map((x) => [nombreCompleto(x.e), x.e.codigo_nie, x.e.grado || '—', x.cuentas.length, dinero(x.pagado),
        dinero(x.pendiente), dinero(x.vencido), x.situacion]),
  };
}

const REPORTES = [
  {
    id: 'calificaciones',
    etiqueta: 'Calificaciones',
    descripcion: 'Promedios por estudiante, asignatura y período',
    categoria: 'academico',
    color: '#c2416b',
    icono: BookOpen,
    filtros: [filtroCiclo, filtroPeriodo, filtroGrado, filtroSeccion,
      { id: 'asignatura', etiqueta: 'Asignatura', opciones: (c) => c.asignaturas.map((a) => [a, a]) }],
    generar: reporteCalificaciones,
  },
  {
    id: 'asistencia',
    etiqueta: 'Asistencia',
    descripcion: 'Porcentaje de asistencia por estudiante',
    categoria: 'academico',
    color: '#10B981',
    icono: Calendar,
    filtros: [filtroCiclo, { id: 'desde', etiqueta: 'Desde', tipo: 'fecha' }, { id: 'hasta', etiqueta: 'Hasta', tipo: 'fecha' },
      filtroGrado, filtroSeccion],
    generar: reporteAsistencia,
  },
  {
    id: 'rendimiento',
    etiqueta: 'Rendimiento',
    descripcion: 'Promedio general y asignaturas en riesgo',
    categoria: 'academico',
    color: '#8B5CF6',
    icono: TrendingUp,
    filtros: [filtroCiclo, filtroPeriodo, filtroGrado, {
      id: 'umbral',
      etiqueta: 'Mostrar',
      opciones: () => [['riesgo', 'Solo con materias en riesgo'], ['excelentes', 'Solo excelentes']],
      vacio: 'Todos los estudiantes',
    }],
    generar: reporteRendimiento,
  },
  {
    id: 'boletas',
    etiqueta: 'Boletas',
    descripcion: 'Notas de una sección o boleta individual de cada estudiante para imprimir',
    categoria: 'academico',
    color: '#F59E0B',
    icono: FileText,
    filtros: [
      filtroCiclo, { ...filtroGrado, requerido: true }, { ...filtroSeccion, requerido: true },
      filtroEstudianteBoleta, filtroPeriodo,
    ],
    generar: reporteBoletas,
  },
  {
    id: 'matriculas',
    etiqueta: 'Matrículas',
    descripcion: 'Matrículas por ciclo, grado y estado',
    categoria: 'administrativo',
    color: '#EC4899',
    icono: ClipboardList,
    filtros: [filtroCiclo, filtroGrado, {
      id: 'estado', etiqueta: 'Estado', opciones: () => ['Activa', 'Finalizada', 'Anulada'].map((e) => [e, e]),
    }],
    generar: reporteMatriculas,
  },
  {
    id: 'estudiantes',
    etiqueta: 'Estudiantes',
    descripcion: 'Listado de estudiantes con su grado actual',
    categoria: 'administrativo',
    color: '#60A5FA',
    icono: Users,
    filtros: [filtroGrado, { id: 'estado', etiqueta: 'Estado', opciones: () => [['true', 'Activo'], ['false', 'Inactivo']] },
      { id: 'sexo', etiqueta: 'Sexo', opciones: () => [['M', 'Masculino'], ['F', 'Femenino']] }],
    generar: reporteEstudiantes,
  },
  {
    id: 'pagos',
    etiqueta: 'Pagos',
    descripcion: 'Cuentas por cobrar, abonos y saldos',
    categoria: 'administrativo',
    color: '#34D399',
    icono: CreditCard,
    filtros: [{ id: 'desde', etiqueta: 'Vence desde', tipo: 'fecha' }, { id: 'hasta', etiqueta: 'Vence hasta', tipo: 'fecha' },
      { id: 'concepto', etiqueta: 'Concepto', opciones: (c) => c.conceptos.map((x) => [x, x]) },
      { id: 'estado', etiqueta: 'Estado', opciones: () => Object.entries(ESTADOS_CUENTA) }],
    generar: reportePagos,
  },
  {
    id: 'estados-cuenta',
    etiqueta: 'Estados de cuenta',
    descripcion: 'Situación de pago de cada estudiante',
    categoria: 'administrativo',
    color: '#F87171',
    icono: GraduationCap,
    filtros: [filtroGrado, {
      id: 'situacion', etiqueta: 'Situación', opciones: () => ['Al día', 'Con deuda', 'Vencido'].map((s) => [s, s]),
    }],
    generar: reporteEstadosCuenta,
  },
];

export default REPORTES;
