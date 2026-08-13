'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  consumePendingSignupVerify,
  hasPendingSignupVerify,
  markPendingOnboarding,
} from '@/lib/pending-onboarding'
import { useFeedback } from '@/components/confirm-provider'
import { Loader2, Mail, RefreshCw } from 'lucide-react'

const RESEND_COOLDOWN_SEC = 60

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, loading, verifyEmail, resendVerificationEmail } = useAuth()
  const { error: showError, success } = useFeedback()

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const sentOnMount = useRef(false)

  useEffect(() => {
    if (loading || !user || user.emailVerified || sentOnMount.current) return
    sentOnMount.current = true

    // Signup already triggers OTP on the server — don't send again on landing here.
    if (hasPendingSignupVerify()) {
      setCooldown(RESEND_COOLDOWN_SEC)
      return
    }

    void resendVerificationEmail().then((result) => {
      if (result.success) {
        setCooldown(RESEND_COOLDOWN_SEC)
      }
    })
  }, [loading, user, resendVerificationEmail])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const code = digits.join('')

  const handleDigitChange = (index: number, value: string) => {
    const next = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const copy = [...prev]
      copy[index] = next
      return copy
    })
    if (next && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (text: string) => {
    const chars = text.replace(/\D/g, '').slice(0, 6).split('')
    if (chars.length === 0) return
    setDigits((prev) => {
      const copy = [...prev]
      for (let i = 0; i < 6; i++) copy[i] = chars[i] || ''
      return copy
    })
    const focusIndex = Math.min(chars.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      showError({
        title: 'Enter the full code',
        description: 'Please enter all 6 digits from your email.',
      })
      return
    }

    setSubmitting(true)
    const result = await verifyEmail(code)
    if (result.success) {
      success({
        title: 'Email verified',
        description: 'Your email address has been confirmed.',
      })
      const isNewSignup = consumePendingSignupVerify()
      if (isNewSignup) {
        markPendingOnboarding()
        router.replace('/onboarding')
      } else {
        router.replace('/dashboard')
      }
      router.refresh()
      return
    }

    showError({
      title: 'Verification failed',
      description: result.error || 'Invalid or expired code.',
    })
    setSubmitting(false)
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    const result = await resendVerificationEmail(true)
    setResending(false)
    if (result.success) {
      success({
        title: 'Code sent',
        description: 'A new verification code has been sent to your email.',
      })
      setCooldown(RESEND_COOLDOWN_SEC)
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } else {
      showError({
        title: 'Could not resend',
        description: result.error || 'Please try again in a moment.',
      })
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  if (user.emailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F7FB] px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white to-transparent opacity-80" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <img src="/logo.png" alt="Billing Studio logo" className="mx-auto mb-3 h-14 w-auto object-contain" />
          <p className="text-sm text-slate-500">Modern invoicing for your business</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-semibold text-[#111827] sm:text-3xl">Verify your email</h2>
            <p className="mt-2 text-sm text-[#475569]">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-[#111827]">{user.email}</span>. Enter it below to
              confirm this is your real email address.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="flex justify-center gap-2 sm:gap-3">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e.key)}
                  onPaste={(e) => {
                    e.preventDefault()
                    handlePaste(e.clipboardData.getData('text'))
                  }}
                  className="h-12 w-10 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-center text-lg font-semibold text-[#111827] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 sm:h-14 sm:w-12"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#2563EB] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2563EB]/20 transition duration-200 active:scale-[0.98] hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </span>
              ) : (
                'Verify email'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-[#6B7280]">
            Check your spam folder if you don&apos;t see the email. Codes expire after 10 minutes.
          </p>
        </div>
      </div>
    </div>
  )
}
