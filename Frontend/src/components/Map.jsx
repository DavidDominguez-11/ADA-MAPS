// src/components/Map.jsx
// ─────────────────────────────────────────────────────────────
// Cambios vs anterior:
//  - Ya NO tiene su propio useJsApiLoader (lo recibe como prop)
//  - fitBounds() automático cuando cambian las locations
//  - useCallback en onLoad para guardar la instancia del mapa
// ─────────────────────────────────────────────────────────────
import { useRef, useEffect, useCallback } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'

const DEFAULT_CENTER = { lat: 14.6349, lng: -90.5069 } // Guatemala City
const DEFAULT_ZOOM   = 12
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

export default function Map({ locations, isLoaded, loadError }) {
  const mapRef = useRef(null)

  // Guardar instancia del mapa al montar
  const handleMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  // Locations con coordenadas válidas
  const activeMarkers = locations.filter(l => l.lat !== null && l.lng !== null)

  // ── fitBounds: se ejecuta cada vez que cambian los markers ──
  useEffect(() => {
    if (!mapRef.current || activeMarkers.length === 0) return

    if (activeMarkers.length === 1) {
      // Un solo punto: centrar y zoom fijo
      mapRef.current.panTo({ lat: activeMarkers[0].lat, lng: activeMarkers[0].lng })
      mapRef.current.setZoom(14)
      return
    }

    // Varios puntos: ajustar bounds para mostrarlos todos
    const bounds = new window.google.maps.LatLngBounds()
    activeMarkers.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }))
    mapRef.current.fitBounds(bounds, { padding: 80 }) // 80px de margen
  }, [activeMarkers])

  // ── Error de carga ─────────────────────────────────────────
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

  // ── SDK cargando ───────────────────────────────────────────
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

  return (
    <GoogleMap
      mapContainerStyle={CONTAINER_STYLE}
      center={activeMarkers.length === 0 ? DEFAULT_CENTER : undefined}
      zoom={activeMarkers.length === 0 ? DEFAULT_ZOOM : undefined}
      options={MAP_OPTIONS}
      onLoad={handleMapLoad}
    >
      {activeMarkers.map((loc, index) => (
        <Marker
          key={loc.id}
          position={{ lat: loc.lat, lng: loc.lng }}
          label={{
            text:       String(index + 1),
            color:      '#ffffff',
            fontWeight: 'bold',
            fontSize:   '13px',
          }}
          title={loc.address || `Destino ${index + 1}`}
        />
      ))}
    </GoogleMap>
  )
}