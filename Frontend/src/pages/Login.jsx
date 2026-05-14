// src/pages/Login.jsx
// ─────────────────────────────────────────────────────────────
// Pantalla de Login — Route Optimizer v1.0
// Diseño: Technical Map Layer
// Auth: Firebase Email/Password + Google Sign-In
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Icono: nodos conectados (grafo de rutas) ─────────────────
function GraphIcon() {
  return (
    <svg
      width="48" height="48" viewBox="0 0 48 48"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Aristas */}
      <line x1="12" y1="36" x2="24" y2="12" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="24" y1="12" x2="38" y2="28" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="36" x2="38" y2="28" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
      <line x1="24" y1="12" x2="32" y2="38" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
      <line x1="12" y1="36" x2="32" y2="38" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Nodos */}
      <circle cx="24" cy="12" r="4"  fill="#1D4ED8"/>
      <circle cx="38" cy="28" r="4"  fill="#1D4ED8"/>
      <circle cx="12" cy="36" r="4"  fill="#1E3A8A"/>
      <circle cx="32" cy="38" r="3.5" fill="#3B82F6"/>
    </svg>
  )
}

// ── Icono Google ──────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

// ── Fondo: mapa de calles SVG ─────────────────────────────────
function MapBackground() {
  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none bg-[#F8FAFC]"
      aria-hidden="true"
    >
      <img
        src="src/public/images/bg.png"  // ← Cambia esto por la ruta de tu imagen
        alt=""
        className="w-full h-full object-cover opacity-20"
        aria-hidden="true"
      />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [error,      setError]      = useState('')
  const [loadingBtn, setLoadingBtn] = useState(false)   // email/pass
  const [loadingG,   setLoadingG]   = useState(false)   // google

  // ── Email / Password ────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoadingBtn(true)
    const { error: err } = await login(email.trim(), password)
    setLoadingBtn(false)

    if (err) {
      setError(err)
      return
    }
    navigate('/', { replace: true })
  }

  // ── Google ──────────────────────────────────────────────────
  async function handleGoogle() {
    setError('')
    setLoadingG(true)
    const { error: err } = await loginWithGoogle()
    setLoadingG(false)

    if (err) {
      setError(err)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-100 font-sans overflow-hidden">

      {/* Mapa de fondo */}
      <MapBackground />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-card px-8 py-9 animate-fadein"
        style={{ boxShadow: '0 8px 40px 0 rgba(30,58,138,0.13), 0 2px 8px 0 rgba(30,58,138,0.07)' }}
      >

        {/* Header badge */}
        <p className="text-center text-xs font-mono text-slate-400 tracking-widest uppercase mb-5 select-none">
          Route Optimizer
        </p>

        {/* Icono grafo */}
        <div className="flex justify-center mb-4">
          <GraphIcon />
        </div>

        {/* Título */}
        <h1 className="text-center text-[1.4rem] font-bold text-slate-900 mb-7 tracking-tight">
          Bienvenido de nuevo
        </h1>

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-xs font-medium text-slate-600 tracking-wide"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="
                w-full rounded-lg border border-slate-200 bg-white
                px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300
                outline-none transition-all duration-150
                focus:border-blue-600 focus:ring-2 focus:ring-blue-100
              "
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-xs font-medium text-slate-600 tracking-wide"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="
                w-full rounded-lg border border-slate-200 bg-white
                px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300
                outline-none transition-all duration-150
                focus:border-blue-600 focus:ring-2 focus:ring-blue-100
              "
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700"
            >
              <svg className="mt-0.5 shrink-0 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zM9 7a1 1 0 0 1 2 0v4a1 1 0 1 1-2 0V7zm1 7a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 14z" clipRule="evenodd"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Botón principal */}
          <button
            type="submit"
            disabled={loadingBtn || loadingG}
            className="
              w-full rounded-lg bg-[#1D4ED8] py-2.5 text-sm font-semibold text-white
              tracking-wide transition-all duration-150
              hover:bg-[#1e3a8a] active:scale-[.98]
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 mt-1
            "
          >
            {loadingBtn ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* ── Divisor ── */}
        <div className="relative flex items-center my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="mx-3 text-xs text-slate-400 select-none">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* ── Botón Google ── */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loadingBtn || loadingG}
          className="
            w-full flex items-center justify-center gap-2.5
            rounded-lg border border-slate-200 bg-white
            py-2.5 px-4 text-sm font-medium text-slate-700
            transition-all duration-150
            hover:bg-slate-50 hover:border-slate-300 active:scale-[.98]
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loadingG ? (
            <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : (
            <GoogleIcon />
          )}
          {loadingG ? 'Conectando…' : 'Continuar con Google'}
        </button>

      </div>
    </div>
  )
}
