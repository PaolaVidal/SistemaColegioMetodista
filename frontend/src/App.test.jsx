import { render, screen } from '@testing-library/react';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import App from './App';
import { obtenerUsuarioActual } from './services/auth';
import useAuthStore from './store/authStore';

import './index.css';

vi.mock('./services/auth', () => ({
  obtenerUsuarioActual: vi.fn(),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    useAuthStore.setState({ usuario: null, estado: 'verificando' });
  });

  it('shows the login page when there is no active session', async () => {
    obtenerUsuarioActual.mockRejectedValue(new Error('401'));
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo o nombre de usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  it('sends non administrator roles to their portal', async () => {
    obtenerUsuarioActual.mockResolvedValue({ id: 1, nombre_usuario: 'docente1', rol: 'docente' });
    window.history.pushState({}, '', '/admin');

    render(<App />);

    expect(await screen.findByText(/El portal para su rol estará disponible/i)).toBeInTheDocument();
  });
});
