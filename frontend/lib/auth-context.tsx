'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiFetch, getErrorMessage, setUnauthorizedHandler } from '@/lib/api-client'
import { clearPwaCaches } from '@/lib/pwa-cache'

export interface AuthUser {
  sessionId?: string
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

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      setUser(null)
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      } catch {
        // Ignore logout failures during forced sign-out
      }
      await clearPwaCaches()
    })

    return () => setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const data = await apiFetch<{
          userId: string
          email: string
          name: string
          sessionId: string
        }>('/api/auth/me')
        setUser({
          sessionId: data.sessionId,
          userId: data.userId,
          email: data.email,
          name: data.name,
        })
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
      const data = await apiFetch<{
        userId: string
        email: string
        name: string
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setUser({
        userId: data.userId,
        email: data.email,
        name: data.name,
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Login failed') }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Clear local session even if server logout fails
    } finally {
      setUser(null)
      await clearPwaCaches()
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const data = await apiFetch<{
        userId: string
        email: string
        name: string
      }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      })
      setUser({
        userId: data.userId,
        email: data.email,
        name: data.name,
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Sign up failed') }
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
