// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Enrutador principal.
// Rutas protegidas → requieren sesión activa.
// ─────────────────────────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute   from './components/ProtectedRoute'
import Login            from './pages/Login'
import Dashboard        from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Ruta pública: Login */}
          <Route path="/login" element={<Login />} />

          {/* Ruta protegida: Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Cualquier otra ruta → al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
