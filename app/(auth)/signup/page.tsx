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
    <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Create your account</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start managing your invoices in minutes
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name */}
        <div>
          <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Strength indicator */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">{strength.label} password</p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          {confirmPassword.length > 0 && confirmPassword !== password && (
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">Passwords do not match</p>
          )}
        </div>

        <button
          id="signup-submit"
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
