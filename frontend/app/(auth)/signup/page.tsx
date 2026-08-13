'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { validateStrongPassword } from '@/lib/utils'
import { useFeedback } from '@/components/confirm-provider'
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const { error: showError, warning } = useFeedback()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      warning({
        title: 'Passwords do not match',
        description: 'Please make sure both password fields match.',
      })
      return
    }

    const passwordError = validateStrongPassword(password)
    if (passwordError) {
      warning({
        title: 'Weak password',
        description: passwordError,
      })
      return
    }

    setLoading(true)
    const result = await signup(name, email, password)

    if (result.success) {
      router.push('/onboarding')
      router.refresh()
    } else {
      showError({
        title: 'Sign up failed',
        description: result.error || 'Sign up failed',
      })
      setLoading(false)
    }
  }

  const passwordStrength = (): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: '', color: '', width: '0%' }
    let score = 0
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    if (score <= 1) return { label: 'Weak', color: 'bg-[#CBD5E1]', width: '25%' }
    if (score === 2) return { label: 'Fair', color: 'bg-[#93C5FD]', width: '50%' }
    if (score === 3) return { label: 'Good', color: 'bg-[#2563EB]', width: '75%' }
    return { label: 'Strong', color: 'bg-[#1D4ED8]', width: '100%' }
  }
  const strength = passwordStrength()

  return (
    <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-8">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-semibold text-[#111827] sm:text-3xl">Create your account</h2>
        <p className="mt-2 text-sm text-[#475569]">Create your profile and begin sending invoices instantly.</p>
      </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-3">
            <label htmlFor="signup-name" className="block text-sm font-medium text-[#374151]">
              Full name
            </label>
            <div className="relative rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 shadow-sm shadow-[#111827]/5 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className="w-full bg-transparent pl-11 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="signup-email" className="block text-sm font-medium text-[#374151]">
              Email address
            </label>
            <div className="relative rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 shadow-sm shadow-[#111827]/5 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                id="signup-email"
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
            <label htmlFor="signup-password" className="block text-sm font-medium text-[#374151]">
              Password
            </label>
            <div className="relative rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 shadow-sm shadow-[#111827]/5 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 12 characters with upper, lower, number & symbol"
                className="w-full bg-transparent pr-12 pl-11 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#6B7280]">{strength.label} password</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-[#374151]">
              Confirm password
            </label>
            <div className="relative rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 shadow-sm shadow-[#111827]/5 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent pl-11 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none"
              />
            </div>
            {confirmPassword.length > 0 && confirmPassword !== password && (
              <p className="mt-1 text-xs text-[#6B7280]">Passwords do not match</p>
            )}
          </div>

          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#2563EB] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2563EB]/20 transition duration-200 active:scale-[0.98] hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
            Sign in
          </Link>
        </p>
    </div>
  )
}
