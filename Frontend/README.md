# Route Optimizer — Módulo de Autenticación

Sistema de autenticación completo con **Firebase Auth** + **React + Vite + Tailwind CSS**.

---

## 🗂️ Estructura del proyecto

```
auth-system/
├── .env.example              ← Plantilla de variables de entorno
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx              ← Entry point
    ├── App.jsx               ← Router + rutas protegidas
    ├── index.css             ← Tailwind base styles
    ├── firebase/
    │   └── config.js         ← Inicialización Firebase (lee .env)
    ├── context/
    │   └── AuthContext.jsx   ← Estado global de auth + acciones
    ├── components/
    │   └── ProtectedRoute.jsx← Guarda de rutas privadas
    └── pages/
        ├── Login.jsx         ← Pantalla de login (diseño Technical Map)
        └── Dashboard.jsx     ← App principal (ruta protegida)
```

---

## ⚙️ Setup — paso a paso

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/) → **Agregar proyecto**
2. En tu proyecto: **Authentication** → **Sign-in method** → activa:
   - ✅ Email/contraseña
   - ✅ Google
3. Ve a **Configuración del proyecto** → **Tus apps** → agrega app web
4. Copia las credenciales que aparecen

### 3. Crear el archivo `.env`

Copia `.env.example` como `.env` en la raíz del proyecto y pega tus credenciales:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> ⚠️ **NUNCA subas el `.env` real a Git.** Ya está en `.gitignore` por defecto.

### 4. Levantar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

---

## 🔐 Flujo de autenticación

```
Usuario abre la app
      │
      ▼
¿Hay sesión activa? (onAuthStateChanged)
      │
   No │                  Sí
      ▼                   ▼
  /login              / (Dashboard)
      │
  Ingresa credenciales
      │
      ├── Email/Password → Firebase Auth
      └── Google Sign-In → Popup OAuth
              │
              ▼
        Token válido → estado global actualiza
              │
              ▼
         / (Dashboard)  ← ruta protegida
```

---

## 🧩 Archivos clave

| Archivo | Responsabilidad |
|---|---|
| `firebase/config.js` | Inicializa Firebase; lee todas las keys desde `.env` |
| `context/AuthContext.jsx` | Estado global (`currentUser`, `loading`); expone `login`, `loginWithGoogle`, `logout`; maneja errores con mensajes legibles |
| `components/ProtectedRoute.jsx` | Redirige a `/login` si no hay sesión; muestra spinner mientras Firebase verifica |
| `pages/Login.jsx` | UI completa + llama a `useAuth()` para autenticar |
| `pages/Dashboard.jsx` | Página protegida; muestra info de usuario + logout |

---

## 🏗️ Build para producción

```bash
npm run build
```

Los archivos estáticos quedan en `dist/`. Despliega en Vercel, Netlify, Firebase Hosting, etc.

> En tu plataforma de deploy configura las mismas variables de entorno (`VITE_*`) que están en `.env`.
