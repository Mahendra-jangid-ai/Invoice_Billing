import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/session'
import type { SessionPayload } from '@/lib/session'
import crypto from 'crypto'

const BCRYPT_ROUNDS = 12

// ─── Password helpers ───────────────────────────────────────────────────────

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS)
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}

// ─── Token helpers (for password reset) ─────────────────────────────────────

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// ─── Auth helpers for API routes ─────────────────────────────────────────────

/**
 * Reads the session from the current request context (server component or route handler).
 * Returns the session payload or null if unauthenticated.
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  return getSession()
}

/**
 * Reads the session and returns it, or returns a 401 JSON response.
 * Use in API Route Handlers:
 *   const { user, errorResponse } = await requireAuth()
 *   if (errorResponse) return errorResponse
 */
export async function requireAuth(): Promise<{
  user: SessionPayload
  errorResponse: null
} | {
  user: null
  errorResponse: NextResponse
}> {
  const session = await getSession()
  if (!session || !session.userId) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    }
  }
  return { user: session, errorResponse: null }
}

// ─── Security logging ────────────────────────────────────────────────────────

type SecurityEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'SIGNUP_SUCCESS'
  | 'SIGNUP_FAILED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_SUCCESS'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'

export function logSecurityEvent(event: SecurityEvent, context: Record<string, string | number | boolean>): void {
  // Never log sensitive values — only safe metadata
  const safe = { event, timestamp: new Date().toISOString(), ...context }
  console.info('[SECURITY]', JSON.stringify(safe))
}

// ─── IP helper ───────────────────────────────────────────────────────────────

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
