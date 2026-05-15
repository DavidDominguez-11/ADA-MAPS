// src/components/DestinationInput.jsx
// ─────────────────────────────────────────────────────────────
// Responsabilidad única: mostrar inputs, agregar y eliminar destinos.
// Mínimo 2 destinos, máximo 15.
// ─────────────────────────────────────────────────────────────

const MIN_DESTINATIONS = 2
const MAX_DESTINATIONS = 15

export default function DestinationInput({ locations, setLocations }) {
  // ── Agregar destino ────────────────────────────────────────
  function handleAdd() {
    if (locations.length >= MAX_DESTINATIONS) return
    setLocations(prev => [
      ...prev,
      {
        id:      crypto.randomUUID(),
        address: '',
        lat:     null,
        lng:     null,
      },
    ])
  }

  // ── Eliminar destino ───────────────────────────────────────
  function handleRemove(id) {
    if (locations.length <= MIN_DESTINATIONS) return
    setLocations(prev => prev.filter(loc => loc.id !== id))
  }

  // ── Actualizar dirección ───────────────────────────────────
  function handleChange(id, value) {
    setLocations(prev =>
      prev.map(loc => loc.id === id ? { ...loc, address: value } : loc)
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Lista de inputs */}
      {locations.map((loc, index) => (
        <div key={loc.id} className="flex items-center gap-2">

          {/* Número de destino */}
          <span
            className="
              flex-shrink-0 w-7 h-7 rounded-full
              bg-[#1D4ED8] text-white text-xs font-bold
              flex items-center justify-center select-none
            "
          >
            {index + 1}
          </span>

          {/* Input dirección */}
          <input
            type="text"
            value={loc.address}
            onChange={e => handleChange(loc.id, e.target.value)}
            placeholder={index === 0 ? 'Punto de inicio' : `Destino ${index + 1}`}
            className="
              flex-1 rounded-lg border border-slate-200 bg-white
              px-3 py-2 text-sm text-slate-800 placeholder-slate-300
              outline-none transition-all duration-150
              focus:border-blue-600 focus:ring-2 focus:ring-blue-100
            "
          />

          {/* Botón eliminar */}
          <button
            type="button"
            onClick={() => handleRemove(loc.id)}
            disabled={locations.length <= MIN_DESTINATIONS}
            title={locations.length <= MIN_DESTINATIONS ? 'Mínimo 2 destinos' : 'Eliminar destino'}
            className="
              flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
              text-slate-400 hover:text-red-500 hover:bg-red-50
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      ))}

      {/* Botón agregar */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={locations.length >= MAX_DESTINATIONS}
        className="
          mt-1 flex items-center gap-2 text-sm font-medium
          text-[#1D4ED8] hover:text-[#1e3a8a]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors self-start
        "
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Agregar destino
        {locations.length >= MAX_DESTINATIONS && (
          <span className="text-xs text-slate-400 font-normal">(máximo {MAX_DESTINATIONS})</span>
        )}
      </button>

    </div>
  )
}