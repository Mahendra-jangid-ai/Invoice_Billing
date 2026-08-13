const KEY = 'pendingOnboarding'
const SIGNUP_VERIFY_KEY = 'pendingSignupVerify'

export function markPendingOnboarding(): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(KEY, '1')
}

export function clearPendingOnboarding(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(KEY)
}

export function hasPendingOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(KEY) === '1'
}

export function markPendingSignupVerify(): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SIGNUP_VERIFY_KEY, '1')
}

export function hasPendingSignupVerify(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(SIGNUP_VERIFY_KEY) === '1'
}

export function consumePendingSignupVerify(): boolean {
  if (typeof window === 'undefined') return false
  const pending = sessionStorage.getItem(SIGNUP_VERIFY_KEY) === '1'
  if (pending) sessionStorage.removeItem(SIGNUP_VERIFY_KEY)
  return pending
}
