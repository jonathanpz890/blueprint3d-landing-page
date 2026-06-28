/**
 * Central API config — reads from VITE_API_URL env variable.
 * Set this in .env for local dev, and in Netlify env vars for production.
 */
const SERVER_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';

export const API_BASE = `${SERVER_BASE}/api`;
export { SERVER_BASE };
