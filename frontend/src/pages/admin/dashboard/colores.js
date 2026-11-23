// Colores de los gráficos (Recharts necesita valores literales, no clases de Tailwind).
const COLORES = {
  brand: '#c2416b',
  brandOscuro: '#8e2440',
  brandSuave: '#e58fa8',
  linea: '#3d262d',
  base: '#1d1215',
  eje: '#8b7a80',
  exito: '#10B981',
  aviso: '#F59E0B',
  peligro: '#EF4444',
  info: '#A78BFA',
};

export const COLOR_ASISTENCIA = {
  Presente: COLORES.exito,
  Tardanza: COLORES.aviso,
  Justificado: COLORES.info,
  Ausente: COLORES.peligro,
};

export const COLOR_CUENTA = {
  pagado: COLORES.brand,
  pendiente: COLORES.aviso,
  vencido: COLORES.peligro,
};

export const NOMBRE_CUENTA = { pagado: 'Pagado', pendiente: 'Pendiente', vencido: 'Vencido' };

export default COLORES;
