'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        if (res.status === 429) {
          setError(data.error || 'Too many requests. Please try again later.')
        } else {
          // Show success anyway to prevent user enumeration
          setSubmitted(true)
        }
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm shadow-slate-950/20 dark:bg-slate-100 dark:text-slate-950">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Check your email</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link.
          Check your inbox (and spam folder).
        </p>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          (In development: check the server console for the reset URL)
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-slate-700 dark:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Forgot password?</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        <button
          id="forgot-submit"
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>
    </div>
  )
}
