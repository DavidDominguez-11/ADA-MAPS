// src/services/api.js
// ─────────────────────────────────────────────────────────────
// Cambios vs anterior:
//  - Retorna `errorType` junto a `error` para que el frontend
//    pueda mostrar mensajes distintos por categoría de fallo
// ─────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

// Categorías de error que el frontend puede distinguir visualmente
// 'network'      → backend caído / sin conexión
// 'validation'   → payload inválido (422 Pydantic)
// 'google_api'   → fallo en Distance Matrix / Places API
// 'optimization' → error interno del algoritmo
// 'unknown'      → cualquier otro 4xx / 5xx
const ERROR_TYPES = {
  NETWORK:      'network',
  VALIDATION:   'validation',
  GOOGLE_API:   'google_api',
  OPTIMIZATION: 'optimization',
  UNKNOWN:      'unknown',
}

/**
 * Clasifica el tipo de error según el status HTTP y el cuerpo del response.
 */
function classifyError(status, body) {
  if (status === 422)                         return ERROR_TYPES.VALIDATION
  if (status === 503 || status === 502)       return ERROR_TYPES.GOOGLE_API
  if (body?.detail?.includes?.('google'))     return ERROR_TYPES.GOOGLE_API
  if (body?.detail?.includes?.('matrix'))     return ERROR_TYPES.GOOGLE_API
  if (body?.detail?.includes?.('optim'))      return ERROR_TYPES.OPTIMIZATION
  if (status >= 500)                          return ERROR_TYPES.OPTIMIZATION
  return ERROR_TYPES.UNKNOWN
}

/**
 * Envía el payload de optimización al backend.
 *
 * @param {{ locations: Location[], mode: "open"|"closed" }} payload
 * @returns {Promise<{ data: any|null, error: string|null, errorType: string|null }>}
 */
export async function optimizeRoute(payload) {
  try {
    const response = await fetch(`${API_URL}/optimize`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      const detail    = body?.detail?.[0]?.msg ?? body?.detail ?? `Error ${response.status}`
      const errorType = classifyError(response.status, body)
      return { data: null, error: String(detail), errorType }
    }

    return { data: body, error: null, errorType: null }

  } catch (err) {
    return {
      data:      null,
      error:     err instanceof TypeError
                   ? 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
                   : err.message,
      errorType: ERROR_TYPES.NETWORK,
    }
  }
}