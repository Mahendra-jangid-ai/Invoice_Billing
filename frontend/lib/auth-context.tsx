'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiFetch, getErrorMessage, setUnauthorizedHandler } from '@/lib/api-client'
import { clearPwaCaches } from '@/lib/pwa-cache'
import { clearPendingOnboarding } from '@/lib/pending-onboarding'

export interface AuthUser {
  sessionId?: string
  userId: string
  email: string
  name: string
  avatarUrl?: string
  avatarPreset?: string
  emailVerified?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; emailVerified?: boolean; error?: string }>
  logout: () => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; emailVerified?: boolean; error?: string }>
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; isNewUser?: boolean; emailVerified?: boolean; error?: string }>
  verifyEmail: (code: string) => Promise<{ success: boolean; error?: string }>
  resendVerificationEmail: (force?: boolean) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthProfile = {
  userId: string
  email: string
  name: string
  sessionId?: string
  avatarUrl?: string
  avatarPreset?: string
  emailVerified?: boolean
}

function toAuthUser(data: AuthProfile): AuthUser {
  return {
    sessionId: data.sessionId,
    userId: data.userId,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatarUrl || '',
    avatarPreset: data.avatarPreset || 'character-1',
    emailVerified: Boolean(data.emailVerified),
  }
}

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
        const data = await apiFetch<AuthProfile & { sessionId: string }>('/api/auth/me')
        setUser(toAuthUser(data))
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
      const data = await apiFetch<AuthProfile>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setUser(toAuthUser(data))
      if (data.emailVerified) {
        clearPendingOnboarding()
      }
      return { success: true, emailVerified: Boolean(data.emailVerified) }
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
      const data = await apiFetch<AuthProfile>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      })
      setUser(toAuthUser(data))
      return { success: true, emailVerified: Boolean(data.emailVerified) }
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Sign up failed') }
    }
  }, [])

  const loginWithGoogle = useCallback(async (credential: string) => {
    try {
      const data = await apiFetch<AuthProfile & { isNewUser?: boolean }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      })
      setUser(toAuthUser(data))
      if (!data.isNewUser) {
        clearPendingOnboarding()
      }
      return {
        success: true,
        isNewUser: Boolean(data.isNewUser),
        emailVerified: Boolean(data.emailVerified),
      }
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Google sign-in failed') }
    }
  }, [])

  const verifyEmail = useCallback(async (code: string) => {
    try {
      const data = await apiFetch<AuthProfile>('/api/auth/verify-email/confirm', {
        method: 'POST',
        body: JSON.stringify({ code }),
      })
      setUser(toAuthUser(data))
      return { success: true }
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Verification failed') }
    }
  }, [])

  const resendVerificationEmail = useCallback(async (force = false) => {
    try {
      await apiFetch('/api/auth/verify-email/send', {
        method: 'POST',
        body: JSON.stringify({ force }),
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Could not send verification code') }
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch<AuthProfile & { sessionId: string }>('/api/auth/me')
      setUser(toAuthUser(data))
    } catch {
      setUser(null)
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
        loginWithGoogle,
        verifyEmail,
        resendVerificationEmail,
        refreshUser,
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
