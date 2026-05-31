// src/components/RouteControls.jsx
// ─────────────────────────────────────────────────────────────
// Cambios vs anterior:
//  - useAuth() para obtener Firebase ID token antes de cada request
//  - Token enviado como Authorization: Bearer <token>
//  - 401 → logout automático + redirect a /login
// ─────────────────────────────────────────────────────────────
import { useState }      from 'react'
import { useNavigate }   from 'react-router-dom'
import { useAuth }       from '../context/AuthContext'
import { optimizeRoute } from '../services/api'

const ROUTE_MODES = [
  {
    value: 'closed',
    label: 'Ruta cerrada',
    description: 'Regresa al punto de inicio',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/>
        <path d="M12 8v4l2 2"/>
      </svg>
    ),
  },
  {
    value: 'open',
    label: 'Ruta abierta',
    description: 'Termina en el último destino',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6"/>
      </svg>
    ),
  },
]

// ── Mensajes y colores por tipo de error ─────────────────────
const ERROR_META = {
  auth: {
    label: 'Sesión expirada',
    hint:  'Tu sesión ya no es válida. Serás redirigido al login automáticamente.',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  network: {
    label: 'Sin conexión',
    hint:  'El servidor no responde. Verifica que el backend esté corriendo.',
    color: 'text-slate-700 bg-slate-50 border-slate-300',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M8.5 2.5a5.5 5.5 0 0 1 7.5 5v1l4 4-4 4v1a5.5 5.5 0 0 1-7.5 5"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ),
  },
  validation: {
    label: 'Error de validación',
    hint:  'El payload enviado no cumple el esquema esperado por el backend.',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01"/>
      </svg>
    ),
  },
  google_api: {
    label: 'Error de Google API',
    hint:  'Fallo al obtener la matriz de distancias. Verifica la clave de API y las cuotas.',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  optimization: {
    label: 'Error de optimización',
    hint:  'El algoritmo no pudo completar el cálculo. Intenta con otros destinos.',
    color: 'text-red-700 bg-red-50 border-red-200',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01"/>
      </svg>
    ),
  },
  unknown: {
    label: 'Error inesperado',
    hint:  'Ocurrió un error desconocido. Revisa la consola para más detalles.',
    color: 'text-red-700 bg-red-50 border-red-200',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4m0 4h.01"/>
      </svg>
    ),
  },
}

// ── Banner de error categorizado ─────────────────────────────
function ErrorBanner({ error, errorType }) {
  if (!error) return null
  const meta = ERROR_META[errorType] ?? ERROR_META.unknown
  return (
    <div className={`flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-xs ${meta.color}`}>
      <div className="flex items-start gap-1.5">
        {meta.icon}
        <div>
          <span className="font-semibold">{meta.label}: </span>
          <span>{error}</span>
        </div>
      </div>
      <p className="text-[10px] opacity-70 pl-5">{meta.hint}</p>
    </div>
  )
}

