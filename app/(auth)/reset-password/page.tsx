'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 text-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Invalid link</h2>
        <p className="mt-2 text-sm text-slate-500">
          This reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-medium text-slate-900 hover:text-slate-700 dark:text-slate-100"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 2500)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm shadow-slate-950/20 dark:bg-slate-100 dark:text-slate-950">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Password reset!</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your password has been reset successfully. Redirecting to sign in…
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Set new password</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose a strong password for your account
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
        <div>
          <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="reset-confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="reset-confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          {confirmPassword.length > 0 && confirmPassword !== password && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Passwords do not match</p>
          )}
        </div>

        <button
          id="reset-submit"
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting…
            </>
          ) : (
            'Reset password'
          )}
        </button>
      </form>
    </div>
  )
}
