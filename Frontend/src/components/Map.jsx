// src/components/Map.jsx
// ─────────────────────────────────────────────────────────────
// Cambios vs anterior:
//  - <Polyline> eliminado
//  - <RouteDirections> reemplaza la polyline con ruta real en carreteras
//  - mapInstance en estado (no solo ref) para pasarlo a RouteDirections
//  - fitBounds solo se ejecuta desde Map cuando NO hay route activo
//    (cuando hay route, RouteDirections llama fitBounds con el bounds real)
// ─────────────────────────────────────────────────────────────
import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { GoogleMap, Marker }  from '@react-google-maps/api'
import RouteDirections         from './RouteDirections'

const DEFAULT_CENTER  = { lat: 14.6349, lng: -90.5069 }
const DEFAULT_ZOOM    = 12
const CONTAINER_STYLE = { width: '100%', height: '480px', borderRadius: '12px' }

const MAP_OPTIONS = {
  disableDefaultUI:  false,
  zoomControl:       true,
  streetViewControl: false,
  mapTypeControl:    false,
  fullscreenControl: true,
  styles: [
    { featureType: 'poi',          elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit',      elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'water',        elementType: 'geometry', stylers: [{ color: '#dde8f0' }] },
    { featureType: 'road',         elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
    { featureType: 'landscape',    elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  ],
}

// ── Icono de marker por rol ───────────────────────────────────
function markerIcon(role) {
  const colors = {
    origin:      { fill: '#16a34a', stroke: '#ffffff' }, // verde
    destination: { fill: '#dc2626', stroke: '#ffffff' }, // rojo
    stop:        { fill: '#1D4ED8', stroke: '#ffffff' }, // azul
  }
  const c = colors[role] ?? colors.stop
  return {
    path:         window.google.maps.SymbolPath.CIRCLE,
    scale:        13,
    fillColor:    c.fill,
    fillOpacity:  1,
    strokeColor:  c.stroke,
    strokeWeight: 2,
  }
}

export default function Map({ locations, isLoaded, loadError, route, routeMode }) {
  const mapRef = useRef(null)

  // mapInstance en estado para que RouteDirections reciba la instancia
  // una vez que el mapa haya montado (mapRef solo no dispara re-render)
  const [mapInstance, setMapInstance] = useState(null)

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map
    setMapInstance(map)
  }, [])

  // Locations con coordenadas válidas
  const validLocs = useMemo(
    () => locations.filter(l => l.lat !== null && l.lng !== null),
    [locations]
  )

  // Markers en orden optimizado (o de entrada si no hay route)
  const orderedMarkers = useMemo(() => {
    if (!route || route.length === 0) return validLocs
    return route
      .filter(idx => idx >= 0 && idx < validLocs.length)
      .map(idx => validLocs[idx])
  }, [route, validLocs])

  // fitBounds solo cuando NO hay route activo.
  // Cuando route existe, RouteDirections llama fitBounds con el bounds real de la ruta.
  useEffect(() => {
    if (!mapRef.current || route || orderedMarkers.length === 0) return

    if (orderedMarkers.length === 1) {
      mapRef.current.panTo({ lat: orderedMarkers[0].lat, lng: orderedMarkers[0].lng })
      mapRef.current.setZoom(14)
      return
    }

    const bounds = new window.google.maps.LatLngBounds()
    orderedMarkers.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }))
    mapRef.current.fitBounds(bounds, { padding: 80 })
  }, [orderedMarkers, route])

  // ── Estados de carga / error ───────────────────────────────
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-red-50 border border-red-200 text-red-600" style={{ height: '480px' }}>
        <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"/>
        </svg>
        <p className="text-sm font-medium">Error al cargar Google Maps</p>
        <p className="text-xs mt-1 text-red-400">Verifica tu VITE_GOOGLE_MAPS_API_KEY en .env</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-slate-100 border border-slate-200" style={{ height: '480px' }}>
        <svg className="animate-spin h-7 w-7 text-[#1D4ED8] mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <span className="text-xs text-slate-400 font-mono">Cargando mapa…</span>
      </div>
    )
  }

  const isOptimized = !!route
  const lastStepIdx = orderedMarkers.length - 1

  return (
    <GoogleMap
      mapContainerStyle={CONTAINER_STYLE}
      center={orderedMarkers.length === 0 ? DEFAULT_CENTER : undefined}
      zoom={orderedMarkers.length === 0 ? DEFAULT_ZOOM : undefined}
      options={MAP_OPTIONS}
      onLoad={handleMapLoad}
    >
      {/* ── Ruta real en carreteras (reemplaza <Polyline>) ── */}
      {route && (
        <RouteDirections
          route={route}
          locations={locations}
          routeMode={routeMode}
          mapInstance={mapInstance}
        />
      )}

      {/* ── Markers personalizados ── */}
      {orderedMarkers.map((loc, step) => {
        let role = 'stop'
        if (isOptimized) {
          if (step === 0) role = 'origin'
          else if (step === lastStepIdx && routeMode === 'open') role = 'destination'
        }

        return (
          <Marker
            key={`${loc.id}-${step}`}
            position={{ lat: loc.lat, lng: loc.lng }}
            icon={isOptimized ? markerIcon(role) : undefined}
            label={{
              text:       String(step + 1),
              color:      '#ffffff',
              fontWeight: 'bold',
              fontSize:   '12px',
            }}
            title={`${step + 1}. ${loc.address}`}
            zIndex={role === 'origin' ? 10 : role === 'destination' ? 9 : step}
          />
        )
      })}
    </GoogleMap>
  )
}