// ── Panel de resultados ───────────────────────────────────────
function RouteResult({ route, distance, executionMs, locations, routeMode }) {
  if (!route || distance == null) return null

  const validLocs  = locations.filter(l => l.lat !== null && l.lng !== null)
  const distanceKm = (distance / 1000).toFixed(2)
  const stops      = route.length

  // Nombre legible: primera parte de la dirección antes de la primera coma
  function cityName(loc) {
    if (!loc?.address) return '—'
    return loc.address.split(',')[0].trim()
  }

  // Nombre largo para el tooltip
  function fullName(loc) {
    return loc?.address ?? '—'
  }

  function markerDot(role) {
    const styles = {
      origin:      'bg-green-500',
      destination: 'bg-red-500',
      stop:        'bg-[#1D4ED8]',
    }
    return <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${styles[role]}`}/>
  }

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden">

      {/* Métricas */}
      <div className="grid grid-cols-3 divide-x divide-green-200 border-b border-green-200">
        <div className="px-3 py-2.5 text-center">
          <p className="text-lg font-bold text-slate-800 leading-tight">{stops}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">paradas</p>
        </div>
        <div className="px-3 py-2.5 text-center">
          <p className="text-lg font-bold text-slate-800 leading-tight">{distanceKm}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">km totales</p>
        </div>
        <div className="px-3 py-2.5 text-center">
          <p className="text-sm font-bold text-slate-800 leading-tight mt-0.5">
            {routeMode === 'closed' ? 'Cerrada' : 'Abierta'}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">tipo</p>
        </div>
      </div>

      {/* Secuencia de paradas con nombres reales */}
      <div className="px-3 py-3 flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wider mb-0.5">
          Secuencia óptima
        </p>

        {route.map((locIndex, step) => {
          const loc     = validLocs[locIndex]
          const isFirst = step === 0
          const isLast  = step === route.length - 1

          let role = 'stop'
          if (isFirst) role = 'origin'
          else if (isLast && routeMode === 'open') role = 'destination'

          return (
            <div key={`${locIndex}-${step}`} className="flex items-center gap-2" title={fullName(loc)}>
              {markerDot(role)}
              <span className="text-[10px] font-semibold text-slate-400 w-4 text-right flex-shrink-0">
                {step + 1}
              </span>
              {/* Nombre legible de la ciudad/lugar */}
              <p className="text-xs text-slate-800 font-medium leading-snug truncate flex-1">
                {cityName(loc)}
              </p>
              {isFirst && (
                <span className="text-[10px] text-green-600 font-semibold flex-shrink-0">inicio</span>
              )}
              {isLast && routeMode === 'open' && (
                <span className="text-[10px] text-red-500 font-semibold flex-shrink-0">fin</span>
              )}
            </div>
          )
        })}

        {/* Cierre ruta circular */}
        {routeMode === 'closed' && (
          <div className="flex items-center gap-2 opacity-40 mt-0.5">
            {markerDot('origin')}
            <span className="text-[10px] font-semibold text-slate-400 w-4 text-right flex-shrink-0">↩</span>
            <p className="text-xs text-slate-500 italic truncate flex-1">
              {cityName(validLocs[route[0]])}
            </p>
          </div>
        )}
      </div>

      {/* Footer: leyenda + tiempo de cálculo */}
      <div className="px-3 pb-3 flex items-center gap-3 flex-wrap">
        {[
          { color: 'bg-green-500', label: 'Inicio'  },
          { color: 'bg-red-500',   label: 'Final'   },
          { color: 'bg-[#1D4ED8]', label: 'Parada'  },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${item.color}`}/>
            <span className="text-[10px] text-slate-500">{item.label}</span>
          </div>
        ))}

        {/* Tiempo de cálculo */}
        {executionMs != null && (
          <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Calculado en {executionMs} ms
          </span>
        )}
      </div>

    </div>
  )
}

