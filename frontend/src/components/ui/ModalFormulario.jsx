import { useState } from 'react';
import { mensajeError } from '../../services/api';
import Alerta from './Alerta';
import Boton from './Boton';
import Modal from './Modal';

// Modal con botones Cancelar/Guardar que ejecuta `onGuardar` y muestra el error de la API si falla.
export default function ModalFormulario({
  titulo, subtitulo, textoGuardar = 'Guardar', validar, onGuardar, onClose, children, ancho = 'max-w-lg',
}) {
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    const problema = validar ? validar() : '';
    if (problema) {
      setError(problema);
      return;
    }
    setError('');
    setGuardando(true);
    try {
      await onGuardar();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar.'));
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={titulo}
      subtitulo={subtitulo}
      ancho={ancho}
      onClose={onClose}
      pie={(
        <>
          <Boton variante="secundario" onClick={onClose} deshabilitado={guardando}>Cancelar</Boton>
          <Boton onClick={guardar} deshabilitado={guardando}>{guardando ? 'Guardando...' : textoGuardar}</Boton>
        </>
      )}
    >
      <Alerta>{error}</Alerta>
      {children}
    </Modal>
  );
}
