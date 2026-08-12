import { SignJWT, jwtVerify } from 'jose'
import type { Response, Request } from 'express'

const SESSION_COOKIE = 'bs_session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

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
  return new SignJWT({
    sessionId: payload.sessionId,
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    expiresAt: payload.expiresAt.toISOString(),
  })
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
      typeof payload.expiresAt !== 'string' ||
      typeof payload.sessionId !== 'string'
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
    return null
  }
}

export async function createSession(
  res: Response,
  userId: string,
  email: string,
  name: string,
): Promise<{ sessionId: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  const sessionId = globalThis.crypto.randomUUID()
  const token = await encrypt({ sessionId, userId, email, name, expiresAt })

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    maxAge: SESSION_DURATION_MS,
    path: '/',
  })

  return { sessionId, expiresAt }
}

export async function getSession(req: Request): Promise<SessionPayload | null> {
  const token = req.cookies?.[SESSION_COOKIE]
  return decrypt(token)
}

export async function deleteSession(res: Response): Promise<void> {
  res.clearCookie(SESSION_COOKIE, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
}

export { SESSION_COOKIE }
