/** Backend origin (no trailing slash). Set VITE_API_URL on Vercel for production. */
export function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }
  return "https://quantrisk-backend.onrender.com";
}

export const API_BASE = resolveApiBase();

export const OPENAPI_URL = `${API_BASE}/api/openapi.json`;

export function resolveWebSocketBase(): string {
  return API_BASE.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
}
