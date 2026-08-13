'use client'

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { Loader2 } from 'lucide-react'
import { isGoogleSignInConfigured, useGoogleAuth } from '@/components/google-auth-provider'

interface GoogleSignInButtonProps {
  mode: 'login' | 'signup'
  disabled?: boolean
  onSuccess: (credential: string) => void
  onError?: () => void
  onUnavailable?: () => void
}

export function GoogleSignInButton({
  mode,
  disabled = false,
  onSuccess,
  onError,
  onUnavailable,
}: GoogleSignInButtonProps) {
  const googleAuth = useGoogleAuth()
  const label = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'

  const handleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      onError?.()
      return
    }
    onSuccess(response.credential)
  }

  if (googleAuth.loading) {
    return (
      <div className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
      </div>
    )
  }

  if (!isGoogleSignInConfigured(googleAuth)) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onUnavailable?.()}
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] shadow-sm transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark />
        {label}
      </button>
    )
  }

  return (
    <div
      className={disabled ? 'pointer-events-none opacity-60' : ''}
      aria-disabled={disabled}
    >
      <div className="flex w-full justify-center overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm [&>div]:!w-full [&_iframe]:!w-full">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError?.()}
          theme="outline"
          size="large"
          shape="pill"
          text={mode === 'signup' ? 'signup_with' : 'signin_with'}
          width={360}
        />
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-5.522 0-10-4.477-10-10s4.478-10 10-10c2.837 0 5.352 1.178 7.207 3.07l5.657-5.657C33.64 10.053 29.082 8 24 8 14.523 8 7 15.523 7 25s7.523 17 17 17c9.379 0 17-7.621 17-17 0-1.134-.117-2.244-.389-3.417z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c2.837 0 5.352 1.178 7.207 3.07l5.657-5.657C33.64 10.053 29.082 8 24 8c-7.682 0-14.344 4.337-17.694 10.691z" />
      <path fill="#4CAF50" d="M24 43c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A9.86 9.86 0 0 1 24 37c-5.023 0-9.327-3.317-10.854-7.886l-6.52 5.02C10.516 39.556 16.827 43 24 43z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

export function isGoogleSignInAvailable(): boolean {
  return true
}
