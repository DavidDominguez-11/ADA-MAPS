// src/components/RouteControls.jsx — ADA Maps v4
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { optimizeRoute } from '../services/api'

const MODES = [
  {
    value: 'closed', label: 'Ruta cerrada', sub: 'Regresa al inicio',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4l2 2"/></svg>,
  },
  {
    value: 'open', label: 'Ruta abierta', sub: 'Termina en destino',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  },
]

const ERR = {
  auth:         { label: 'Sesión expirada',      bg: 'color-mix(in srgb,var(--warning) 10%,transparent)',     b: 'color-mix(in srgb,var(--warning) 25%,transparent)',     c: 'var(--warning)' },
  network:      { label: 'Sin conexión',          bg: 'var(--secondary)',                                       b: 'var(--border)',                                          c: 'var(--foreground)' },
  validation:   { label: 'Error de validación',   bg: 'color-mix(in srgb,var(--warning) 10%,transparent)',     b: 'color-mix(in srgb,var(--warning) 25%,transparent)',     c: 'var(--warning)' },
  google_api:   { label: 'Error de Google API',   bg: 'color-mix(in srgb,var(--primary) 10%,transparent)',     b: 'color-mix(in srgb,var(--primary) 25%,transparent)',     c: 'var(--primary)' },
  optimization: { label: 'Error de optimización', bg: 'color-mix(in srgb,var(--destructive) 10%,transparent)', b: 'color-mix(in srgb,var(--destructive) 25%,transparent)', c: 'var(--destructive)' },
  unknown:      { label: 'Error inesperado',      bg: 'color-mix(in srgb,var(--destructive) 10%,transparent)', b: 'color-mix(in srgb,var(--destructive) 25%,transparent)', c: 'var(--destructive)' },
}

function short(loc) { return loc?.address?.split(',')[0]?.trim() ?? '—' }

