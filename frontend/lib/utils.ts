import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Validates a post-login redirect path to prevent open-redirect attacks. */
export function getSafeRedirectPath(path: string | null | undefined, fallback = '/dashboard'): string {
  if (!path) return fallback
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) return fallback
  try {
    const url = new URL(path, 'http://localhost')
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}

export function validateStrongPassword(password: string): string | null {
  if (password.length < 12) return 'Password must be at least 12 characters'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must contain at least one special character'
  return null
}
