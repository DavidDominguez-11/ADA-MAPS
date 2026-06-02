// src/components/RouteDirections.jsx — ADA Maps v4
// Cada segmento A→B, B→C, C→D se renderiza con su propio color
// usando una DirectionsRequest por par de puntos consecutivos.

import { useState, useEffect, useRef } from 'react'
import { DirectionsRenderer } from '@react-google-maps/api'

// Misma paleta que los markers — un color por índice de segmento
const SEGMENT_COLORS = [
  '#e07b4a', // coral
  '#4caf7a', // verde
  '#6b9fff', // azul
  '#c97cd4', // lila
  '#f5c842', // amarillo
  '#4cc9c9', // cian
  '#e05a8a', // rosa
  '#a3e07a', // verde lima
]

function buildSegmentRequest(origin, destination) {
  return {
    origin:      { lat: origin.lat,      lng: origin.lng },
    destination: { lat: destination.lat, lng: destination.lng },
    waypoints:   [],
    travelMode:  window.google.maps.TravelMode.DRIVING,
    optimizeWaypoints: false,
  }
}

export default function RouteDirections({ route, locations, routeMode, mapInstance }) {
  // Array de resultados de Directions, uno por segmento
  const [segments, setSegments] = useState([])
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  useEffect(() => {
    setSegments([])

    if (!route || !mapInstance || !window.google) return

    const validLocs = locations.filter(l => l.lat !== null && l.lng !== null)
    if (validLocs.length < 2) return

    // Construir lista ordenada de puntos según la ruta
    const ordered = route
      .filter(idx => idx >= 0 && idx < validLocs.length)
      .map(idx => validLocs[idx])

    if (ordered.length < 2) return

    // Para ruta cerrada, agregar el punto de inicio al final
    const points = routeMode === 'closed'
      ? [...ordered, ordered[0]]
      : ordered

    // Crear los pares de segmentos: [A→B, B→C, C→D, ...]
    const pairs = []
    for (let i = 0; i < points.length - 1; i++) {
      pairs.push({ from: points[i], to: points[i + 1], index: i })
    }

    const service = new window.google.maps.DirectionsService()
    const results = new Array(pairs.length).fill(null)
    let completed = 0

    pairs.forEach(({ from, to, index }) => {
      const request = buildSegmentRequest(from, to)

      service.route(request, (result, status) => {
        if (!isMounted.current) return

        completed++

        if (status === window.google.maps.DirectionsStatus.OK) {
          results[index] = result

          // fitBounds solo al terminar el primer segmento con el bounds total
          if (completed === 1 && mapInstance && result.routes[0]?.bounds) {
            // Calcular bounds global de todos los puntos
            const totalBounds = new window.google.maps.LatLngBounds()
            points.forEach(p => totalBounds.extend({ lat: p.lat, lng: p.lng }))
            mapInstance.fitBounds(totalBounds, { padding: 80 })
          }
        } else {
          console.warn(`[RouteDirections] Segmento ${index} falló:`, status)
        }

        // Cuando todos terminaron, actualizar el estado de una sola vez
        if (completed === pairs.length) {
          if (isMounted.current) {
            setSegments(results.filter(Boolean))
          }
        }
      })
    })

    return () => {
      // Cleanup: descartar resultados si cambia la ruta
      isMounted.current = false
    }
  }, [route, locations, routeMode, mapInstance])

  return (
    <>
      {segments.map((directions, i) => (
        <DirectionsRenderer
          key={i}
          directions={directions}
          options={{
            suppressMarkers:     true,
            suppressInfoWindows: true,
            polylineOptions: {
              strokeColor:   SEGMENT_COLORS[i % SEGMENT_COLORS.length],
              strokeOpacity: 0.88,
              strokeWeight:  4,
              geodesic:      true,
            },
          }}
        />
      ))}
    </>
  )
}