import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth as firebaseGetAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | undefined
let auth: Auth | undefined

// Initialize Firebase lazily and only on client side with valid config
export function getFirebaseApp(): FirebaseApp | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  if (!firebaseConfig.apiKey) {
    return undefined
  }

  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }

  return app
}

export function getAuth(): Auth | undefined {
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) return undefined

  if (!auth) {
    auth = firebaseGetAuth(firebaseApp)
  }

  return auth
}
