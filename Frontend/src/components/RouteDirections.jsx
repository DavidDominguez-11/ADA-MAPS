// src/components/RouteDirections.jsx
// ─────────────────────────────────────────────────────────────
// Responsabilidad única:
//  - Recibe route (índices), locations, routeMode y mapInstance
//  - Construye el DirectionsRequest (origin, destination, waypoints)
//  - Llama a Google Directions Service
//  - Renderiza <DirectionsRenderer> con la ruta real en carreteras
//  - Llama fitBounds sobre el bounds real de la ruta
//
// Límite Google: 25 waypoints (plan estándar).
// Este proyecto permite 15 destinos → 13 waypoints → dentro del límite.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { DirectionsRenderer }  from '@react-google-maps/api'

const POLYLINE_OPTIONS = {
  strokeColor:   '#1D4ED8',
  strokeOpacity: 0.85,
  strokeWeight:  4,
  geodesic:      true,
}

/**
 * Construye el DirectionsRequest a partir del array de índices.
 *
 * route = [0, 2, 3, 1], routeMode = "open"
 *   → origin      = locations[0]
 *   → waypoints   = [locations[2], locations[3]]
 *   → destination = locations[1]
 *
 * route = [0, 2, 3, 1], routeMode = "closed"
 *   → origin      = locations[0]
 *   → waypoints   = [locations[2], locations[3], locations[1]]
 *   → destination = locations[0]   ← regresa al inicio
 */
function buildDirectionsRequest(route, validLocs, routeMode) {
  const ordered = route.map(idx => validLocs[idx])
  if (ordered.length < 2) return null

  const toLatLng = (loc) => ({ lat: loc.lat, lng: loc.lng })

  const isOpen = routeMode === 'open'

  const origin      = toLatLng(ordered[0])
  const destination = isOpen ? toLatLng(ordered[ordered.length - 1]) : toLatLng(ordered[0])

  // Para open:   intermedios son todo excepto primer y último
  // Para closed: intermedios son todo excepto el primero (el último vuelve al origen)
  const middleLocs = isOpen ? ordered.slice(1, -1) : ordered.slice(1)

  const waypoints = middleLocs.map(loc => ({
    location: toLatLng(loc),
    stopover: true,
  }))

  return {
    origin,
    destination,
    waypoints,
    travelMode:         window.google.maps.TravelMode.DRIVING,
    optimizeWaypoints:  false, // el backend ya optimizó el orden
  }
}

export default function RouteDirections({ route, locations, routeMode, mapInstance }) {
  const [directions, setDirections] = useState(null)
  const [dirError,   setDirError]   = useState(null)

  useEffect(() => {
    // Limpiar resultado anterior al cambiar inputs
    setDirections(null)
    setDirError(null)

    if (!route || !mapInstance || !window.google) return

    const validLocs = locations.filter(l => l.lat !== null && l.lng !== null)
    const request   = buildDirectionsRequest(route, validLocs, routeMode)
    if (!request) return

    const service = new window.google.maps.DirectionsService()

    service.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirections(result)

        // fitBounds usando el bounds real de la ruta (incluye curvas de carretera)
        if (result.routes[0]?.bounds) {
          mapInstance.fitBounds(result.routes[0].bounds, { padding: 80 })
        }
      } else {
        setDirError(status)
        console.error('[RouteDirections] Directions API error:', status)
      }
    })

    // Cleanup: si route cambia antes de que responda, ignorar resultado anterior
    return () => {
      setDirections(null)
    }
  }, [route, locations, routeMode, mapInstance])

  // Error de Directions API — silencioso en el mapa, visible en consola
  // (el panel de resultados ya muestra el resumen; no duplicar UI de error aquí)
  if (dirError) {
    console.warn('[RouteDirections] No se pudo trazar la ruta real:', dirError)
    return null
  }

  if (!directions) return null

  return (
    <DirectionsRenderer
      directions={directions}
      options={{
        suppressMarkers:  true,        // usamos nuestros marcadores personalizados
        suppressInfoWindows: true,
        polylineOptions:  POLYLINE_OPTIONS,
      }}
    />
  )
}