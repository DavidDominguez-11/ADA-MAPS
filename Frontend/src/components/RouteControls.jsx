// src/components/RouteControls.jsx
// ─────────────────────────────────────────────────────────────
// Cambios vs anterior:
//  - handleCalculate ahora llama a optimizeRoute() del servicio
//  - Estado local: loading + apiError para feedback de UI
//  - console.log del response para verificar flujo completo
// ─────────────────────────────────────────────────────────────
import { useState }        from 'react'
import { optimizeRoute }   from '../services/api'

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

export default function RouteControls({ routeMode, setRouteMode, locations, canCalculate, radiusValidation }) {
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState(null)

  const validCount    = locations.filter(l => l.lat !== null).length
  const totalCount    = locations.length
  const missingCoords = totalCount - validCount

  // ── Calcular: POST /optimize ───────────────────────────────
  async function handleCalculate() {
    if (!canCalculate) return
    setApiError(null)
    setLoading(true)

    const { data, error } = await optimizeRoute({
      locations: locations.filter(l => l.lat !== null && l.lng !== null),
      mode:      routeMode,
    })

    setLoading(false)

    if (error) {
      setApiError(error)
      return
    }

    // 🚧 Próximo milestone: renderizar polylines con data.route
    console.log('──────────────────────────────')
    console.log('[RouteControls] Response del backend:')
    console.log(data)
    console.log('──────────────────────────────')
  }

  // ── Mensajes de estado ─────────────────────────────────────
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
            {radiusValidation.distanceKm && (
              <> Detectado: <strong>{radiusValidation.distanceKm} km</strong>.</>
            )}
          </span>
        </div>
      )
    }

    if (missingCoords > 0 && validCount > 0) {
      return (
        <p className="text-xs text-amber-600 text-center">
          {missingCoords} destino{missingCoords > 1 ? 's' : ''} sin coordenadas válidas
        </p>
      )
    }

    if (validCount === 0) {
      return <p className="text-xs text-slate-400 text-center">Ingresa al menos 2 destinos para calcular</p>
    }

    if (canCalculate) {
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
              onClick={() => { setRouteMode(mode.value); setApiError(null) }}
              className={`
                flex items-center gap-2.5 rounded-xl border px-3 py-3
                text-left transition-all duration-150
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
          flex items-center justify-center gap-2
          transition-all duration-150 active:scale-[.98]
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

    </div>
  )
}