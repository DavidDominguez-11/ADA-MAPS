// src/pages/Dashboard.jsx
// ─────────────────────────────────────────────────────────────
// Cambios vs anterior:
//  - Estado `route` (índices ordenados) y `distance` (metros totales)
//  - handleSetLocations limpia también route y distance
//  - route y distance pasados a RouteControls y Map
// ─────────────────────────────────────────────────────────────
import { useState }        from 'react'
import { useNavigate }     from 'react-router-dom'
import { useJsApiLoader }  from '@react-google-maps/api'
import { useAuth }         from '../context/AuthContext'
import DestinationInput    from '../components/DestinationInput'
import Map                 from '../components/Map'
import RouteControls       from '../components/RouteControls'
import { validateRadius }  from '../utils/haversine'

const GOOGLE_MAPS_LIBRARIES = ['places']

const INITIAL_LOCATIONS = [
  { id: crypto.randomUUID(), address: '', lat: null, lng: null },
  { id: crypto.randomUUID(), address: '', lat: null, lng: null },
]

export default function Dashboard() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries:        GOOGLE_MAPS_LIBRARIES,
  })

  const [locations, setLocations] = useState(INITIAL_LOCATIONS)
  const [routeMode, setRouteMode] = useState('closed')

  // ── Resultado del algoritmo genético ──────────────────────
  const [matrix,   setMatrix]   = useState(null)  // NxN · metros
  const [route,    setRoute]    = useState(null)  // [0, 2, 1, ...] índices optimizados
  const [distance, setDistance] = useState(null)  // metros totales del recorrido

  const [logoutLoad, setLogoutLoad] = useState(false)

  const radiusValidation = validateRadius(locations)
  const validLocations   = locations.filter(l => l.lat !== null && l.lng !== null)
  const canCalculate     = validLocations.length >= 2 && radiusValidation.valid

  // Limpiar todo el resultado si el usuario toca los destinos
  function handleSetLocations(updater) {
    setMatrix(null)
    setRoute(null)
    setDistance(null)
    setLocations(updater)
  }

  async function handleLogout() {
    setLogoutLoad(true)
    const { error } = await logout()
    setLogoutLoad(false)
    if (!error) navigate('/login', { replace: true })
  }

  const displayName = currentUser?.displayName ?? null
  const email       = currentUser?.email       ?? ''
  const photoURL    = currentUser?.photoURL    ?? null
  const initials    = (displayName ?? email).slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <line x1="12" y1="36" x2="24" y2="12" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="24" y1="12" x2="38" y2="28" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="12" y1="36" x2="38" y2="28" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="12" r="4" fill="#1D4ED8"/>
            <circle cx="38" cy="28" r="4" fill="#1D4ED8"/>
            <circle cx="12" cy="36" r="4" fill="#1E3A8A"/>
          </svg>
          <span className="text-xs font-mono text-slate-400 tracking-widest uppercase select-none hidden sm:block">
            Route Optimizer v1.0
          </span>
        </div>
        <div className="flex items-center gap-3">
          {photoURL ? (
            <img src={photoURL} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-slate-200"/>
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white text-xs font-bold select-none">
              {initials}
            </div>
          )}
          <span className="text-xs text-slate-500 hidden sm:block truncate max-w-[160px]">{email}</span>
          <button
            onClick={handleLogout}
            disabled={logoutLoad}
            className="text-xs font-medium text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {logoutLoad ? 'Saliendo…' : 'Salir'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-5">

          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4"
                 style={{ boxShadow: '0 2px 12px 0 rgba(30,58,138,0.06)' }}>
              <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                Destinos
                <span className="ml-auto text-xs font-normal text-slate-400">{locations.length}/15</span>
              </h2>
              <DestinationInput
                locations={locations}
                setLocations={handleSetLocations}
                isLoaded={isLoaded}
              />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5"
                 style={{ boxShadow: '0 2px 12px 0 rgba(30,58,138,0.06)' }}>
              <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
                Configuración
              </h2>
              <RouteControls
                routeMode={routeMode}
                setRouteMode={setRouteMode}
                locations={locations}
                canCalculate={canCalculate}
                radiusValidation={radiusValidation}
                matrix={matrix}   setMatrix={setMatrix}
                route={route}     setRoute={setRoute}
                distance={distance} setDistance={setDistance}
              />
            </div>
          </aside>

          <section className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4"
                 style={{ boxShadow: '0 2px 12px 0 rgba(30,58,138,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                    <line x1="8" y1="2" x2="8" y2="18"/>
                    <line x1="16" y1="6" x2="16" y2="22"/>
                  </svg>
                  Vista de mapa
                </h2>
                <span className="text-xs text-slate-400">
                  {validLocations.length} marker{validLocations.length !== 1 ? 's' : ''} activos
                  {route && <span className="ml-2 text-blue-500 font-medium">· ruta optimizada</span>}
                </span>
              </div>
              {/* route: cuando existe, el mapa reordena los markers según los índices */}
              <Map locations={locations} isLoaded={isLoaded} loadError={loadError} route={route} />
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}