export default function RouteControls({
  routeMode, setRouteMode,
  locations, canCalculate, radiusValidation,
  matrix,   setMatrix,
  route,    setRoute,
  distance, setDistance,
}) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const [loading,     setLoading]     = useState(false)
  const [apiError,    setApiError]    = useState(null)
  const [errorType,   setErrorType]   = useState(null)
  const [executionMs, setExecutionMs] = useState(null)

  const validCount    = locations.filter(l => l.lat !== null).length
  const missingCoords = locations.length - validCount

  function resetResult() {
    setMatrix(null); setRoute(null); setDistance(null)
    setApiError(null); setErrorType(null); setExecutionMs(null)
  }

  async function handleCalculate() {
    if (!canCalculate) return
    resetResult()
    setLoading(true)

    // Obtener Firebase ID token fresco en cada request
    let token
    try {
      token = await currentUser.getIdToken()
    } catch {
      setApiError('No se pudo obtener el token de sesión. Intenta iniciar sesión de nuevo.')
      setErrorType('auth')
      setLoading(false)
      return
    }

    const { data, error, errorType: eType } = await optimizeRoute(
      {
        locations: locations.filter(l => l.lat !== null && l.lng !== null),
        mode:      routeMode,
      },
      token
    )

    setLoading(false)

    if (error) {
      setApiError(error)
      setErrorType(eType)

      // 401 → sesión expirada: hacer logout y redirigir al login
      if (eType === 'auth') {
        await logout()
        navigate('/login', { replace: true })
      }

      return
    }

    if (!data?.success || !Array.isArray(data?.route) || typeof data?.distance !== 'number') {
      setApiError('El backend devolvió una respuesta inesperada.')
      setErrorType('unknown')
      console.warn('[RouteControls] Response inesperado:', data)
      return
    }

    setMatrix(data.matrix ?? null)
    setRoute(data.route)
    setDistance(data.distance)
    setExecutionMs(data.execution_time_ms ?? null)

    console.log('──────────────────────────────────────')
    console.log('[RouteControls] Resultado algoritmo genético:')
    console.log('  route:        ', data.route)
    console.log('  distance:     ', data.distance, 'm →', (data.distance / 1000).toFixed(2), 'km')
    console.log('  execution_ms: ', data.execution_time_ms ?? 'no reportado')
    console.log('  message:      ', data.message)
    console.log('──────────────────────────────────────')
  }

  function StatusMessage() {
    if (!radiusValidation.valid) {
      return (
        <div className="flex items-start gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
          <svg className="mt-0.5 shrink-0 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01"/>
          </svg>
          <span>
            Los destinos deben estar dentro de un radio máximo de 100 km.
            {radiusValidation.distanceKm && <> Detectado: <strong>{radiusValidation.distanceKm} km</strong>.</>}
          </span>
        </div>
      )
    }
    if (missingCoords > 0 && validCount > 0) {
      return <p className="text-xs text-amber-600 text-center">{missingCoords} destino{missingCoords > 1 ? 's' : ''} sin coordenadas válidas</p>
    }
    if (validCount === 0) {
      return <p className="text-xs text-slate-400 text-center">Ingresa al menos 2 destinos para calcular</p>
    }
    if (canCalculate && !route) {
      return (
        <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          {validCount} destinos válidos · listo para calcular
        </p>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col gap-4">

      <div>
        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Tipo de ruta</p>
        <div className="grid grid-cols-2 gap-2">
          {ROUTE_MODES.map(mode => (
            <button
              key={mode.value}
              type="button"
              onClick={() => { setRouteMode(mode.value); resetResult() }}
              className={`
                flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-all duration-150
                ${routeMode === mode.value
                  ? 'border-[#1D4ED8] bg-blue-50 text-[#1D4ED8]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              <span className={routeMode === mode.value ? 'text-[#1D4ED8]' : 'text-slate-400'}>{mode.icon}</span>
              <div>
                <p className="text-xs font-semibold leading-tight">{mode.label}</p>
                <p className="text-xs text-slate-400 leading-tight mt-0.5">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={!canCalculate || loading}
        className="
          w-full rounded-xl py-3 text-sm font-semibold tracking-wide
          flex items-center justify-center gap-2 transition-all duration-150 active:scale-[.98]
          bg-[#1D4ED8] text-white hover:bg-[#1e3a8a]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1D4ED8]
        "
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Calculando…
          </>
        ) : route ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Recalcular
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6-10l6 3m0 10l5.447-2.724A1 1 0 0 0 21 16.382V5.618a1 1 0 0 0-1.447-.894L15 7m0 13V7"/>
            </svg>
            Calcular ruta óptima
          </>
        )}
      </button>

      {/* Error categorizado */}
      <ErrorBanner error={apiError} errorType={errorType} />

      <StatusMessage />

      <RouteResult
        route={route}
        distance={distance}
        executionMs={executionMs}
        locations={locations}
        routeMode={routeMode}
      />

    </div>
  )
}