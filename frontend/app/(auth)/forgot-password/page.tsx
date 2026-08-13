'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { apiFetch, getErrorMessage } from '@/lib/api-client'
import { useFeedback } from '@/components/confirm-provider'

export default function ForgotPasswordPage() {
  const { error: showError } = useFeedback()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSubmitted(true)
    } catch (error) {
      showError({
        title: 'Request failed',
        description: getErrorMessage(error, 'Network error. Please try again.'),
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_20px_70px_-30px_rgba(17,24,39,0.12)] backdrop-blur">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111827] text-white shadow-sm shadow-[#111827]/20">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-[#111827]">Check your email</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link.
          Check your inbox (and spam folder).
        </p>
        <p className="mt-2 text-xs text-[#9CA3AF]">
          (In development: check the server console for the reset URL)
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#111827] hover:text-[#2563EB]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-8 shadow-[0_20px_70px_-30px_rgba(17,24,39,0.12)] backdrop-blur">
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#2563EB]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#111827]">Forgot password?</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-[#374151]">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10"
            />
          </div>
        </div>

        <button
          id="forgot-submit"
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#2563EB]/10 transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
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
