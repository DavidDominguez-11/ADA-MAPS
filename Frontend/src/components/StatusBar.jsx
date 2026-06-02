// src/components/StatusBar.jsx — ADA Maps v4
export default function StatusBar({
  googleMapsActive, validDestinations, totalDestinations,
  hasOptimizedRoute, totalDistance,
}) {
  return (
    <>
      <style>{`
        .sb {
          display:flex; align-items:center; gap:24px;
          height:40px;
          border-bottom: 1px solid var(--border);
          background: color-mix(in srgb, var(--card) 50%, transparent);
          padding: 0 16px;
          font-family:'Poppins',sans-serif;
          overflow-x:auto;
        }
        @media(min-width:1024px){ .sb { padding:0 24px; } }

        .sb-item { display:flex; align-items:center; gap:7px; flex-shrink:0; white-space:nowrap; }

        .sb-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .sb-dot.on  { background:var(--success); animation:pulse 2s ease-in-out infinite; }
        .sb-dot.off { background:var(--destructive); }

        .sb-circle {
          width:8px; height:8px; border-radius:50%;
          background:var(--primary); flex-shrink:0;
        }

        .sb-txt { font-size:12px; color:var(--muted-foreground); }
        .sb-txt.ok { color:var(--success); font-weight:500; }

        .sb-spacer { flex:1; }

        .sb-live {
          display:flex; align-items:center; gap:6px;
          flex-shrink:0;
        }
        .sb-live-txt {
          font-size:11px; color:var(--muted-foreground);
          font-family:monospace; letter-spacing:0.06em;
        }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      <div className="sb" role="status" aria-live="polite">
        <div className="sb-item">
          <span className={`sb-dot ${googleMapsActive ? 'on' : 'off'}`} />
          <span className="sb-txt">{googleMapsActive ? 'Google Maps activo' : 'Google Maps inactivo'}</span>
        </div>

        <div className="sb-item">
          <span className="sb-circle" />
          <span className="sb-txt">{validDestinations} de {totalDestinations} destinos válidos</span>
        </div>

        {hasOptimizedRoute && totalDistance != null && (
          <div className="sb-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color:'var(--success)', flexShrink:0 }} aria-hidden="true">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span className="sb-txt ok">Ruta optimizada · {(totalDistance / 1000).toFixed(2)} km</span>
          </div>
        )}

        <div className="sb-spacer" />

        <div className="sb-live">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color:'var(--primary)', animation:'pulse 2s ease-in-out infinite' }} aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span className="sb-live-txt">LIVE</span>
        </div>
      </div>
    </>
  )
}