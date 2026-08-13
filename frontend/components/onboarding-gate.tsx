'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useBilling } from '@/lib/context'
import { isOnboardingComplete } from '@/lib/onboarding'
import { Loader2 } from 'lucide-react'

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']
const OPEN_WHEN_INCOMPLETE = ['/onboarding']

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { company, loading: billingLoading } = useBilling()

  const checking = authLoading || (Boolean(user) && billingLoading)
  const complete = isOnboardingComplete(company)
  const onOnboarding = pathname === '/onboarding'
  const onAuth = isAuthPath(pathname)

  useEffect(() => {
    if (checking) return
    if (!user || onAuth) return

    if (!complete && !OPEN_WHEN_INCOMPLETE.includes(pathname)) {
      router.replace('/onboarding')
      return
    }

    if (complete && onOnboarding) {
      router.replace('/dashboard')
    }
  }, [checking, user, complete, pathname, onOnboarding, onAuth, router])

  if (checking && user && !onAuth && !onOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  return children
}
