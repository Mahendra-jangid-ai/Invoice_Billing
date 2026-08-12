'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getSafeRedirectPath } from '@/lib/utils'
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
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = getSafeRedirectPath(searchParams.get('from'))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      router.push(from)
      router.refresh()
    } else {
      setError(result.error || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-100px)] overflow-hidden bg-[#F9FAFB] px-4 py-12">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white to-transparent opacity-80" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[48px] border border-[#E5E7EB] bg-white/95 p-8 shadow-[0_40px_80px_-54px_rgba(17,24,39,0.12)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Billing Studio logo" className="mx-auto mb-4 h-16 w-auto object-contain" />
          <h2 className="text-3xl font-semibold text-[#111827]">Welcome back</h2>
          <p className="mt-2 text-sm text-[#475569]">Sign in to your account and get back to invoicing fast.</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-[20px] border border-[#FEE2E2] bg-[#FEF3F2] px-4 py-3 text-sm text-[#991B1B]"
          >
            {error}
          </div>
        )}

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
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#2563EB] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#2563EB]/20 transition duration-200 hover:bg-[#1D4ED8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  )
}
