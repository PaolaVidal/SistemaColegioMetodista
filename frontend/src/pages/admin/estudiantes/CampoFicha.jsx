import Field from '../../../components/ui/Field';
import SiNoField from '../../../components/ui/SiNoField';
import { MASCARAS } from '../../../utils/formato';

// Dibuja un campo opcional de la ficha según su definición en camposFicha.js.
export default function CampoFicha({ definicion, valor, onChange }) {
  const {
    campo, etiqueta, tipo = 'texto', max, placeholder, opciones = [], ancho = 1, mascara,
  } = definicion;

  if (tipo === 'sino') {
    return (
      <div className={ancho === 2 ? 'col-span-2' : ''}>
        <SiNoField etiqueta={etiqueta} valor={valor} onChange={onChange} />
      </div>
    );
  }

  if (tipo === 'opciones') {
    return (
      <Field id={campo} etiqueta={etiqueta} ancho={ancho}>
        <select id={campo} className="input-field" value={valor} onChange={(e) => onChange(e.target.value)}>
          <option value="">Sin especificar</option>
          {opciones.map((opcion) => {
            const [clave, texto] = Array.isArray(opcion) ? opcion : [opcion, opcion];
            return <option key={clave} value={clave}>{texto}</option>;
          })}
        </select>
      </Field>
    );
  }

  return (
    <Field id={campo} etiqueta={etiqueta} ancho={ancho}>
      <input
        id={campo}
        type={tipo === 'fecha' ? 'date' : 'text'}
        inputMode={mascara ? 'numeric' : undefined}
        className="input-field"
        maxLength={max}
        value={valor}
        placeholder={placeholder || 'Opcional'}
        onChange={(e) => onChange(mascara ? MASCARAS[mascara](e.target.value) : e.target.value)}
      />
    </Field>
  );
}
