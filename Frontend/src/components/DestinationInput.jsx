// src/components/DestinationInput.jsx
// ─────────────────────────────────────────────────────────────
// Cambios vs anterior:
//  - <input> reemplazado por <Autocomplete> de Google Places
//  - Al seleccionar sugerencia: guarda address + lat + lng reales
//  - Indicador visual por input: válido (verde) / pendiente (gris) / editando (amarillo)
//  - isLoaded recibido como prop (el SDK ya lo carga Dashboard)
// ─────────────────────────────────────────────────────────────
import { useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'

const MIN_DESTINATIONS = 2
const MAX_DESTINATIONS = 15

// ── Icono de estado por input ─────────────────────────────────
function StatusDot({ loc }) {
  if (loc.lat !== null) {
    // Coordenadas confirmadas
    return (
      <span title="Coordenadas válidas" className="flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#dcfce7"/>
          <path d="M7 12l3.5 3.5L17 9" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    )
  }
  if (loc.address.length > 0) {
    // Texto escrito pero sin seleccionar sugerencia
    return (
      <span title="Selecciona una dirección válida de la lista" className="flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#fef9c3"/>
          <path d="M12 8v4m0 4h.01" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </span>
    )
  }
  // Vacío
  return (
    <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full border border-slate-200 bg-slate-50"/>
  )
}

export default function DestinationInput({ locations, setLocations, isLoaded }) {
  // Refs para cada instancia de Autocomplete (necesario para onPlaceChanged)
  const autocompleteRefs = useRef({})

  // ── Registrar instancia de Autocomplete por id ────────────
  function handleAutocompleteLoad(id, instance) {
    autocompleteRefs.current[id] = instance
  }

  // ── Cuando el usuario selecciona una sugerencia ───────────
  function handlePlaceChanged(id) {
    const instance = autocompleteRefs.current[id]
    if (!instance) return

    const place = instance.getPlace()

    // Si no tiene geometría, el usuario escribió algo sin seleccionar
    if (!place.geometry?.location) {
      // Marcar como sin coordenadas para forzar que seleccione
      setLocations(prev =>
        prev.map(loc => loc.id === id
          ? { ...loc, lat: null, lng: null }
          : loc
        )
      )
      return
    }

    setLocations(prev =>
      prev.map(loc => loc.id === id
        ? {
            ...loc,
            address: place.formatted_address ?? place.name ?? loc.address,
            lat:     place.geometry.location.lat(),
            lng:     place.geometry.location.lng(),
          }
        : loc
      )
    )
  }

  // ── Al editar manualmente: limpiar coords (ya no son válidas) ─
  function handleInputChange(id, value) {
    setLocations(prev =>
      prev.map(loc => loc.id === id
        ? { ...loc, address: value, lat: null, lng: null }
        : loc
      )
    )
  }

  // ── Agregar destino ───────────────────────────────────────
  function handleAdd() {
    if (locations.length >= MAX_DESTINATIONS) return
    setLocations(prev => [
      ...prev,
      { id: crypto.randomUUID(), address: '', lat: null, lng: null },
    ])
  }

  // ── Eliminar destino ──────────────────────────────────────
  function handleRemove(id) {
    if (locations.length <= MIN_DESTINATIONS) return
    delete autocompleteRefs.current[id]
    setLocations(prev => prev.filter(loc => loc.id !== id))
  }

  return (
    <div className="flex flex-col gap-3">

      {locations.map((loc, index) => (
        <div key={loc.id} className="flex items-center gap-2">

          {/* Número */}
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1D4ED8] text-white text-xs font-bold flex items-center justify-center select-none">
            {index + 1}
          </span>

          {/* Input con Autocomplete (o fallback si SDK no cargó) */}
          <div className="flex-1 min-w-0">
            {isLoaded ? (
              <Autocomplete
                onLoad={(instance) => handleAutocompleteLoad(loc.id, instance)}
                onPlaceChanged={() => handlePlaceChanged(loc.id)}
                options={{ types: ['geocode', 'establishment'] }}
              >
                <input
                  type="text"
                  value={loc.address}
                  onChange={e => handleInputChange(loc.id, e.target.value)}
                  placeholder={index === 0 ? 'Punto de inicio' : `Destino ${index + 1}`}
                  className={`
                    w-full rounded-lg border px-3 py-2 text-sm text-slate-800
                    placeholder-slate-300 outline-none transition-all duration-150
                    focus:ring-2
                    ${loc.lat !== null
                      ? 'border-green-300 focus:border-green-400 focus:ring-green-100'
                      : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'
                    }
                  `}
                />
              </Autocomplete>
            ) : (
              // SDK aún no cargado: input básico de espera
              <input
                type="text"
                disabled
                placeholder="Cargando Places…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400 bg-slate-50 cursor-wait"
              />
            )}
          </div>

          {/* Indicador de estado */}
          <StatusDot loc={loc} />

          {/* Eliminar */}
          <button
            type="button"
            onClick={() => handleRemove(loc.id)}
            disabled={locations.length <= MIN_DESTINATIONS}
            title={locations.length <= MIN_DESTINATIONS ? 'Mínimo 2 destinos' : 'Eliminar destino'}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      ))}

      {/* Hint de validación global */}
      {locations.some(l => l.address.length > 0 && l.lat === null) && (
        <p className="text-xs text-amber-600 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
          Selecciona una dirección de la lista de sugerencias
        </p>
      )}

      {/* Botón agregar */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={locations.length >= MAX_DESTINATIONS}
        className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#1D4ED8] hover:text-[#1e3a8a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-start"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Agregar destino
        {locations.length >= MAX_DESTINATIONS && (
          <span className="text-xs text-slate-400 font-normal">(máx. {MAX_DESTINATIONS})</span>
        )}
      </button>

    </div>
  )
}