'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'

interface GoogleAuthConfig {
  enabled: boolean
  clientId: string
  loading: boolean
}

const GoogleAuthContext = createContext<GoogleAuthConfig>({
  enabled: false,
  clientId: '',
  loading: true,
})

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GoogleAuthConfig>({
    enabled: false,
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    loading: true,
  })

  useEffect(() => {
    let cancelled = false

    async function loadConfig() {
      try {
        const response = await fetch('/api/auth/google/config', { credentials: 'include' })
        if (!response.ok) throw new Error('config unavailable')
        const data = (await response.json()) as { enabled?: boolean; clientId?: string }
        if (cancelled) return
        setConfig({
          enabled: Boolean(data.enabled && data.clientId),
          clientId: data.clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          loading: false,
        })
      } catch {
        if (cancelled) return
        const fallbackId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
        setConfig({
          enabled: Boolean(fallbackId),
          clientId: fallbackId,
          loading: false,
        })
      }
    }

    void loadConfig()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => config, [config])

  if (config.clientId) {
    return (
      <GoogleAuthContext.Provider value={value}>
        <GoogleOAuthProvider clientId={config.clientId}>{children}</GoogleOAuthProvider>
      </GoogleAuthContext.Provider>
    )
  }

  return <GoogleAuthContext.Provider value={value}>{children}</GoogleAuthContext.Provider>
}

export function useGoogleAuth() {
  return useContext(GoogleAuthContext)
}

export function isGoogleSignInConfigured(config: GoogleAuthConfig): boolean {
  return Boolean(config.clientId) && (config.enabled || Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID))
}
