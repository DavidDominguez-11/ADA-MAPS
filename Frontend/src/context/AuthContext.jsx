// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
// Contexto global de autenticación.
// Expone: currentUser, loading, login, loginWithGoogle, logout
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

const AuthContext = createContext(null)

// ── Mensajes de error legibles para el usuario ──────────────
const AUTH_ERRORS = {
  'auth/user-not-found':       'No existe una cuenta con ese email.',
  'auth/wrong-password':       'Contraseña incorrecta. Intenta de nuevo.',
  'auth/invalid-email':        'El formato del email no es válido.',
  'auth/user-disabled':        'Esta cuenta ha sido deshabilitada.',
  'auth/too-many-requests':    'Demasiados intentos fallidos. Espera unos minutos.',
  'auth/network-request-failed': 'Sin conexión a internet. Verifica tu red.',
  'auth/popup-closed-by-user': 'Ventana de Google cerrada antes de completar.',
  'auth/cancelled-popup-request': 'Solo una ventana de login puede estar abierta.',
  'auth/invalid-credential':   'Credenciales inválidas. Verifica email y contraseña.',
}

function friendlyError(code) {
  return AUTH_ERRORS[code] ?? 'Ocurrió un error inesperado. Intenta de nuevo.'
}

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading,     setLoading]     = useState(true) // true mientras verifica sesión

  // Observador de sesión: se ejecuta al montar y cada vez que cambia el auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe // limpieza al desmontar
  }, [])

  // ── Acciones ────────────────────────────────────────────────
  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { user: result.user, error: null }
    } catch (err) {
      return { user: null, error: friendlyError(err.code) }
    }
  }

  async function loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return { user: result.user, error: null }
    } catch (err) {
      return { user: null, error: friendlyError(err.code) }
    }
  }

  async function logout() {
    try {
      await signOut(auth)
      return { error: null }
    } catch (err) {
      return { error: friendlyError(err.code) }
    }
  }

  const value = {
    currentUser,
    loading,
    login,
    loginWithGoogle,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook de consumo ──────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>')
  }
  return context
}
