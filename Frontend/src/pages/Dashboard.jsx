// src/pages/Dashboard.jsx
// ─────────────────────────────────────────────────────────────
// Página principal protegida — solo usuarios autenticados.
// Aquí irá el contenido real de la app (Route Optimizer).
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { currentUser, logout } = useAuth()
  const navigate  = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const { error } = await logout()
    setLoading(false)

    if (error) {
      console.error('[Logout]', error)
      return
    }
    navigate('/login', { replace: true })
  }

  const displayName  = currentUser?.displayName  ?? null
  const email        = currentUser?.email        ?? ''
  const photoURL     = currentUser?.photoURL     ?? null
  const initials     = (displayName ?? email).slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Icono mini */}
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <line x1="12" y1="36" x2="24" y2="12" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="24" y1="12" x2="38" y2="28" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="12" y1="36" x2="38" y2="28" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="12" r="4" fill="#1D4ED8"/>
            <circle cx="38" cy="28" r="4" fill="#1D4ED8"/>
            <circle cx="12" cy="36" r="4" fill="#1E3A8A"/>
          </svg>
          <span className="text-sm font-mono text-slate-500 tracking-widest uppercase select-none">
            Route Optimizer v1.0
          </span>
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          {photoURL ? (
            <img src={photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200"/>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white text-xs font-bold select-none">
              {initials}
            </div>
          )}
          <div className="hidden sm:block text-right">
            {displayName && <p className="text-xs font-semibold text-slate-700 leading-tight">{displayName}</p>}
            <p className="text-xs text-slate-400 leading-tight">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="
              ml-2 text-xs font-medium text-slate-500 border border-slate-200
              rounded-lg px-3 py-1.5 hover:bg-slate-50 hover:text-slate-700
              transition-colors disabled:opacity-50
            "
          >
            {loading ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </div>
      </header>

      {/* Content area */}
      <main className="max-w-4xl mx-auto px-6 py-14 animate-fadein">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {displayName ? `Hola, ${displayName.split(' ')[0]} 👋` : 'Hola 👋'}
          </h2>
          <p className="text-slate-500 text-sm">
            Sesión activa como <span className="font-medium text-slate-700">{email}</span>
          </p>
        </div>

        {/* Placeholder de módulos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Optimizar Ruta',   icon: '🗺️', desc: 'Calcula la ruta más eficiente entre puntos.' },
            { label: 'Historial',        icon: '📋', desc: 'Revisa rutas previas y sus métricas.' },
            { label: 'Configuración',    icon: '⚙️', desc: 'Ajusta parámetros del algoritmo.' },
          ].map(card => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 px-5 py-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">{card.label}</h3>
              <p className="text-xs text-slate-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
