// Escala de 0 a 10. El backend marca "en riesgo" un promedio ponderado menor que 5.
export const NOTA_MINIMA = 5;

export const NIVELES_NOTA = [
  {
    clave: 'excelente', etiqueta: 'Excelente', rango: '9–10', minimo: 9, color: '#A78BFA',
  },
  {
    clave: 'muy-bueno', etiqueta: 'Muy bueno', rango: '7–8.9', minimo: 7, color: '#10B981',
  },
  {
    clave: 'bueno', etiqueta: 'Bueno', rango: '5–6.9', minimo: NOTA_MINIMA, color: '#F59E0B',
  },
  {
    clave: 'riesgo', etiqueta: 'En riesgo', rango: '<5', minimo: -Infinity, color: '#EF4444',
  },
];

export function nivelNota(nota) {
  return NIVELES_NOTA.find((n) => Number(nota) >= n.minimo);
}

export function colorNota(nota) {
  if (nota === null || nota === undefined || Number.isNaN(Number(nota))) return '#9CA3AF';
  return nivelNota(nota).color;
}

export function formatoNota(nota) {
  if (nota === null || nota === undefined) return '—';
  return Number(nota).toFixed(1);
}

export function promedio(valores) {
  if (!valores.length) return null;
  return Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 100) / 100;
}

// Promedio ponderado igual al que calcula el backend: Σ(nota × ponderación) / Σ ponderación.
export function promedioPonderado(registros) {
  const pesos = registros.reduce((s, r) => s + r.ponderacion, 0);
  if (!pesos) return null;
  return Math.round((registros.reduce((s, r) => s + r.nota * r.ponderacion, 0) / pesos) * 100) / 100;
}

export const PERIODOS = { 1: 'I Trimestre', 2: 'II Trimestre', 3: 'III Trimestre' };

export function nombrePeriodo(periodo) {
  return PERIODOS[periodo] || `Período ${periodo}`;
}
