'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useBilling } from '@/lib/context'
import { hasPendingOnboarding } from '@/lib/pending-onboarding'
import { Loader2 } from 'lucide-react'

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email']

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { loading: billingLoading } = useBilling()

  const [pendingOnboarding, setPendingOnboarding] = useState(false)
  const [pendingChecked, setPendingChecked] = useState(false)

  useEffect(() => {
    setPendingOnboarding(hasPendingOnboarding())
    setPendingChecked(true)
  }, [pathname, user])

  const checking = authLoading || (Boolean(user) && billingLoading) || (Boolean(user) && !pendingChecked)
  const onOnboarding = pathname === '/onboarding'
  const onAuth = isAuthPath(pathname)

  useEffect(() => {
    if (checking) return
    if (!user || onAuth) return

    if (pendingOnboarding && !onOnboarding) {
      router.replace('/onboarding')
      return
    }

    if (!pendingOnboarding && onOnboarding) {
      router.replace('/dashboard')
    }
  }, [checking, user, pendingOnboarding, pathname, onOnboarding, onAuth, router])

  if (checking && user && !onAuth && !onOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  return children
}
