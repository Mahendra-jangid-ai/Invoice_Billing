import { jwtVerify } from 'jose'

export const SESSION_COOKIE = 'bs_session'

export interface SessionPayload {
  sessionId: string
  userId: string
  email: string
  name: string
  expiresAt: Date
  emailVerified: boolean
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
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
      emailVerified: payload.emailVerified !== false,
    }
  } catch {
    return null
  }
}
