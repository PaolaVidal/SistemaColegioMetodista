import Boton from './Boton';
import Modal from './Modal';

export default function ConfirmDialog({
  titulo, mensaje, textoConfirmar = 'Confirmar', procesando = false, onConfirm, onCancel,
}) {
  return (
    <Modal
      titulo={titulo}
      onClose={onCancel}
      ancho="max-w-md"
      pie={(
        <>
          <Boton variante="secundario" onClick={onCancel} deshabilitado={procesando}>Cancelar</Boton>
          <Boton variante="peligro" onClick={onConfirm} deshabilitado={procesando}>
            {procesando ? 'Procesando...' : textoConfirmar}
          </Boton>
        </>
      )}
    >
      <p className="text-sm text-gray-300">{mensaje}</p>
    </Modal>
  );
}
