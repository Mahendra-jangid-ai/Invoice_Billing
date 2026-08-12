'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { apiFetch, getErrorMessage } from '@/lib/api-client'
import { validateStrongPassword } from '@/lib/utils'

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
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_20px_70px_-30px_rgba(17,24,39,0.12)] backdrop-blur">
        <h2 className="text-xl font-semibold text-[#111827]">Invalid link</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          This reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-medium text-[#111827] hover:text-[#2563EB]"
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

    const passwordError = validateStrongPassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to reset password'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_20px_70px_-30px_rgba(17,24,39,0.12)] backdrop-blur">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111827] text-white shadow-sm shadow-[#111827]/20">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-[#111827]">Password reset!</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Your password has been reset successfully. Redirecting to sign in…
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-8 shadow-[0_20px_70px_-30px_rgba(17,24,39,0.12)] backdrop-blur">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#111827]">Set new password</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Choose a strong password for your account
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827]"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium text-[#374151]">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 12 characters with upper, lower, number & symbol"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-10 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="reset-confirm-password" className="mb-1.5 block text-sm font-medium text-[#374151]">
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="reset-confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10"
            />
          </div>
          {confirmPassword.length > 0 && confirmPassword !== password && (
            <p className="mt-1 text-xs text-[#6B7280]">Passwords do not match</p>
          )}
        </div>

        <button
          id="reset-submit"
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#2563EB]/10 transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
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
