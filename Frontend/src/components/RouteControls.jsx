// src/components/RouteControls.jsx
// ─────────────────────────────────────────────────────────────
// Selector de modo de ruta (abierta / cerrada) y botón Calcular.
// El botón por ahora solo hace console.log del estado.
// ─────────────────────────────────────────────────────────────

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

export default function RouteControls({ routeMode, setRouteMode, locations }) {
  function handleCalculate() {
    // 🚧 Próximo milestone: aquí irá el request al backend / algoritmo genético
    console.log('──────────────────────────────')
    console.log('[RouteControls] Calcular ruta')
    console.log('Modo:', routeMode)
    console.log('Destinos:', locations)
    console.log('──────────────────────────────')
  }

  const hasValidLocations = locations.filter(l => l.lat !== null).length >= 2

  return (
    <div className="flex flex-col gap-4">

      {/* Selector modo */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
          Tipo de ruta
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ROUTE_MODES.map(mode => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setRouteMode(mode.value)}
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
        className="
          w-full rounded-xl bg-[#1D4ED8] py-3 text-sm font-semibold text-white
          tracking-wide transition-all duration-150
          hover:bg-[#1e3a8a] active:scale-[.98]
          flex items-center justify-center gap-2
        "
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6-10l6 3m0 10l5.447-2.724A1 1 0 0 0 21 16.382V5.618a1 1 0 0 0-1.447-.894L15 7m0 13V7"/>
        </svg>
        Calcular ruta óptima
      </button>

      {/* Info destinos activos */}
      <p className="text-xs text-center text-slate-400">
        {locations.length} destino{locations.length !== 1 ? 's' : ''} ingresados
        {hasValidLocations
          ? ` · ${locations.filter(l => l.lat !== null).length} con coordenadas`
          : ' · sin coordenadas aún'}
      </p>

    </div>
  )
}