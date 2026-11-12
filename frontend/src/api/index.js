// API entrypoint for frontend
// En desarrollo se usa el proxy de Vite (mismo origen); en producción, VITE_API_URL.

const BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'http://localhost:8000');

export default BASE_URL;
