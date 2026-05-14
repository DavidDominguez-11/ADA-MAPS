// src/firebase/config.js
// ─────────────────────────────────────────────────────────────
// Todas las credenciales se leen desde variables de entorno.
// Nunca hardcodees claves aquí. Usa el archivo .env (ver .env.example)
// ─────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validar que las variables de entorno están cargadas
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]

requiredEnvVars.forEach((key) => {
  if (!import.meta.env[key]) {
    console.error(
      `[Firebase] Variable de entorno faltante: ${key}. ` +
      `Verifica tu archivo .env (ver .env.example).`
    )
  }
})

const app  = initializeApp(firebaseConfig)
export const auth            = getAuth(app)
export const googleProvider  = new GoogleAuthProvider()

// Forzar selección de cuenta en cada login con Google
googleProvider.setCustomParameters({ prompt: 'select_account' })

export default app
