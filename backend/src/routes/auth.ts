import type { Express, Request, Response } from 'express'
import crypto from 'crypto'
import { getDatabase } from '../lib/mongodb.js'
import {
  hashPassword,
  verifyPassword,
  logSecurityEvent,
  getClientIp,
  generateResetToken,
  hashToken,
  requireAuth,
  authMiddleware,
} from '../lib/auth.js'
import { createSession, deleteSession, getSession } from '../lib/session.js'
import {
  createSessionRecord,
  getActiveSessionRecord,
  listUserSessions,
  revokeSessionRecord,
  revokeUserSessionRecord,
} from '../lib/session-store.js'
import { checkRateLimit } from '../lib/rate-limit.js'
import { handleApiError, isMongoDuplicateKey, parseBody, sendError } from '../lib/api-errors.js'
import {
  LoginSchema,
  SignupSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ResourceIdSchema,
} from '../lib/schemas/api-schemas.js'

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000

export function registerAuthRoutes(app: Express): void {
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      sendError(res, 429, 'Too many login attempts. Please try again later.', 'RATE_LIMITED')
      return
    }

    try {
      const parsed = parseBody(res, req.body, LoginSchema)
      if (!parsed) return

      const emailRateLimit = checkRateLimit(`login:${ip}:${parsed.email}`, 8, 15 * 60 * 1000)
      if (!emailRateLimit.allowed) {
        sendError(res, 429, 'Too many login attempts for this account. Please try again later.', 'RATE_LIMITED')
        return
      }

      const db = await getDatabase()
      const userDoc = await db.collection('users').findOne({ email: parsed.email })
      const dummyHash = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.Q8H0Io7k7CzsV1.jT3rzH0K6mX7Eo6'
      const passwordHash = userDoc?.passwordHash || dummyHash
      const isValid = await verifyPassword(parsed.password, passwordHash)

      if (!userDoc || !isValid) {
        logSecurityEvent('LOGIN_FAILED', { email: parsed.email, ip })
        sendError(res, 401, 'Invalid email or password', 'AUTHENTICATION_REQUIRED')
        return
      }

      const { sessionId, expiresAt } = await createSession(res, userDoc.userId, userDoc.email, userDoc.name)
      await createSessionRecord(sessionId, userDoc.userId, userDoc.email, userDoc.name, {
        userAgent: req.headers['user-agent'] || 'Unknown device',
        ipAddress: ip,
      }, expiresAt)

      logSecurityEvent('LOGIN_SUCCESS', { userId: userDoc.userId, email: parsed.email, ip })
      res.json({ userId: userDoc.userId, email: userDoc.email, name: userDoc.name, sessionId })
    } catch (error) {
      handleApiError(res, error, 'Login failed. Please try again.')
    }
  })

  app.post('/api/auth/signup', async (req: Request, res: Response) => {
    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(`signup:${ip}`, 5, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      sendError(res, 429, 'Too many requests. Please try again later.', 'RATE_LIMITED')
      return
    }

    try {
      const parsed = parseBody(res, req.body, SignupSchema)
      if (!parsed) return

      const db = await getDatabase()
      const existing = await db.collection('users').findOne({ email: parsed.email })
      if (existing) {
        sendError(res, 409, 'An account with this email already exists', 'CONFLICT')
        return
      }

      const passwordHash = await hashPassword(parsed.password)
      const userId = crypto.randomUUID()

      await db.collection('users').insertOne({
        userId,
        name: parsed.name,
        email: parsed.email,
        passwordHash,
        role: 'user',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const { sessionId, expiresAt } = await createSession(res, userId, parsed.email, parsed.name)
      await createSessionRecord(sessionId, userId, parsed.email, parsed.name, {
        userAgent: req.headers['user-agent'] || 'Unknown device',
        ipAddress: ip,
      }, expiresAt)

      logSecurityEvent('SIGNUP_SUCCESS', { userId, email: parsed.email, ip })
      res.status(201).json({ userId, email: parsed.email, name: parsed.name, sessionId })
    } catch (error) {
      if (isMongoDuplicateKey(error)) {
        sendError(res, 409, 'An account with this email already exists', 'CONFLICT')
        return
      }
      handleApiError(res, error, 'Failed to create account. Please try again.')
    }
  })

  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
      const session = await getSession(req)
      if (session) {
        logSecurityEvent('LOGOUT', { userId: session.userId })
        if (session.sessionId) await revokeSessionRecord(session.sessionId)
      }
      await deleteSession(res)
      res.json({ success: true })
    } catch (error) {
      try {
        await deleteSession(res)
      } catch {
        // ignore
      }
      handleApiError(res, error, 'Logout failed')
    }
  })

  app.get('/api/auth/me', async (req: Request, res: Response) => {
    const user = await requireAuth(req, res)
    if (!user) return

    try {
      const activeSession = await getActiveSessionRecord(user.sessionId)
      if (!activeSession) {
        sendError(res, 401, 'Session expired', 'AUTHENTICATION_REQUIRED')
        return
      }
      res.json({
        userId: user.userId,
        email: user.email,
        name: user.name,
        sessionId: user.sessionId,
        deviceName: activeSession.deviceName,
        browser: activeSession.browser,
        os: activeSession.os,
        ipAddress: activeSession.ipAddress,
        createdAt: activeSession.createdAt,
        lastSeenAt: activeSession.lastSeenAt,
        expiresAt: activeSession.expiresAt,
      })
    } catch (error) {
      handleApiError(res, error, 'Failed to get user info')
    }
  })

  app.post('/api/auth/change-password', async (req: Request, res: Response) => {
    const user = await requireAuth(req, res)
    if (!user) return

    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(`change-password:${user.userId}`, 5, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      sendError(res, 429, 'Too many requests. Please try again later.', 'RATE_LIMITED')
      return
    }

    try {
      const parsed = parseBody(res, req.body, ChangePasswordSchema)
      if (!parsed) return

      const db = await getDatabase()
      const userDoc = await db.collection('users').findOne({ userId: user.userId })
      if (!userDoc) {
        sendError(res, 404, 'User not found', 'NOT_FOUND')
        return
      }

      const isValid = await verifyPassword(parsed.currentPassword, userDoc.passwordHash)
      if (!isValid) {
        logSecurityEvent('PASSWORD_CHANGED', { userId: user.userId, success: false, ip })
        sendError(res, 401, 'Current password is incorrect', 'AUTHENTICATION_REQUIRED')
        return
      }

      const newHash = await hashPassword(parsed.newPassword)
      await db.collection('users').updateOne(
        { userId: user.userId },
        { $set: { passwordHash: newHash, updatedAt: new Date() } },
      )

      logSecurityEvent('PASSWORD_CHANGED', { userId: user.userId, success: true, ip })
      res.json({ message: 'Password changed successfully' })
    } catch (error) {
      handleApiError(res, error, 'Failed to change password. Please try again.')
    }
  })

  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      sendError(res, 429, 'Too many requests. Please try again later.', 'RATE_LIMITED')
      return
    }

    const safeResponse = {
      message: 'If an account with that email exists, a password reset link has been sent.',
    }

    try {
      const parsed = parseBody(res, req.body, ForgotPasswordSchema)
      if (!parsed) {
        res.json(safeResponse)
        return
      }

      const db = await getDatabase()
      const user = await db.collection('users').findOne({ email: parsed.email })
      if (!user) {
        res.json(safeResponse)
        return
      }

      const rawToken = generateResetToken()
      const hashedToken = hashToken(rawToken)
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)

      await db.collection('users').updateOne(
        { email: parsed.email },
        {
          $set: {
            passwordResetToken: hashedToken,
            passwordResetExpiresAt: expiresAt,
            updatedAt: new Date(),
          },
        },
      )

      logSecurityEvent('PASSWORD_RESET_REQUESTED', { userId: user.userId, email: parsed.email, ip })
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[DEV] Password reset URL for ${parsed.email}: ${resetUrl}`)
      }

      res.json(safeResponse)
    } catch (error) {
      console.error('Forgot password error:', error instanceof Error ? error.message : error)
      res.json(safeResponse)
    }
  })

  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(`reset-password:${ip}`, 5, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      sendError(res, 429, 'Too many requests. Please try again later.', 'RATE_LIMITED')
      return
    }

    try {
      const parsed = parseBody(res, req.body, ResetPasswordSchema)
      if (!parsed) return

      const hashedToken = hashToken(parsed.token)
      const db = await getDatabase()
      const user = await db.collection('users').findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: { $gt: new Date() },
      })

      if (!user) {
        sendError(res, 400, 'Invalid or expired reset token. Please request a new one.', 'VALIDATION_ERROR')
        return
      }

      const newPasswordHash = await hashPassword(parsed.password)
      await db.collection('users').updateOne(
        { userId: user.userId },
        {
          $set: { passwordHash: newPasswordHash, updatedAt: new Date() },
          $unset: { passwordResetToken: '', passwordResetExpiresAt: '' },
        },
      )

      logSecurityEvent('PASSWORD_RESET_SUCCESS', { userId: user.userId, ip })
      res.json({ message: 'Password reset successfully. You can now log in.' })
    } catch (error) {
      handleApiError(res, error, 'Failed to reset password. Please try again.')
    }
  })

  app.get('/api/auth/sessions', authMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    try {
      const [currentSession, sessions] = await Promise.all([
        getActiveSessionRecord(user.sessionId),
        listUserSessions(user.userId),
      ])
      res.json({
        currentSessionId: user.sessionId,
        currentSession,
        sessions: sessions.map((item) => ({
          ...item,
          isCurrent: item.sessionId === user.sessionId,
        })),
      })
    } catch (error) {
      handleApiError(res, error, 'Failed to load sessions')
    }
  })

  app.delete('/api/auth/sessions/:sessionId', authMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    const idParsed = ResourceIdSchema.safeParse(req.params.sessionId)
    if (!idParsed.success) {
      sendError(res, 400, 'Session ID is required', 'VALIDATION_ERROR')
      return
    }

    try {
      const sessionId = idParsed.data
      const revoked = await revokeUserSessionRecord(sessionId, user.userId)
      if (!revoked) {
        sendError(res, 404, 'Session not found', 'NOT_FOUND')
        return
      }
      if (sessionId === user.sessionId) {
        await deleteSession(res)
      }
      res.json({ success: true })
    } catch (error) {
      handleApiError(res, error, 'Failed to revoke session')
    }
  })
}
