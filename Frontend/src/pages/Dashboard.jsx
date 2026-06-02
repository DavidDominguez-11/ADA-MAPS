// src/pages/Dashboard.jsx — ADA Maps v4
import { useState }       from 'react'
import { useNavigate }    from 'react-router-dom'
import { useJsApiLoader } from '@react-google-maps/api'
import { useAuth }        from '../context/AuthContext'
import Header             from '../components/Header'
import StatusBar          from '../components/StatusBar'
import DestinationInput   from '../components/DestinationInput'
import Map                from '../components/Map'
import RouteControls      from '../components/RouteControls'
import { validateRadius } from '../utils/haversine'

// IMPORTANTE: debe ser un array estático fuera del componente
// para que useJsApiLoader no lo detecte como cambio en cada render
const LIBRARIES = ['places']

function makeLocation() {
  return { id: crypto.randomUUID(), address: '', lat: null, lng: null }
}

const INITIAL_LOCATIONS = [makeLocation(), makeLocation()]

export default function Dashboard() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  })

  const [locations,  setLocations]  = useState(INITIAL_LOCATIONS)
  const [routeMode,  setRouteMode]  = useState('closed')
  const [matrix,     setMatrix]     = useState(null)
  const [route,      setRoute]      = useState(null)
  const [distance,   setDistance]   = useState(null)
  const [logoutLoad, setLogoutLoad] = useState(false)

  const radiusValidation = validateRadius(locations)
  const validLocations   = locations.filter(l => l.lat !== null && l.lng !== null)
  const canCalculate     = validLocations.length >= 2 && radiusValidation.valid

  function handleSetLocations(updater) {
    setMatrix(null); setRoute(null); setDistance(null)
    setLocations(updater)
  }

  async function handleLogout() {
    setLogoutLoad(true)
    const { error } = await logout()
    setLogoutLoad(false)
    if (!error) navigate('/login', { replace: true })
  }

  return (
    <>
      <style>{`
        .db {
          min-height: 100vh;
          background: var(--background);
          display: flex;
          flex-direction: column;
          font-family: 'Poppins', sans-serif;
        }

        .db-main {
          flex: 1;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 20px 16px 32px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .db-main {
            grid-template-columns: 360px 1fr;
            padding: 24px 24px 40px;
          }
        }

        .db-side { display: flex; flex-direction: column; gap: 12px; }

        /* Map card */
        .mc {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .mc-hd {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .mc-hd-l {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--foreground);
        }
        .mc-hd-l svg { color: var(--muted-foreground); }

        .mc-hd-r { display: flex; align-items: center; gap: 10px; }
        .mc-cnt  { font-size: 12px; color: var(--muted-foreground); }
        .mc-opt  {
          font-size: 11px;
          font-weight: 600;
          color: var(--success);
          background: color-mix(in srgb, var(--success) 15%, transparent);
          border-radius: 6px;
          padding: 2px 10px;
        }

        /* Map footer */
        .mc-foot {
          display: flex;
          align-items: center;
          border-top: 1px solid var(--border);
          padding: 8px 16px;
          background: color-mix(in srgb, var(--secondary) 30%, transparent);
          flex-shrink: 0;
        }
        .mc-coord {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--muted-foreground);
          font-family: monospace;
        }
        .mc-sep {
          width: 1px;
          height: 12px;
          background: var(--border);
          margin: 0 12px;
        }

        /* Ocultar el zoom control blanco nativo de Google Maps */
        .gm-bundled-control,
        .gmnoprint:not([data-control-width]),
        .gm-style-cc,
        .gm-control-active > img:not(:first-child) {
          display: none !important;
        }

        /* Hacer el zoom control visible pero dark */
        .gm-control-active {
          background: rgba(26,26,34,0.92) !important;
          border-radius: 8px !important;
        }

        /* Ocultar el ícono blanco que aparece en el zoom */
        .gm-style button img[src*="data:image"] {
          display: none !important;
        }
      `}</style>

      <div className="db">
        <Header
          user={currentUser}
          onLogout={handleLogout}
          isLoggingOut={logoutLoad}
        />

        <StatusBar
          googleMapsActive={isLoaded && !loadError}
          validDestinations={validLocations.length}
          totalDestinations={locations.length}
          hasOptimizedRoute={!!route}
          totalDistance={distance}
        />

        <main className="db-main">

          <aside className="db-side">
            <DestinationInput
              locations={locations}
              setLocations={handleSetLocations}
              isLoaded={isLoaded}
            />
            <RouteControls
              routeMode={routeMode}      setRouteMode={setRouteMode}
              locations={locations}      canCalculate={canCalculate}
              radiusValidation={radiusValidation}
              matrix={matrix}            setMatrix={setMatrix}
              route={route}              setRoute={setRoute}
              distance={distance}        setDistance={setDistance}
            />
          </aside>

          <section className="mc">
            <div className="mc-hd">
              <div className="mc-hd-l">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                  <line x1="8" y1="2" x2="8" y2="18"/>
                  <line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
                Vista de mapa
              </div>
              <div className="mc-hd-r">
                <span className="mc-cnt">
                  {validLocations.length} marker{validLocations.length !== 1 ? 's' : ''} activos
                </span>
                {route && <span className="mc-opt">Optimizada</span>}
              </div>
            </div>

            <Map
              locations={locations}
              isLoaded={isLoaded}
              loadError={loadError}
              route={route}
              routeMode={routeMode}
            />

            <div className="mc-foot">
              <div className="mc-coord">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                lat 14.6349° N
              </div>
              <div className="mc-sep"/>
              <div className="mc-coord">lng 90.5069° W</div>
              <div className="mc-sep"/>
              <div className="mc-coord">Guatemala City</div>
            </div>
          </section>

        </main>
      </div>
    </>
  )
}