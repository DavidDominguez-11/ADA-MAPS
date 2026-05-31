// src/services/api.js
// ─────────────────────────────────────────────────────────────
// Cambios vs anterior:
//  - optimizeRoute recibe `token` (Firebase ID token)
//  - Header Authorization: Bearer <token> en cada request
//  - 401 → errorType 'auth' → el caller hace logout
//  - URL de producción: solo cambiar VITE_API_URL en .env
// ─────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

const ERROR_TYPES = {
  NETWORK:      'network',
  AUTH:         'auth',           // 401 — token inválido / expirado
  VALIDATION:   'validation',     // 422 — payload inválido
  GOOGLE_API:   'google_api',     // 502/503 o fallo en Distance Matrix
  OPTIMIZATION: 'optimization',   // 500 — error del algoritmo
  UNKNOWN:      'unknown',
}

function classifyError(status, body) {
  if (status === 401)                             return ERROR_TYPES.AUTH
  if (status === 422)                             return ERROR_TYPES.VALIDATION
  if (status === 503 || status === 502)           return ERROR_TYPES.GOOGLE_API
  if (body?.detail?.includes?.('google'))         return ERROR_TYPES.GOOGLE_API
  if (body?.detail?.includes?.('matrix'))         return ERROR_TYPES.GOOGLE_API
  if (body?.detail?.includes?.('optim'))          return ERROR_TYPES.OPTIMIZATION
  if (status >= 500)                              return ERROR_TYPES.OPTIMIZATION
  return ERROR_TYPES.UNKNOWN
}

/**
 * POST /optimize
 *
 * @param {{ locations: Location[], mode: "open"|"closed" }} payload
 * @param {string} token  Firebase ID token — adjuntado como Bearer
 * @returns {Promise<{ data: any|null, error: string|null, errorType: string|null }>}
 */
export async function optimizeRoute(payload, token) {
  try {
    const response = await fetch(`${API_URL}/optimize`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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