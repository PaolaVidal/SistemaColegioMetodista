import { create } from 'zustand';
import * as authService from '../services/auth';

// estado: 'verificando' | 'autenticado' | 'invitado'
const useAuthStore = create((set) => ({
  usuario: null,
  estado: 'verificando',

  verificarSesion: async () => {
    try {
      const usuario = await authService.obtenerUsuarioActual();
      set({ usuario, estado: 'autenticado' });
    } catch {
      set({ usuario: null, estado: 'invitado' });
    }
  },

  iniciarSesion: async (identificador, contrasena) => {
    const usuario = await authService.iniciarSesion(identificador, contrasena);
    set({ usuario, estado: 'autenticado' });
    return usuario;
  },

  cerrarSesion: async () => {
    try {
      await authService.cerrarSesion();
    } finally {
      set({ usuario: null, estado: 'invitado' });
    }
  },
}));

export default useAuthStore;
