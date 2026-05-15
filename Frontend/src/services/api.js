// src/services/api.js
// ─────────────────────────────────────────────────────────────
// Capa de servicio: centraliza todos los requests HTTP al backend.
// URL base leída desde .env → VITE_API_URL
//
// Contrato con el backend (openapi.json):
//   POST /optimize
//   Body: { locations: Location[], mode: "open" | "closed" }
//   Location: { id, address, lat, lng }
// ─────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

/**
 * Envía el payload de optimización al backend.
 *
 * @param {{ locations: Location[], mode: "open"|"closed" }} payload
 * @returns {Promise<{ data: any|null, error: string|null }>}
 */
export async function optimizeRoute(payload) {
  try {
    const response = await fetch(`${API_URL}/optimize`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    // Error HTTP (422 Pydantic, 500, etc.)
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      const detail = body?.detail?.[0]?.msg ?? `Error ${response.status}`
      return { data: null, error: detail }
    }

    const data = await response.json()
    return { data, error: null }

  } catch (err) {
    // Error de red (backend caído, CORS, etc.)
    const isNetwork = err instanceof TypeError
    return {
      data:  null,
      error: isNetwork
        ? 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
        : err.message,
    }
  }
}