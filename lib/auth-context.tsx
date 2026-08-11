'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface AuthUser {
  sessionId: string
  userId: string
  email: string
  name: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch current session on mount
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data.userId) {
            setUser({ sessionId: data.sessionId, userId: data.userId, email: data.email, name: data.name })
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchCurrentUser()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok && data.userId) {
        setUser({ sessionId: data.sessionId, userId: data.userId, email: data.email, name: data.name })
        return { success: true }
      }
      return { success: false, error: data.error || 'Login failed' }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      setUser(null)
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (res.ok && data.userId) {
        setUser({ sessionId: data.sessionId, userId: data.userId, email: data.email, name: data.name })
        return { success: true }
      }
      return { success: false, error: data.error || 'Sign up failed' }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
