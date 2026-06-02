// src/components/Map.jsx — ADA Maps v4
import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import RouteDirections from './RouteDirections'

const DEFAULT_CENTER  = { lat: 14.6349, lng: -90.5069 }
const DEFAULT_ZOOM    = 12

const MARKER_PALETTE = [
  '#e07b4a', // coral
  '#4caf7a', // verde
  '#6b9fff', // azul
  '#c97cd4', // lila
  '#f5c842', // amarillo
  '#4cc9c9', // cian
  '#e05a8a', // rosa
  '#a3e07a', // verde lima
]

function getMarkerColor(index, role) {
  if (role === 'origin')      return '#4caf7a'
  if (role === 'destination') return '#b34040'
  return MARKER_PALETTE[index % MARKER_PALETTE.length]
}

const DARK_STYLE = [
  { elementType: 'geometry',                 stylers: [{ color: '#0d0d14' }] },
  { elementType: 'labels.text.stroke',       stylers: [{ color: '#0d0d14' }] },
  { elementType: 'labels.text.fill',         stylers: [{ color: '#4a4a6a' }] },
  { featureType: 'administrative',           elementType: 'geometry',         stylers: [{ color: '#1a1a28' }] },
  { featureType: 'administrative.country',   elementType: 'labels.text.fill', stylers: [{ color: '#6b6b8a' }] },
  { featureType: 'administrative.locality',  elementType: 'labels.text.fill', stylers: [{ color: '#8888aa' }] },
  { featureType: 'poi',                      elementType: 'labels',           stylers: [{ visibility: 'off' }] },
  { featureType: 'poi',                      elementType: 'geometry',         stylers: [{ color: '#111120' }] },
  { featureType: 'poi.park',                 elementType: 'geometry',         stylers: [{ color: '#0e1a1a' }] },
  { featureType: 'poi.park',                 elementType: 'labels.text.fill', stylers: [{ color: '#2a3a2a' }] },
  { featureType: 'road',                     elementType: 'geometry',         stylers: [{ color: '#1e1e30' }] },
  { featureType: 'road',                     elementType: 'geometry.stroke',  stylers: [{ color: '#16161f' }] },
  { featureType: 'road',                     elementType: 'labels.text.fill', stylers: [{ color: '#5a5a7a' }] },
  { featureType: 'road.highway',             elementType: 'geometry',         stylers: [{ color: '#28283e' }] },
  { featureType: 'road.highway',             elementType: 'geometry.stroke',  stylers: [{ color: '#1c1c2c' }] },
  { featureType: 'road.highway',             elementType: 'labels.text.fill', stylers: [{ color: '#7070a0' }] },
  { featureType: 'road.arterial',            elementType: 'geometry',         stylers: [{ color: '#1a1a28' }] },
  { featureType: 'road.local',               elementType: 'geometry',         stylers: [{ color: '#16161f' }] },
  { featureType: 'transit',                  elementType: 'labels',           stylers: [{ visibility: 'off' }] },
  { featureType: 'transit.station',          elementType: 'geometry',         stylers: [{ color: '#111120' }] },
  { featureType: 'water',                    elementType: 'geometry',         stylers: [{ color: '#07070f' }] },
  { featureType: 'water',                    elementType: 'labels.text.fill', stylers: [{ color: '#1a1a30' }] },
  { featureType: 'landscape',               elementType: 'geometry',         stylers: [{ color: '#0d0d14' }] },
  { featureType: 'landscape.natural',       elementType: 'geometry',         stylers: [{ color: '#0a0a12' }] },
]

const MAP_OPTIONS = {
  // Desactivar toda la UI por defecto para evitar el ícono blanco del zoom
  disableDefaultUI:  true,
  // Re-activar solo lo que necesitamos
  zoomControl:       true,
  zoomControlOptions: {
    position: 9, // RIGHT_BOTTOM — esquina inferior derecha
  },
  streetViewControl: false,
  mapTypeControl:    false,
  fullscreenControl: false,
  scaleControl:      false,
  rotateControl:     false,
  styles:            DARK_STYLE,
  backgroundColor:   '#0d0d14',
}

