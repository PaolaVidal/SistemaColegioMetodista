const BOM = String.fromCharCode(0xfeff);
const SALTO = String.fromCharCode(13, 10);

function celdaCsv(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  return /[",;\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

// Descarga una tabla como CSV (separado por ";" y con BOM para que Excel respete las tildes).
export default function descargarCsv(nombreArchivo, columnas, filas) {
  const lineas = [columnas, ...filas].map((fila) => fila.map(celdaCsv).join(';'));
  const blob = new Blob([BOM, lineas.join(SALTO)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
