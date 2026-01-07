import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from 'firebase/auth'
import { getAuth } from './config'

const googleProvider = new GoogleAuthProvider()

export async function signIn(email: string, password: string) {
  const auth = getAuth()
  if (!auth) throw new Error('Firebase not initialized')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUp(email: string, password: string) {
  const auth = getAuth()
  if (!auth) throw new Error('Firebase not initialized')
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function signInWithGoogle() {
  const auth = getAuth()
  if (!auth) throw new Error('Firebase not initialized')
  return signInWithPopup(auth, googleProvider)
}

export async function signOut() {
  const auth = getAuth()
  if (!auth) throw new Error('Firebase not initialized')
  return firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  const auth = getAuth()
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export { getAuth }
