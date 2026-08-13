'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getSafeRedirectPath } from '@/lib/utils'
import { markPendingOnboarding } from '@/lib/pending-onboarding'
import { useFeedback } from '@/components/confirm-provider'
import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { AuthDivider } from '@/components/auth-divider'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-100px)] items-center justify-center bg-[#F9FAFB]">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loginWithGoogle } = useAuth()
  const { error: showError, info } = useFeedback()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const from = getSafeRedirectPath(searchParams.get('from'))

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      info({
        title: 'Session expired',
        description: 'Please sign in again to continue.',
      })
    }
  }, [searchParams, info])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      if (result.emailVerified === false) {
        router.replace('/verify-email')
      } else {
        router.replace(from)
      }
      router.refresh()
    } else {
      showError({
        title: 'Sign in failed',
        description: result.error || 'Login failed',
      })
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async (credential: string) => {
    setGoogleLoading(true)
    const result = await loginWithGoogle(credential)
    if (result.success) {
      if (result.isNewUser) {
        markPendingOnboarding()
        router.replace('/onboarding')
      } else if (result.emailVerified === false) {
        router.replace('/verify-email')
      } else {
        router.replace(from)
      }
      router.refresh()
    } else {
      showError({
        title: 'Google sign-in failed',
        description: result.error || 'Could not sign in with Google',
      })
      setGoogleLoading(false)
    }
  }

  const busy = loading || googleLoading

  return (
    <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-8">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-semibold text-[#111827] sm:text-3xl">Welcome back</h2>
        <p className="mt-2 text-sm text-[#475569]">
          Sign in with Google or use the email and password you registered with.
        </p>
      </div>

      <GoogleSignInButton
        mode="login"
        disabled={busy}
        onSuccess={handleGoogleSignIn}
        onUnavailable={() =>
          showError({
            title: 'Google sign-in unavailable',
            description: 'Set GOOGLE_CLIENT_ID in backend .env to enable Google sign-in.',
          })
        }
        onError={() =>
          showError({
            title: 'Google sign-in cancelled',
            description: 'Please try again or use your email and password.',
          })
        }
      />
      <AuthDivider label="or sign in with email" />

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-3">
            <label htmlFor="login-email" className="block text-sm font-medium text-[#374151]">
              Email address
            </label>
            <div className="relative rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 shadow-sm shadow-[#111827]/5 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-transparent pl-11 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-[#374151]">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]">
                Forgot password?
              </Link>
            </div>
            <div className="relative rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 shadow-sm shadow-[#111827]/5 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent pr-12 pl-11 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={busy}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2563EB]/20 transition duration-200 active:scale-[0.98] hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
            Create one
          </Link>
        </p>
    </div>
  )
}
