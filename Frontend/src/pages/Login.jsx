// src/pages/Login.jsx — ADA Maps v4 · Dark Mode
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

function GraphIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <line x1="12" y1="36" x2="24" y2="12" stroke="#e07b4a" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="24" y1="12" x2="38" y2="28" stroke="#e07b4a" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="36" x2="38" y2="28" stroke="#7a4a30" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
      <line x1="24" y1="12" x2="32" y2="38" stroke="#7a4a30" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
      <line x1="12" y1="36" x2="32" y2="38" stroke="#e07b4a" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="24" cy="12" r="4" fill="#e07b4a"/>
      <circle cx="38" cy="28" r="4" fill="#e07b4a"/>
      <circle cx="12" cy="36" r="4" fill="#c45f2a"/>
      <circle cx="32" cy="38" r="3.5" fill="#f0a070"/>
    </svg>
  )
}

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [error,      setError]      = useState('')
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [loadingG,   setLoadingG]   = useState(false)

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
    if (err) { setError(err); return }
    navigate('/', { replace: true })
  }

  async function handleGoogle() {
    setError('')
    setLoadingG(true)
    const { error: err } = await loginWithGoogle()
    setLoadingG(false)
    if (err) { setError(err); return }
    navigate('/', { replace: true })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        .lg-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a22;
          font-family: 'Poppins', sans-serif;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }

        /* Fondo: bg.png con overlay oscuro encima */
        .lg-bg {
          position: absolute;
          inset: 0;
          background-image: url('/images/bg.png');
          background-size: cover;
          background-position: center;
          opacity: 0.12;
          pointer-events: none;
          z-index: 0;
        }
        .lg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(26,26,34,0.92) 0%,
            rgba(20,20,26,0.88) 100%
          );
          pointer-events: none;
          z-index: 2;
        }

        .lg-card {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 380px;
          background: #1f1f28;
          border: 1px solid #2f2f3d;
          border-radius: 16px;
          padding: 36px 32px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
        }

        .lg-badge {
          text-align: center;
          font-size: 11px;
          color: #7a7a8a;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 20px;
          font-family: monospace;
        }

        .lg-icon { display: flex; justify-content: center; margin-bottom: 16px; }

        .lg-title {
          text-align: center;
          font-size: 22px;
          font-weight: 700;
          color: #f2f2f2;
          letter-spacing: -0.02em;
          margin-bottom: 28px;
        }

        .lg-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }

        .lg-label {
          font-size: 12px;
          font-weight: 500;
          color: #9090a8;
          letter-spacing: 0.03em;
        }

        .lg-input {
          width: 100%;
          background: #252532;
          border: 1px solid #2f2f3d;
          border-radius: 9px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: 'Poppins', sans-serif;
          color: #f2f2f2;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lg-input::placeholder { color: #4a4a5a; }
        .lg-input:focus {
          border-color: #e07b4a;
          box-shadow: 0 0 0 3px rgba(224,123,74,0.12);
        }

        .lg-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: rgba(179,64,64,0.1);
          border: 1px solid rgba(179,64,64,0.25);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #e07070;
          margin-bottom: 14px;
        }

        .lg-btn-primary {
          width: 100%;
          background: #e07b4a;
          color: #111118;
          border: none;
          border-radius: 9px;
          padding: 11px 20px;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s, transform 0.1s;
          margin-top: 4px;
        }
        .lg-btn-primary:hover { opacity: 0.9; }
        .lg-btn-primary:active { transform: scale(0.98); }
        .lg-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .lg-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }
        .lg-divider-line { flex: 1; height: 1px; background: #2f2f3d; }
        .lg-divider-text { font-size: 12px; color: #4a4a5a; }

        .lg-btn-google {
          width: 100%;
          background: #252532;
          color: #d0d0e0;
          border: 1px solid #2f2f3d;
          border-radius: 9px;
          padding: 10px 20px;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.12s, border-color 0.12s, transform 0.1s;
        }
        .lg-btn-google:hover { background: #2a2a38; border-color: #3a3a4d; }
        .lg-btn-google:active { transform: scale(0.98); }
        .lg-btn-google:disabled { opacity: 0.45; cursor: not-allowed; }

        .lg-spin {
          width: 14px; height: 14px;
          border: 2px solid rgba(17,17,24,0.3);
          border-top-color: #111118;
          border-radius: 50%;
          animation: lgSpin 0.75s linear infinite;
          display: inline-block;
        }
        .lg-spin-g {
          width: 14px; height: 14px;
          border: 2px solid #2f2f3d;
          border-top-color: #7a7a8a;
          border-radius: 50%;
          animation: lgSpin 0.75s linear infinite;
          display: inline-block;
        }
        @keyframes lgSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="lg-page">
        {/* Fondo imagen */}
        <div className="lg-bg" aria-hidden="true"/>
        <div className="lg-overlay" aria-hidden="true"/>

        <div className="lg-card">

          <p className="lg-badge">Route Optimizer</p>

          <div className="lg-icon">
            <GraphIcon />
          </div>

          <h1 className="lg-title">Bienvenido de nuevo</h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="lg-field">
              <label className="lg-label" htmlFor="email">Email</label>
              <input
                id="email" type="email"
                className="lg-input"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="lg-field">
              <label className="lg-label" htmlFor="password">Contraseña</label>
              <input
                id="password" type="password"
                className="lg-input"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="lg-error" role="alert">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zM9 7a1 1 0 0 1 2 0v4a1 1 0 1 1-2 0V7zm1 7a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 14z" clipRule="evenodd"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="lg-btn-primary"
              disabled={loadingBtn || loadingG}
            >
              {loadingBtn ? <span className="lg-spin"/> : null}
              {loadingBtn ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <div className="lg-divider">
            <div className="lg-divider-line"/>
            <span className="lg-divider-text">o</span>
            <div className="lg-divider-line"/>
          </div>

          <button
            type="button"
            className="lg-btn-google"
            onClick={handleGoogle}
            disabled={loadingBtn || loadingG}
          >
            {loadingG ? <span className="lg-spin-g"/> : <GoogleIcon/>}
            {loadingG ? 'Conectando…' : 'Continuar con Google'}
          </button>

        </div>
      </div>
    </>
  )
}