export default function RouteControls({
  routeMode, setRouteMode,
  locations, canCalculate, radiusValidation,
  matrix, setMatrix, route, setRoute, distance, setDistance,
}) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [apiErr,  setApiErr]  = useState(null)
  const [errType, setErrType] = useState(null)
  const [execMs,  setExecMs]  = useState(null)

  const validCount = locations.filter(l => l.lat !== null).length
  const validLocs  = locations.filter(l => l.lat !== null && l.lng !== null)
  const hasRoute   = !!route

  function reset() { setMatrix(null); setRoute(null); setDistance(null); setApiErr(null); setErrType(null); setExecMs(null) }

  async function calc() {
    if (!canCalculate) return
    reset(); setLoading(true)
    let token
    try { token = await currentUser.getIdToken() }
    catch { setApiErr('No se pudo obtener token.'); setErrType('auth'); setLoading(false); return }

    const { data, error, errorType: et } = await optimizeRoute({ locations: validLocs, mode: routeMode }, token)
    setLoading(false)
    if (error) {
      setApiErr(error); setErrType(et)
      if (et === 'auth') { await logout(); navigate('/login', { replace: true }) }
      return
    }
    if (!data?.success || !Array.isArray(data?.route) || typeof data?.distance !== 'number') {
      setApiErr('Respuesta inesperada.'); setErrType('unknown'); return
    }
    setMatrix(data.matrix ?? null); setRoute(data.route); setDistance(data.distance); setExecMs(data.execution_time_ms ?? null)
  }

  const DOT = { origin: 'var(--success)', destination: 'var(--destructive)', stop: 'var(--primary)' }

  return (
    <>
      <style>{`
        .rc { border-radius:12px; border:1px solid var(--border); background:var(--card); overflow:hidden; font-family:'Poppins',sans-serif; }

        .rc-hd { display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border); padding:12px 16px; }
        .rc-hd-ic { color:var(--muted-foreground); }
        .rc-hd-t  { font-size:13px; font-weight:500; color:var(--foreground); }

        .rc-body { padding:16px; display:flex; flex-direction:column; gap:14px; }

        .rc-mode-lbl { font-size:11px; font-weight:600; color:var(--muted-foreground); text-transform:uppercase; letter-spacing:0.07em; margin-bottom:8px; }
        .rc-mode-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .rc-mode-btn {
          display:flex; align-items:center; gap:8px; border-radius:8px;
          border:1px solid var(--border);
          background:color-mix(in srgb,var(--secondary) 30%,transparent);
          padding:10px 12px; cursor:pointer; text-align:left;
          font-family:'Poppins',sans-serif; color:var(--muted-foreground);
          transition:all 0.12s;
        }
        .rc-mode-btn:hover:not(.on) { border-color:color-mix(in srgb,var(--muted-foreground) 50%,transparent); }
        .rc-mode-btn.on { border-color:var(--primary); background:color-mix(in srgb,var(--primary) 10%,transparent); color:var(--primary); }
        .rc-mode-n  { font-size:12px; font-weight:600; line-height:1.2; }
        .rc-mode-s  { font-size:10px; opacity:.7; margin-top:2px; }

        /* Status */
        .rc-st-warn {
          display:flex; align-items:flex-start; gap:8px;
          border-radius:8px; padding:9px 12px; font-size:12px;
          background:color-mix(in srgb,var(--warning) 10%,transparent);
          border:1px solid color-mix(in srgb,var(--warning) 20%,transparent);
          color:var(--warning);
        }
        .rc-st-c { text-align:center; padding:6px 0; font-size:12px; }
        .rc-st-c.mu { color:var(--muted-foreground); }
        .rc-st-c.wa { color:var(--warning); }
        .rc-st-c.ok { display:flex; align-items:center; justify-content:center; gap:6px; color:var(--success); font-weight:500; }

        /* Button */
        .rc-btn {
          width:100%; border-radius:8px; border:none;
          padding:12px 16px;
          font-family:'Poppins',sans-serif; font-size:13px; font-weight:600;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
          transition:all 0.15s; letter-spacing:0.01em;
        }
        .rc-btn.go  { background:var(--primary); color:var(--primary-foreground); }
        .rc-btn.go:hover  { opacity:.9; }
        .rc-btn.go:active { transform:scale(0.98); }
        .rc-btn.off { background:var(--secondary); color:var(--muted-foreground); cursor:not-allowed; }

        .rc-err { border-radius:8px; padding:10px 12px; font-size:12px; }

        /* Result card */
        .rc-res {
          border-radius:12px; border:1px solid var(--border);
          background:var(--card); overflow:hidden; margin-top:12px;
        }
        .rc-met { display:grid; grid-template-columns:1fr 1fr 1fr; border-bottom:1px solid var(--border); }
        .rc-met-cell { padding:12px 8px; text-align:center; }
        .rc-met-cell + .rc-met-cell { border-left:1px solid var(--border); }
        .rc-met-v { font-size:18px; font-weight:700; color:var(--foreground); line-height:1; }
        .rc-met-l { font-size:10px; color:var(--muted-foreground); margin-top:3px; }

        .rc-seq { padding:14px 16px; }
        .rc-seq-ttl { font-size:10px; font-weight:700; color:var(--success); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:10px; }
        .rc-seq-row { display:flex; align-items:center; gap:8px; margin-bottom:7px; }
        .rc-seq-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .rc-seq-num { font-size:10px; color:var(--muted-foreground); width:18px; text-align:right; flex-shrink:0; font-family:monospace; }
        .rc-seq-nm  { font-size:12px; font-weight:500; color:var(--foreground); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .rc-seq-bd  { font-size:10px; font-weight:600; flex-shrink:0; }
        .rc-seq-bd.s { color:var(--success); }
        .rc-seq-bd.e { color:var(--destructive); }

        .rc-time { display:flex; align-items:center; justify-content:flex-end; gap:5px; border-top:1px solid var(--border); padding:7px 14px; font-size:11px; color:var(--muted-foreground); font-family:monospace; }

        .sp-w { width:14px; height:14px; border:2px solid rgba(0,0,0,0.3); border-top-color:var(--primary-foreground); border-radius:50%; animation:spin 0.75s linear infinite; display:inline-block; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* Controls card */}
      <div className="rc">
        <div className="rc-hd">
          <span className="rc-hd-ic">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
          </span>
          <span className="rc-hd-t">Optimización</span>
        </div>

        <div className="rc-body">
          {/* Mode */}
          <div>
            <p className="rc-mode-lbl">Tipo de ruta</p>
            <div className="rc-mode-grid">
              {MODES.map(m => (
                <button
                  key={m.value} type="button"
                  className={`rc-mode-btn${routeMode === m.value ? ' on' : ''}`}
                  onClick={() => { setRouteMode(m.value); reset() }}
                >
                  {m.icon}
                  <div>
                    <div className="rc-mode-n">{m.label}</div>
                    <div className="rc-mode-s">{m.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            {!radiusValidation.valid ? (
              <div className="rc-st-warn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }} aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01"/>
                </svg>
                <span>Radio máximo 100 km{radiusValidation.distanceKm ? `. Detectado: ${radiusValidation.distanceKm} km` : ''}.</span>
              </div>
            ) : validCount === 0 ? (
              <p className="rc-st-c mu">Agrega al menos 2 destinos</p>
            ) : validCount < 2 ? (
              <p className="rc-st-c wa">{2 - validCount} destino{validCount === 1 ? '' : 's'} más necesario{validCount === 1 ? '' : 's'}</p>
            ) : !hasRoute ? (
              <p className="rc-st-c ok">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                {validCount} destinos listos para optimizar
              </p>
            ) : null}
          </div>

          {/* Button */}
          <button type="button" className={`rc-btn${canCalculate && !loading ? ' go' : ' off'}`} onClick={calc} disabled={!canCalculate || loading}>
            {loading ? (
              <><span className="sp-w" />Calculando…</>
            ) : hasRoute ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Recalcular ruta
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                  <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
                Calcular ruta óptima
              </>
            )}
          </button>

          {/* Error */}
          {apiErr && (() => { const m = ERR[errType] ?? ERR.unknown; return (
            <div className="rc-err" style={{ background:m.bg, border:`1px solid ${m.b}`, color:m.c }}>
              <span style={{ fontWeight:600 }}>{m.label}: </span>{apiErr}
            </div>
          )})()}
        </div>
      </div>

      {/* Result */}
      {hasRoute && distance != null && (
        <div className="rc-res">
          <div className="rc-met">
            {[
              { v: route.length, l: 'Paradas' },
              { v: (distance/1000).toFixed(2), l: 'km totales' },
              { v: routeMode === 'closed' ? 'Cerrada' : 'Abierta', l: 'Tipo' },
            ].map((m,i) => <div key={i} className="rc-met-cell"><div className="rc-met-v">{m.v}</div><div className="rc-met-l">{m.l}</div></div>)}
          </div>

          <div className="rc-seq">
            <p className="rc-seq-ttl">Secuencia óptima</p>
            {route.map((idx, step) => {
              const loc = validLocs[idx]
              const isFirst = step === 0, isLast = step === route.length - 1
              let role = 'stop'
              if (isFirst) role = 'origin'
              else if (isLast && routeMode === 'open') role = 'destination'
              return (
                <div key={`${idx}-${step}`} className="rc-seq-row" title={loc?.address}>
                  <span className="rc-seq-dot" style={{ background: DOT[role] }}/>
                  <span className="rc-seq-num">{step + 1}</span>
                  <span className="rc-seq-nm">{short(loc)}</span>
                  {isFirst && <span className="rc-seq-bd s">Inicio</span>}
                  {isLast && routeMode === 'open' && <span className="rc-seq-bd e">Fin</span>}
                </div>
              )
            })}
            {routeMode === 'closed' && (
              <div className="rc-seq-row" style={{ opacity:.45 }}>
                <span className="rc-seq-dot" style={{ background:'var(--success)' }}/>
                <span className="rc-seq-num">↩</span>
                <span className="rc-seq-nm" style={{ fontStyle:'italic', color:'var(--muted-foreground)' }}>{short(validLocs[route[0]])}</span>
              </div>
            )}
          </div>

          {execMs != null && (
            <div className="rc-time">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {execMs} ms
            </div>
          )}
        </div>
      )}
    </>
  )
}