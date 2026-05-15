// src/components/Map.jsx
// ─────────────────────────────────────────────────────────────
// Mapa base con Google Maps. Muestra markers por cada destino
// que tenga lat/lng definidos.
// API key leída desde .env → VITE_GOOGLE_MAPS_API_KEY
// ─────────────────────────────────────────────────────────────
import { useMemo } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

// Centro por defecto: Guatemala City
const DEFAULT_CENTER = { lat: 14.6349, lng: -90.5069 }
const DEFAULT_ZOOM   = 12

const MAP_CONTAINER_STYLE = {
  width:  '100%',
  height: '480px',
  borderRadius: '12px',
}

// Opciones estéticas del mapa (estilo minimalista)
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

export default function Map({ locations }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  // Solo los destinos que tienen coordenadas reales
  const activeMarkers = useMemo(
    () => locations.filter(loc => loc.lat !== null && loc.lng !== null),
    [locations]
  )

  // Centro del mapa: primer marker con coords, o default
  const center = useMemo(() => {
    if (activeMarkers.length > 0) {
      return { lat: activeMarkers[0].lat, lng: activeMarkers[0].lng }
    }
    return DEFAULT_CENTER
  }, [activeMarkers])

  // ── Error de carga ─────────────────────────────────────────
  if (loadError) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl bg-red-50 border border-red-200 text-red-600"
        style={{ height: '480px' }}
      >
        <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"/>
        </svg>
        <p className="text-sm font-medium">Error al cargar Google Maps</p>
        <p className="text-xs mt-1 text-red-400">Verifica tu VITE_GOOGLE_MAPS_API_KEY en .env</p>
      </div>
    )
  }

  // ── Cargando SDK ───────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl bg-slate-100 border border-slate-200"
        style={{ height: '480px' }}
      >
        <svg className="animate-spin h-7 w-7 text-[#1D4ED8] mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <span className="text-xs text-slate-400 font-mono">Cargando mapa…</span>
      </div>
    )
  }

  // ── Mapa ───────────────────────────────────────────────────
  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={center}
      zoom={DEFAULT_ZOOM}
      options={MAP_OPTIONS}
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