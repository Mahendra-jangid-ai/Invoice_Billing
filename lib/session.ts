import 'server-only'
import crypto from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'bs_session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 1 day

export interface SessionPayload {
  sessionId: string
  userId: string
  email: string
  name: string
  expiresAt: Date
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('billing-studio')
    .setAudience('billing-app')
    .setExpirationTime('1d')
    .sign(getSecretKey())
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
      issuer: 'billing-studio',
      audience: 'billing-app',
    })
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.expiresAt !== 'string'
    ) {
      return null
    }
    return {
      sessionId: payload.sessionId,
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      expiresAt: new Date(payload.expiresAt),
    }
  } catch {
    // Token is invalid or expired — not an error condition, just unauthenticated
    return null
  }
}

export async function createSession(userId: string, email: string, name: string): Promise<{ sessionId: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  const sessionId = crypto.randomUUID()
  const token = await encrypt({ sessionId, userId, email, name, expiresAt })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  })

  return { sessionId, expiresAt }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return decrypt(token)
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function updateSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = await decrypt(token)
  if (!payload || !token) return

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export { SESSION_COOKIE }
