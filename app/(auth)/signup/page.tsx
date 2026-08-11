'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const result = await signup(name, email, password)

    if (result.success) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError(result.error || 'Sign up failed')
      setLoading(false)
    }
  }

  const passwordStrength = (): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: '', color: '', width: '0%' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    if (score <= 1) return { label: 'Weak', color: 'bg-slate-300', width: '25%' }
    if (score === 2) return { label: 'Fair', color: 'bg-slate-500', width: '50%' }
    if (score === 3) return { label: 'Good', color: 'bg-slate-900', width: '75%' }
    return { label: 'Strong', color: 'bg-slate-900', width: '100%' }
  }
  const strength = passwordStrength()

  return (
    <div className="relative min-h-[calc(100vh-100px)] overflow-hidden bg-[#F4F8FF] px-4 py-12">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#D9E9FF] to-transparent opacity-80" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[48px] border border-white/80 bg-white/95 p-8 shadow-[0_40px_80px_-54px_rgba(16,137,211,0.24)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Billing Studio logo" className="mx-auto mb-4 h-16 w-auto object-contain" />
          <h2 className="text-3xl font-semibold text-slate-950">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">Create your profile and begin sending invoices instantly.</p>
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
            <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700">
              Full name
            </label>
            <div className="relative rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm shadow-slate-200/70 focus-within:border-[#12B1D1] focus-within:ring-1 focus-within:ring-[#12B1D1]/20">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className="w-full bg-transparent pl-11 text-sm text-slate-950 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <div className="relative rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm shadow-slate-200/70 focus-within:border-[#12B1D1] focus-within:ring-1 focus-within:ring-[#12B1D1]/20">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-transparent pl-11 text-sm text-slate-950 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm shadow-slate-200/70 focus-within:border-[#12B1D1] focus-within:ring-1 focus-within:ring-[#12B1D1]/20">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-transparent pr-12 pl-11 text-sm text-slate-950 placeholder:text-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                <p className="mt-1 text-xs text-slate-500">{strength.label} password</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <div className="relative rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm shadow-slate-200/70 focus-within:border-[#12B1D1] focus-within:ring-1 focus-within:ring-[#12B1D1]/20">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent pl-11 text-sm text-slate-950 placeholder:text-slate-400 outline-none"
              />
            </div>
            {confirmPassword.length > 0 && confirmPassword !== password && (
              <p className="mt-1 text-xs text-slate-500">Passwords do not match</p>
            )}
          </div>

          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            className="w-full rounded-[22px] bg-gradient-to-r from-[#1089D3] to-[#12B1D1] py-4 text-sm font-semibold text-white shadow-lg shadow-[#1089D3]/20 transition duration-200 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#1089D3] hover:text-[#0E74C0]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
