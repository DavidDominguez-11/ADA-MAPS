// src/utils/haversine.js
// ─────────────────────────────────────────────────────────────
// Fórmula Haversine para calcular distancia entre dos coordenadas
// y validar que todos los puntos estén dentro de 100 km entre sí.
// ─────────────────────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371
const MAX_DISTANCE_KM = 100

/**
 * Distancia en km entre dos puntos (lat/lng en grados decimales).
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a))
}

/**
 * Valida que todos los pares de destinos estén dentro de MAX_DISTANCE_KM.
 *
 * @param {Array} locations  - array de { id, address, lat, lng }
 * @returns {{ valid: boolean, distanceKm: number|null, pair: [string,string]|null }}
 */
export function validateRadius(locations) {
  const withCoords = locations.filter(l => l.lat !== null && l.lng !== null)

  // Con menos de 2 puntos con coords no hay nada que validar aún
  if (withCoords.length < 2) {
    return { valid: true, distanceKm: null, pair: null }
  }

  for (let i = 0; i < withCoords.length; i++) {
    for (let j = i + 1; j < withCoords.length; j++) {
      const a = withCoords[i]
      const b = withCoords[j]
      const km = haversineKm(a.lat, a.lng, b.lat, b.lng)

      if (km > MAX_DISTANCE_KM) {
        return {
          valid:       false,
          distanceKm:  Math.round(km),
          pair:        [a.address || `Destino ${i + 1}`, b.address || `Destino ${j + 1}`],
        }
      }
    }
  }

  return { valid: true, distanceKm: null, pair: null }
}