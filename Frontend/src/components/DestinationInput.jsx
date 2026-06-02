// src/components/DestinationInput.jsx — ADA Maps v4
import { useRef, useState } from 'react'
import { Autocomplete } from '@react-google-maps/api'

const MIN = 2
const MAX = 15

export default function DestinationInput({ locations, setLocations, isLoaded }) {
  const acRefs  = useRef({})
  const [focused, setFocused] = useState(null)

  function onLoad(id, inst) { acRefs.current[id] = inst }

  function onPlaceChanged(id) {
    const inst = acRefs.current[id]
    if (!inst) return
    const place = inst.getPlace()
    if (!place.geometry?.location) {
      setLocations(prev => prev.map(l => l.id === id ? { ...l, lat: null, lng: null } : l))
      return
    }
    setLocations(prev => prev.map(l => l.id === id
      ? { ...l,
          address: place.formatted_address ?? place.name ?? l.address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng() }
      : l
    ))
  }

  function onChange(id, val) {
    setLocations(prev => prev.map(l => l.id === id ? { ...l, address: val, lat: null, lng: null } : l))
  }

  function add() {
    if (locations.length >= MAX) return
    setLocations(prev => [...prev, { id: crypto.randomUUID(), address: '', lat: null, lng: null }])
  }

  function remove(id) {
    if (locations.length <= MIN) return
    delete acRefs.current[id]
    setLocations(prev => prev.filter(l => l.id !== id))
  }

  const validCount = locations.filter(l => l.lat !== null).length
  const hasInvalid = locations.some(l => l.address.length > 0 && l.lat === null)

  return (
    <>
      <style>{`
        .dl { border-radius:12px; border:1px solid var(--border); background:var(--card); overflow:hidden; font-family:'Poppins',sans-serif; }

        .dl-hd { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); padding:12px 16px; background:var(--card); }
        .dl-hd-l { display:flex; align-items:center; gap:8px; }
        .dl-hd-ic { color:var(--muted-foreground); }
        .dl-hd-t  { font-size:13px; font-weight:500; color:var(--foreground); }
        .dl-hd-c  { font-size:11px; color:var(--muted-foreground); font-family:monospace; }

        .dl-list { padding:12px; display:flex; flex-direction:column; gap:8px; }

        /* Row */
        .dl-row {
          display:flex; align-items:center; gap:10px;
          border-radius:8px; border:1px solid var(--border);
          background: color-mix(in srgb, var(--secondary) 30%, transparent);
          padding:8px 10px;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
          cursor:default;
        }
        .dl-row.valid   { border-color:color-mix(in srgb,var(--success) 30%,transparent); background:color-mix(in srgb,var(--success) 6%,transparent); }
        .dl-row.pending { border-color:color-mix(in srgb,var(--warning) 30%,transparent); background:color-mix(in srgb,var(--warning) 6%,transparent); }
        .dl-row.foc     { box-shadow:0 0 0 1px var(--primary); border-color:var(--primary); }

        /* Badge */
        .dl-badge {
          display:flex; align-items:center; justify-content:center;
          width:28px; height:28px; border-radius:6px;
          font-size:11px; font-weight:700; flex-shrink:0;
          transition: background 0.15s, color 0.15s;
        }
        .dl-badge.valid { background:var(--success); color:var(--success-foreground); }
        .dl-badge.empty { background:var(--secondary); color:var(--muted-foreground); }

        .dl-inp-wrap { flex:1; min-width:0; }
        .dl-inp {
          width:100%; border:none; background:transparent;
          font-family:'Poppins',sans-serif; font-size:13px; font-weight:400;
          color:var(--foreground); outline:none; padding:0;
        }
        .dl-inp::placeholder { color:color-mix(in srgb,var(--muted-foreground) 60%,transparent); }
        .dl-inp.valid { color:var(--success); }
        .dl-inp:disabled { color:var(--muted-foreground); cursor:wait; }

        /* Status icons */
        .dl-ic-wrap {
          display:flex; align-items:center; justify-content:center;
          width:24px; height:24px; border-radius:50%; flex-shrink:0;
        }
        .dl-ic-wrap.valid   { background:color-mix(in srgb,var(--success) 20%,transparent); color:var(--success); }
        .dl-ic-wrap.pending { background:color-mix(in srgb,var(--warning) 20%,transparent); }
        .dl-ic-wrap.empty   { border:2px dashed var(--border); width:22px; height:22px; }

        /* Remove btn */
        .dl-rm {
          width:24px; height:24px; border-radius:6px;
          border:none; background:transparent;
          color:var(--muted-foreground); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          padding:0; flex-shrink:0;
          opacity:0; transition:opacity 0.12s, color 0.12s, background 0.12s;
        }
        .dl-row:hover .dl-rm { opacity:1; }
        .dl-rm:hover { color:var(--destructive); background:color-mix(in srgb,var(--destructive) 10%,transparent); }
        .dl-rm:disabled { cursor:not-allowed; opacity:.25 !important; }

        /* Warning */
        .dl-warn {
          display:flex; align-items:center; gap:8px;
          border-radius:8px;
          background:color-mix(in srgb,var(--warning) 10%,transparent);
          border:1px solid color-mix(in srgb,var(--warning) 20%,transparent);
          padding:8px 12px; color:var(--warning); font-size:12px;
        }

        /* Add btn */
        .dl-add {
          display:flex; align-items:center; gap:6px;
          width:100%; padding:8px 10px;
          border:none; background:transparent;
          font-family:'Poppins',sans-serif; font-size:13px; font-weight:500;
          color:var(--primary); cursor:pointer; border-radius:8px;
          transition: background 0.12s;
          justify-content:flex-start;
        }
        .dl-add:hover { background:color-mix(in srgb,var(--primary) 10%,transparent); }
        .dl-add:disabled { color:var(--muted-foreground); cursor:not-allowed; }
        .dl-add:disabled:hover { background:transparent; }
        .dl-add-max { margin-left:auto; font-size:11px; color:var(--muted-foreground); font-weight:400; }

        /* Footer */
        .dl-ft {
          border-top:1px solid var(--border); padding:10px 16px;
          background:color-mix(in srgb,var(--secondary) 30%,transparent);
          display:flex; align-items:center; justify-content:space-between;
        }
        .dl-ft-l { font-size:12px; color:var(--muted-foreground); }
        .dl-ft-c { font-size:12px; font-family:monospace; font-weight:500; color:var(--muted-foreground); }
        .dl-ft-c.ok { color:var(--success); }

        /* Spinner */
        .sp-warn {
          width:12px; height:12px; flex-shrink:0;
          border:2px solid color-mix(in srgb,var(--warning) 40%,transparent);
          border-top-color:var(--warning);
          border-radius:50%;
          animation:spin 0.75s linear infinite;
          display:inline-block;
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="dl">
        {/* Header */}
        <div className="dl-hd">
          <div className="dl-hd-l">
            <span className="dl-hd-ic">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </span>
            <span className="dl-hd-t">Destinos</span>
          </div>
          <span className="dl-hd-c">{locations.length} / {MAX}</span>
        </div>

        {/* List */}
        <div className="dl-list">
          {locations.map((loc, i) => {
            const isValid   = loc.lat !== null
            const isPending = !isValid && loc.address.length > 0
            const isFoc     = focused === loc.id

            let rowCls = 'dl-row'
            if (isValid)        rowCls += ' valid'
            else if (isPending) rowCls += ' pending'
            if (isFoc)          rowCls += ' foc'

            return (
              <div key={loc.id} className={rowCls}>
                <div className={`dl-badge ${isValid ? 'valid' : 'empty'}`}>{i + 1}</div>

                <div className="dl-inp-wrap">
                  {isLoaded ? (
                    <Autocomplete
                      onLoad={inst => onLoad(loc.id, inst)}
                      onPlaceChanged={() => onPlaceChanged(loc.id)}
                      options={{ types: ['geocode', 'establishment'] }}
                    >
                      <input
                        type="text"
                        value={loc.address}
                        onChange={e => onChange(loc.id, e.target.value)}
                        onFocus={() => setFocused(loc.id)}
                        onBlur={() => setFocused(null)}
                        placeholder={i === 0 ? 'Punto de inicio' : `Destino ${i + 1}`}
                        className={`dl-inp${isValid ? ' valid' : ''}`}
                      />
                    </Autocomplete>
                  ) : (
                    <input disabled placeholder="Cargando Places…" className="dl-inp" />
                  )}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                  {isValid ? (
                    <div className="dl-ic-wrap valid">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  ) : isPending ? (
                    <div className="dl-ic-wrap pending">
                      <span className="sp-warn" />
                    </div>
                  ) : (
                    <div className="dl-ic-wrap empty" />
                  )}

                  <button
                    type="button"
                    className="dl-rm"
                    onClick={() => remove(loc.id)}
                    disabled={locations.length <= MIN}
                    title="Eliminar"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}

          {hasInvalid && (
            <div className="dl-warn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0 }} aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              Selecciona una opción de la lista de autocompletado
            </div>
          )}

          <button type="button" className="dl-add" onClick={add} disabled={locations.length >= MAX}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Agregar destino
            {locations.length >= MAX && <span className="dl-add-max">(máx. {MAX})</span>}
          </button>
        </div>

        {/* Footer */}
        <div className="dl-ft">
          <span className="dl-ft-l">Destinos válidos</span>
          <span className={`dl-ft-c${validCount >= 2 ? ' ok' : ''}`}>{validCount} / {locations.length}</span>
        </div>
      </div>
    </>
  )
}