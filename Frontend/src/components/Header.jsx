// src/components/Header.jsx — ADA Maps v4 · Dark Theme
import { useState, useRef, useEffect } from 'react'

export default function Header({ user, onLogout, isLoggingOut }) {
  const email       = user?.email ?? ''
  const displayName = user?.displayName ?? null
  const photoURL    = user?.photoURL ?? null
  const initials    = (displayName ?? email).slice(0, 2).toUpperCase()

  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <>
      <style>{`
        .hdr {
          position: sticky; top: 0; z-index: 50;
          height: 56px;
          border-bottom: 1px solid var(--border);
          background: var(--sidebar);
          display: flex; align-items: center;
          padding: 0 16px;
          font-family: 'Poppins', sans-serif;
        }
        @media (min-width:1024px){ .hdr { padding: 0 24px; } }

        /* Logo */
        .hdr-logo { display:flex; align-items:center; gap:10px; }
        .hdr-logo-box {
          width:32px; height:32px; border-radius:9px;
          background: var(--primary);
          display:flex; align-items:center; justify-content:center;
          color: var(--primary-foreground);
          flex-shrink:0;
        }
        .hdr-logo-name {
          font-size:14px; font-weight:600;
          color: var(--foreground);
          letter-spacing:-0.2px;
        }

        .hdr-div {
          width:1px; height:20px;
          background: var(--border);
          margin: 0 16px; flex-shrink:0;
        }

        /* Badge */
        .hdr-badge {
          display:flex; align-items:center; gap:6px;
          background: color-mix(in srgb, var(--primary) 12%, transparent);
          border-radius:999px;
          padding: 4px 12px; flex-shrink:0;
        }
        .hdr-badge span {
          font-size:12px; font-weight:500;
          color: var(--primary);
        }

        .hdr-spacer { flex:1; }

        /* User trigger */
        .hdr-user {
          display:flex; align-items:center; gap:8px;
          padding: 4px 8px;
          border-radius:8px; border:none;
          background:transparent; cursor:pointer;
          font-family:'Poppins',sans-serif;
          transition: background 0.12s;
          position:relative;
        }
        .hdr-user:hover { background: var(--secondary); }

        .hdr-avatar {
          width:28px; height:28px; border-radius:50%;
          border: 1px solid var(--border);
          background: color-mix(in srgb, var(--primary) 15%, transparent);
          color: var(--primary);
          font-size:11px; font-weight:600;
          display:flex; align-items:center; justify-content:center;
          overflow:hidden; flex-shrink:0;
        }
        .hdr-avatar img { width:100%; height:100%; object-fit:cover; }

        .hdr-email {
          font-size:13px; color: var(--muted-foreground);
          display:none; font-weight:400;
        }
        @media (min-width:768px){ .hdr-email { display:block; } }

        .hdr-chevron { color: var(--muted-foreground); }

        /* Dropdown */
        .hdr-drop {
          position:absolute; top:calc(100% + 6px); right:0;
          min-width:220px;
          background: var(--popover);
          border: 1px solid var(--border);
          border-radius:10px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          overflow:hidden; z-index:200;
          animation: fadeIn 0.12s ease both;
        }
        .hdr-drop-info { padding:10px 14px; border-bottom:1px solid var(--border); }
        .hdr-drop-name { font-size:13px; font-weight:600; color:var(--foreground); margin-bottom:2px; }
        .hdr-drop-email { font-size:12px; color:var(--muted-foreground); }
        .hdr-drop-item {
          display:flex; align-items:center; gap:8px;
          padding:9px 14px; width:100%;
          border:none; background:transparent;
          font-family:'Poppins',sans-serif;
          font-size:13px; font-weight:500;
          color: var(--destructive);
          cursor:pointer; text-align:left;
          transition: background 0.12s;
        }
        .hdr-drop-item:hover { background: color-mix(in srgb, var(--destructive) 10%, transparent); }
        .hdr-drop-item:disabled { opacity:.5; cursor:not-allowed; }
      `}</style>

      <header className="hdr">
        <div className="hdr-logo">
          <div className="hdr-logo-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <span className="hdr-logo-name">ADA Maps</span>
        </div>

        <div className="hdr-div" />

        <div className="hdr-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--primary)' }} aria-hidden="true">
            <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6-10l6 3m0 10l5.447-2.724A1 1 0 0 0 21 16.382V5.618a1 1 0 0 0-1.447-.894L15 7m0 13V7"/>
          </svg>
          <span>Route Optimizer v1.0</span>
        </div>

        <div className="hdr-spacer" />

        <div ref={ref} style={{ position: 'relative' }}>
          <button className="hdr-user" onClick={() => setOpen(o => !o)} aria-haspopup="true" aria-expanded={open}>
            <div className="hdr-avatar">
              {photoURL ? <img src={photoURL} alt="" /> : initials}
            </div>
            <span className="hdr-email">{email}</span>
            <span className="hdr-chevron">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </span>
          </button>

          {open && (
            <div className="hdr-drop" role="menu">
              <div className="hdr-drop-info">
                <p className="hdr-drop-name">{displayName ?? 'Usuario'}</p>
                <p className="hdr-drop-email">{email}</p>
              </div>
              <button
                className="hdr-drop-item"
                onClick={() => { setOpen(false); onLogout?.() }}
                disabled={isLoggingOut}
                role="menuitem"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {isLoggingOut ? 'Saliendo…' : 'Cerrar sesión'}
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  )
}