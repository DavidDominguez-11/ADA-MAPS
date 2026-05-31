// src/components/RouteControls.jsx
// ─────────────────────────────────────────────────────────────
// Cambios vs anterior:
//  - Consume nuevo response shape: { success, route, distance, message }
//  - Guarda route y distance en estado global via props
//  - RouteResult: muestra la secuencia optimizada y distancia total
// ─────────────────────────────────────────────────────────────
import { useState }      from 'react'
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

// ── Resultado visual de la ruta optimizada ────────────────────
function RouteResult({ route, distance, locations, routeMode }) {
  if (!route || !distance) return null

  const validLocs  = locations.filter(l => l.lat !== null && l.lng !== null)
  const distanceKm = (distance / 1000).toFixed(2)

  // Nombre corto de una dirección
  function shortName(loc) {
    if (!loc?.address) return '—'
    // Tomar las primeras dos partes de la dirección separadas por coma
    return loc.address.split(',').slice(0, 2).join(',').trim()
  }

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-3.5">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Ruta optimizada
        </p>
        <span className="text-xs font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
          {distanceKm} km
          {routeMode === 'closed' && <span className="font-normal text-green-600"> total</span>}
        </span>
      </div>

      {/* Secuencia de paradas */}
      <ol className="flex flex-col gap-1.5">
        {route.map((locIndex, step) => {
          const loc     = validLocs[locIndex]
          const isFirst = step === 0
          const isLast  = step === route.length - 1

          return (
            <li key={`${locIndex}-${step}`} className="flex items-start gap-2">
              {/* Número de paso */}
              <span className={`
                flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold
                flex items-center justify-center mt-0.5
                ${isFirst
                  ? 'bg-[#1D4ED8] text-white'
                  : isLast && routeMode === 'open'
                    ? 'bg-slate-700 text-white'
                    : 'bg-white border border-green-300 text-green-700'
                }
              `}>
                {step + 1}
              </span>

              {/* Dirección */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 leading-snug truncate">
                  {shortName(loc)}
                </p>
                {isFirst && (
                  <span className="text-[10px] text-blue-500 font-medium">origen</span>
                )}
                {isLast && routeMode === 'open' && (
                  <span className="text-[10px] text-slate-500 font-medium">destino final</span>
                )}
              </div>
            </li>
          )
        })}

        {/* Cierre de ruta circular */}
        {routeMode === 'closed' && (
          <li className="flex items-start gap-2 opacity-50">
            <span className="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 bg-[#1D4ED8] text-white">
              ↩
            </span>
            <p className="text-xs text-slate-500 leading-snug mt-0.5 truncate">
              {shortName(validLocs[route[0]])}
            </p>
          </li>
        )}
      </ol>

      <p className="text-[10px] text-green-500 mt-2.5">
        Índices recibidos: [{route.join(', ')}]
      </p>
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
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState(null)

  const validCount    = locations.filter(l => l.lat !== null).length
  const missingCoords = locations.length - validCount

  function resetResult() {
    setMatrix(null); setRoute(null); setDistance(null); setApiError(null)
  }

  async function handleCalculate() {
    if (!canCalculate) return
    resetResult()
    setLoading(true)

    const { data, error } = await optimizeRoute({
      locations: locations.filter(l => l.lat !== null && l.lng !== null),
      mode:      routeMode,
    })

    setLoading(false)

    if (error) { setApiError(error); return }

    // Validar shape del response
    if (!data?.success || !Array.isArray(data?.route) || typeof data?.distance !== 'number') {
      setApiError('El backend devolvió una respuesta inesperada.')
      console.warn('[RouteControls] Response inesperado:', data)
      return
    }

    // ✅ Guardar los tres resultados
    setMatrix(data.matrix ?? null)       // puede no venir en este endpoint
    setRoute(data.route)
    setDistance(data.distance)

    console.log('──────────────────────────────────────')
    console.log('[RouteControls] Resultado del algoritmo genético:')
    console.log('  route:   ', data.route)
    console.log('  distance:', data.distance, 'm')
    console.log('  message: ', data.message)
    console.log('──────────────────────────────────────')
  }

  function StatusMessage() {
    if (apiError) {
      return (
        <div className="flex items-start gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
          <svg className="mt-0.5 shrink-0 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01"/>
          </svg>
          <span>{apiError}</span>
        </div>
      )
    }
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

      {/* Selector de modo */}
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
              <span className={routeMode === mode.value ? 'text-[#1D4ED8]' : 'text-slate-400'}>
                {mode.icon}
              </span>
              <div>
                <p className="text-xs font-semibold leading-tight">{mode.label}</p>
                <p className="text-xs text-slate-400 leading-tight mt-0.5">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Botón calcular */}
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

      <StatusMessage />

      {/* Resultado del algoritmo genético */}
      <RouteResult
        route={route}
        distance={distance}
        locations={locations}
        routeMode={routeMode}
      />

    </div>
  )
}