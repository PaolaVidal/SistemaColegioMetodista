import {
  FileText, Home, UserRound, Users,
} from 'lucide-react';

// Campos opcionales de ficha_estudiante agrupados por sección del formulario.
// tipo: texto | fecha | sino | opciones; max coincide con el tamaño de la columna en la base.
// mascara: dui | telefono agrega el guion automáticamente.
const ESTADOS_FAMILIARES = ['Soltero', 'Casado', 'Acompañado', 'Divorciado', 'Viudo'];
const DEPARTAMENTOS = [
  'Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán', 'La Libertad', 'La Paz', 'La Unión', 'Morazán',
  'San Miguel', 'San Salvador', 'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulután',
];

function datosPadre(sufijo, titulo) {
  return {
    titulo,
    icono: UserRound,
    campos: [
      {
        campo: `nombre_${sufijo}`, etiqueta: 'Nombre completo', max: 60, ancho: 2,
      },
      {
        campo: `dui_${sufijo}`, etiqueta: 'DUI', max: 10, placeholder: '00000000-0', mascara: 'dui',
      },
      {
        campo: `telefono_${sufijo}`, etiqueta: 'Teléfono', max: 9, placeholder: '0000-0000', mascara: 'telefono',
      },
      { campo: `fecha_nacimiento_${sufijo}`, etiqueta: 'Fecha de nacimiento', tipo: 'fecha' },
      { campo: `profesion_${sufijo}`, etiqueta: 'Profesión u oficio' },
      { campo: `lugar_trabajo_${sufijo}`, etiqueta: 'Lugar de trabajo', ancho: 2 },
      { campo: `direccion_${sufijo}`, etiqueta: 'Dirección', ancho: 2 },
    ],
  };
}

export const SECCIONES_FICHA = [
  {
    titulo: 'Residencia',
    icono: Home,
    campos: [
      {
        campo: 'residencia_estudiante', etiqueta: 'Residencia', max: 50, placeholder: 'Ej: Casa familiar',
      },
      {
        campo: 'zona', etiqueta: 'Zona', tipo: 'opciones', opciones: ['Urbana', 'Rural'],
      },
      {
        campo: 'departamento', etiqueta: 'Departamento', tipo: 'opciones', opciones: DEPARTAMENTOS,
      },
      { campo: 'municipio', etiqueta: 'Municipio', max: 50 },
      { campo: 'canton', etiqueta: 'Cantón', max: 50 },
      { campo: 'caserio', etiqueta: 'Caserío', max: 50 },
    ],
  },
  {
    titulo: 'Documentación entregada',
    icono: FileText,
    campos: [
      { campo: 'certificado', etiqueta: '¿Entregó certificado?', tipo: 'sino' },
      { campo: 'boleta_calificaciones', etiqueta: '¿Entregó boleta de calificaciones?', tipo: 'sino' },
      { campo: 'fotocopia_dui', etiqueta: '¿Entregó fotocopia de DUI del responsable?', tipo: 'sino' },
      { campo: 'carta_pastoral', etiqueta: '¿Entregó carta pastoral?', tipo: 'sino' },
      { campo: 'nombre_iglesia_asiste', etiqueta: 'Iglesia a la que asiste', ancho: 2 },
      { campo: 'numero_partida_nacimiento', etiqueta: 'N.º de partida de nacimiento' },
      { campo: 'folio_partida_nacimiento', etiqueta: 'Folio' },
      { campo: 'tomo_partida_nacimiento', etiqueta: 'Tomo' },
      { campo: 'libro_partida_nacimiento', etiqueta: 'Libro' },
    ],
  },
  datosPadre('madre', 'Datos de la madre'),
  datosPadre('padre', 'Datos del padre'),
  {
    titulo: 'Datos del responsable',
    icono: Users,
    campos: [
      {
        campo: 'sexo_responsable', etiqueta: 'Sexo del responsable', tipo: 'opciones', opciones: [['M', 'Masculino'], ['F', 'Femenino']],
      },
      { campo: 'fecha_nacimiento_responsable', etiqueta: 'Fecha de nacimiento del responsable', tipo: 'fecha' },
      {
        campo: 'estado_familiar', etiqueta: 'Estado familiar', tipo: 'opciones', opciones: ESTADOS_FAMILIARES,
      },
      { campo: 'vive_con_estudiante', etiqueta: '¿Vive con el estudiante?', tipo: 'sino' },
    ],
  },
];

export const CAMPOS_FICHA = SECCIONES_FICHA.flatMap((s) => s.campos);
