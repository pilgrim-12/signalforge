'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange, signIn, signUp, signOut, signInWithGoogle } from '@/lib/firebase/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signIn(email, password)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }
    }
  }

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google login failed'
      }
    }
  }

  const register = async (email: string, password: string) => {
    try {
      await signUp(email, password)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }
    }
  }

  const logout = async () => {
    try {
      await signOut()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
  }
}
