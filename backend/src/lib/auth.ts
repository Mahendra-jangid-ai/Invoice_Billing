import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { sendError } from './api-errors.js'
import { getActiveSessionRecord, touchSessionRecord } from './session-store.js'
import { getSession, type SessionPayload } from './session.js'

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, 12)
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function getCurrentUser(req: Request): Promise<SessionPayload | null> {
  const session = await getSession(req)
  if (!session?.sessionId || !session.userId) return null

  const activeSession = await getActiveSessionRecord(session.sessionId)
  if (!activeSession || activeSession.userId !== session.userId) return null

  await touchSessionRecord(session.sessionId)
  return session
}

export async function requireAuth(
  req: Request,
  res: Response,
): Promise<SessionPayload | null> {
  const session = await getCurrentUser(req)
  if (!session?.userId) {
    sendError(res, 401, 'Authentication required', 'AUTHENTICATION_REQUIRED')
    return null
  }
  return session
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  getCurrentUser(req)
    .then((user) => {
      if (!user) {
        sendError(res, 401, 'Authentication required', 'AUTHENTICATION_REQUIRED')
        return
      }
      req.user = user
      next()
    })
    .catch(next)
}

declare global {
  namespace Express {
    interface Request {
      user?: SessionPayload
    }
  }
}

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
  console.info('[SECURITY]', JSON.stringify({ event, timestamp: new Date().toISOString(), ...context }))
}

export function getClientIp(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  return ip === '::1' ? '127.0.0.1' : ip
}
