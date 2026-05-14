// src/components/ProtectedRoute.jsx
// ─────────────────────────────────────────────────────────────
// Guarda de ruta: redirige a /login si el usuario no está autenticado.
// Muestra un spinner mientras Firebase verifica la sesión inicial.
// ─────────────────────────────────────────────────────────────
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  // Mientras Firebase verifica la sesión, no redirigir aún
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-9 w-9 text-navy-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span className="text-sm text-slate-400 font-mono tracking-wide">
            Verificando sesión…
          </span>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado → redirigir al login
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}
