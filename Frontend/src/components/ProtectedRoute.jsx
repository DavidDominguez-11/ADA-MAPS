// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        background: '#1a1a22',
        fontFamily: 'Poppins, sans-serif',
      }}>
        <span style={{
          width: 28,
          height: 28,
          border: '2.5px solid rgba(224,123,74,0.2)',
          borderTopColor: '#e07b4a',
          borderRadius: '50%',
          animation: 'prSpin 0.75s linear infinite',
          display: 'inline-block',
        }}/>
        <span style={{ fontSize: 12, color: '#7a7a8a', letterSpacing: '0.04em' }}>
          Verificando sesión…
        </span>
        <style>{`@keyframes prSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}