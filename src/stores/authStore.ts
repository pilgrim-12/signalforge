import { create } from 'zustand'
import { User } from 'firebase/auth'
import { onAuthChange, signIn, signUp, signOut, signInWithGoogle } from '@/lib/firebase/auth'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
  initAuth: () => () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ loading }),

  login: async (email, password) => {
    try {
      await signIn(email, password)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }
    }
  },

  loginWithGoogle: async () => {
    try {
      await signInWithGoogle()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google login failed'
      }
    }
  },

  register: async (email, password) => {
    try {
      await signUp(email, password)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }
    }
  },

  logout: async () => {
    try {
      await signOut()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }
    }
  },

  initAuth: () => {
    if (get().initialized) {
      return () => {}
    }

    set({ initialized: true })

    const unsubscribe = onAuthChange((user) => {
      set({ user, isAuthenticated: !!user, loading: false })
    })

    return unsubscribe
  },
}))