export default function Map({ locations, isLoaded, loadError, route, routeMode }) {
  const containerRef  = useRef(null)
  const mapRef        = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map
    setMapInstance(map)
  }, [])

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const validLocs = useMemo(
    () => locations.filter(l => l.lat !== null && l.lng !== null),
    [locations]
  )

  const orderedMarkers = useMemo(() => {
    if (!route || route.length === 0) return validLocs
    return route
      .filter(idx => idx >= 0 && idx < validLocs.length)
      .map(idx => validLocs[idx])
  }, [route, validLocs])

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

  // Map height: más alto, se adapta al fullscreen
  const mapHeight = isFullscreen ? '100vh' : 'calc(100vh - 260px)'
  const minHeight = isFullscreen ? '100vh' : '520px'

  const containerStyle = {
    width:  '100%',
    height: mapHeight,
    minHeight,
  }

  const isOptimized = !!route
  const lastStepIdx = orderedMarkers.length - 1
  const chipMarkers = orderedMarkers.slice(0, 6)
  const extraCount  = orderedMarkers.length - chipMarkers.length

  // ── Error ──────────────────────────────────────────────────
  if (loadError) {
    return (
      <div style={{ height: 520, background: '#0d0d14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'Poppins,sans-serif' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(179,64,64,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b34040" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
        </div>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#b34040' }}>Error al cargar Google Maps</p>
        <p style={{ fontSize: 12, color: '#7a7a8a' }}>Verifica tu VITE_GOOGLE_MAPS_API_KEY</p>
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div style={{ height: 520, background: '#0d0d14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'Poppins,sans-serif' }}>
        <span style={{ width: 28, height: 28, border: '2.5px solid rgba(224,123,74,0.2)', borderTopColor: '#e07b4a', borderRadius: '50%', animation: 'mapSpin 0.75s linear infinite', display: 'inline-block' }}/>
        <span style={{ fontSize: 12, color: '#7a7a8a', fontFamily: 'monospace' }}>Cargando mapa…</span>
        <style>{`@keyframes mapSpin { to { transform:rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes mapSpin { to { transform:rotate(360deg); } }

        /* Botón fullscreen custom */
        .map-fs-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(13,13,20,0.85);
          backdrop-filter: blur(8px);
          color: #9090b0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .map-fs-btn:hover { background: rgba(30,30,48,0.95); color: #e2e2f0; }

        /* Chips de lugares */
        .map-chips {
          position: absolute;
          /* 48px = altura aprox del attribution de Google Maps */
          bottom: 52px;
          left: 12px;
          right: 12px;
          z-index: 10;
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          pointer-events: none;
        }
        .map-chip {
          display: flex;
          align-items: center;
          gap: 7px;
          border-radius: 20px;
          background: rgba(13,13,20,0.88);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 5px 12px 5px 5px;
          font-family: 'Poppins', sans-serif;
          pointer-events: auto;
          transition: border-color 0.12s;
        }
        .map-chip:hover { border-color: rgba(255,255,255,0.15); }
        .map-chip-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
          color: #0d0d14;
        }
        .map-chip-name {
          font-size: 11px;
          font-weight: 400;
          color: #d0d0e0;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .map-chip-more {
          font-size: 11px;
          color: #7a7a8a;
        }
      `}</style>

      <div
        ref={containerRef}
        style={{ position: 'relative', background: '#0d0d14' }}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={orderedMarkers.length === 0 ? DEFAULT_CENTER : undefined}
          zoom={orderedMarkers.length === 0 ? DEFAULT_ZOOM : undefined}
          options={MAP_OPTIONS}
          onLoad={handleMapLoad}
        >
          {route && (
            <RouteDirections
              route={route}
              locations={locations}
              routeMode={routeMode}
              mapInstance={mapInstance}
            />
          )}

          {orderedMarkers.map((loc, step) => {
            let role = 'stop'
            if (isOptimized) {
              if (step === 0) role = 'origin'
              else if (step === lastStepIdx && routeMode === 'open') role = 'destination'
            }
            const fillColor = getMarkerColor(step, isOptimized ? role : null)
            return (
              <Marker
                key={`${loc.id}-${step}`}
                position={{ lat: loc.lat, lng: loc.lng }}
                icon={{
                  path:         window.google.maps.SymbolPath.CIRCLE,
                  scale:        14,
                  fillColor:    fillColor,
                  fillOpacity:  1,
                  strokeColor:  'rgba(0,0,0,0.45)',
                  strokeWeight: 1.5,
                }}
                label={{
                  text:       String(step + 1),
                  color:      '#0d0d14',
                  fontWeight: '700',
                  fontSize:   '11px',
                  fontFamily: 'Poppins, sans-serif',
                }}
                title={`${step + 1}. ${loc.address}`}
                zIndex={role === 'origin' ? 10 : role === 'destination' ? 9 : step}
              />
            )
          })}
        </GoogleMap>

        {/* Botón fullscreen */}
        <button
          className="map-fs-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          )}
        </button>

        {/* Chips — 52px sobre el fondo para no tapar el logo Google */}
        {orderedMarkers.length > 0 && (
          <div className="map-chips">
            {chipMarkers.map((loc, i) => {
              let role = 'stop'
              if (isOptimized) {
                if (i === 0) role = 'origin'
                else if (i === lastStepIdx && routeMode === 'open') role = 'destination'
              }
              const dotColor = getMarkerColor(i, isOptimized ? role : null)
              return (
                <div key={`chip-${loc.id}-${i}`} className="map-chip" title={loc.address}>
                  <span className="map-chip-badge" style={{ background: dotColor }}>
                    {i + 1}
                  </span>
                  <span className="map-chip-name">{loc.address.split(',')[0]}</span>
                </div>
              )
            })}
            {extraCount > 0 && (
              <div className="map-chip">
                <span className="map-chip-more">+{extraCount} más</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}