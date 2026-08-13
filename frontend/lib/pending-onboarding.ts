const KEY = 'pendingOnboarding'

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
