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
import { createSession, deleteSession, getSession, refreshSessionCookie } from '../lib/session.js'
import {
  createSessionRecord,
  enforceSessionLimit,
  getActiveSessionRecord,
  listUserSessions,
  revokeSessionRecord,
  revokeUserSessionRecord,
  revokeAllUserSessions,
} from '../lib/session-store.js'
import { checkRateLimit } from '../lib/rate-limit.js'
import { handleApiError, isMongoDuplicateKey, parseBody, sendError } from '../lib/api-errors.js'
import {
  LoginSchema,
  SignupSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
  GoogleAuthSchema,
  VerifyEmailOtpSchema,
  ResendEmailOtpSchema,
  ResourceIdSchema,
} from '../lib/schemas/api-schemas.js'
import { verifyGoogleIdToken, isGoogleAuthConfigured } from '../lib/google-auth.js'
import {
  establishUserSession,
  findOrCreateGoogleUser,
  formatUserProfile,
} from '../lib/auth-users.js'
import { isDisposableEmail } from '../lib/disposable-email.js'
import { createAndSendEmailOtp, verifyEmailOtp } from '../lib/email-otp.js'

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

      if (!userDoc.passwordHash) {
        sendError(
          res,
          401,
          'This email uses Google sign-in. Please continue with Google.',
          'GOOGLE_AUTH_REQUIRED',
        )
        return
      }

      await establishUserSession(req, res, {
        userId: String(userDoc.userId),
        email: String(userDoc.email),
        name: String(userDoc.name),
        emailVerified: userDoc.emailVerified as boolean | undefined,
        googleId: userDoc.googleId as string | undefined,
      })

      res.json(formatUserProfile({
        userId: String(userDoc.userId),
        email: String(userDoc.email),
        name: String(userDoc.name),
        avatarUrl: typeof userDoc.avatarUrl === 'string' ? userDoc.avatarUrl : '',
        avatarPreset: typeof userDoc.avatarPreset === 'string' ? userDoc.avatarPreset : 'character-1',
        emailVerified: userDoc.emailVerified as boolean | undefined,
        googleId: userDoc.googleId as string | undefined,
      }))
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

      if (isDisposableEmail(parsed.email)) {
        sendError(
          res,
          400,
          'Please use a real email address. Temporary or disposable emails are not allowed.',
          'VALIDATION_ERROR',
        )
        return
      }

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
        avatarUrl: '',
        avatarPreset: 'character-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const { sessionId, expiresAt } = await createSession(res, userId, parsed.email, parsed.name, false)
      await createSessionRecord(sessionId, userId, parsed.email, parsed.name, {
        userAgent: req.headers['user-agent'] || 'Unknown device',
        ipAddress: ip,
      }, expiresAt)
      await enforceSessionLimit(userId)

      logSecurityEvent('SIGNUP_SUCCESS', { userId, email: parsed.email, ip })
      await createAndSendEmailOtp(userId)

      res.status(201).json(formatUserProfile({
        userId,
        email: parsed.email,
        name: parsed.name,
        avatarUrl: '',
        avatarPreset: 'character-1',
        emailVerified: false,
      }))
    } catch (error) {
      if (isMongoDuplicateKey(error)) {
        sendError(res, 409, 'An account with this email already exists', 'CONFLICT')
        return
      }
      handleApiError(res, error, 'Failed to create account. Please try again.')
    }
  })

  app.get('/api/auth/google/enabled', (_req, res) => {
    res.json({ enabled: isGoogleAuthConfigured() })
  })

  app.get('/api/auth/google/config', (_req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || ''
    res.json({
      enabled: isGoogleAuthConfigured(),
      clientId: isGoogleAuthConfigured() ? clientId : '',
    })
  })

  app.post('/api/auth/google', async (req: Request, res: Response) => {
    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(`google-auth:${ip}`, 15, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      sendError(res, 429, 'Too many requests. Please try again later.', 'RATE_LIMITED')
      return
    }

    if (!isGoogleAuthConfigured()) {
      sendError(res, 503, 'Google sign-in is not configured on the server', 'SERVICE_UNAVAILABLE')
      return
    }

    try {
      const parsed = parseBody(res, req.body, GoogleAuthSchema)
      if (!parsed) return

      const profile = await verifyGoogleIdToken(parsed.credential)
      const { user, isNewUser } = await findOrCreateGoogleUser(profile)
      await establishUserSession(req, res, {
        ...user,
        emailVerified: true,
        googleId: user.googleId,
      }, isNewUser ? 'SIGNUP_SUCCESS' : 'LOGIN_SUCCESS')

      res.json({
        ...formatUserProfile({
          ...user,
          emailVerified: true,
        }),
        isNewUser,
      })
    } catch (error) {
      handleApiError(res, error, 'Google sign-in failed. Please try again.')
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
      const db = await getDatabase()
      const [activeSession, userDoc] = await Promise.all([
        getActiveSessionRecord(user.sessionId),
        db.collection('users').findOne({ userId: user.userId }),
      ])
      if (!activeSession) {
        sendError(res, 401, 'Session expired', 'AUTHENTICATION_REQUIRED')
        return
      }
      res.json({
        ...formatUserProfile({
          userId: user.userId,
          email: user.email,
          name: userDoc?.name || user.name,
          avatarUrl: userDoc?.avatarUrl,
          avatarPreset: userDoc?.avatarPreset,
          emailVerified: userDoc?.emailVerified as boolean | undefined,
          googleId: userDoc?.googleId as string | undefined,
        }),
        sessionId: user.sessionId,
        deviceName: activeSession.deviceName,
        browser: activeSession.browser,
        os: activeSession.os,
        ipAddress: activeSession.ipAddress,
        createdAt: activeSession.createdAt,
        lastSeenAt: activeSession.lastSeenAt,
        expiresAt: activeSession.expiresAt,
        accountCreatedAt: userDoc?.createdAt || null,
      })
    } catch (error) {
      handleApiError(res, error, 'Failed to get user info')
    }
  })

  app.patch('/api/auth/profile', authMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    try {
      const parsed = parseBody(res, req.body, UpdateProfileSchema)
      if (!parsed) return

      const db = await getDatabase()
      const updates: Record<string, unknown> = { updatedAt: new Date() }
      if (parsed.name !== undefined) updates.name = parsed.name
      if (parsed.avatarUrl !== undefined) updates.avatarUrl = parsed.avatarUrl
      if (parsed.avatarPreset !== undefined) updates.avatarPreset = parsed.avatarPreset

      await db.collection('users').updateOne({ userId: user.userId }, { $set: updates })

      const userDoc = await db.collection('users').findOne({ userId: user.userId })
      const nextName = userDoc?.name || user.name

      if (parsed.name !== undefined) {
        await refreshSessionCookie(res, { ...user, name: nextName })
      }

      res.json(formatUserProfile({
        userId: user.userId,
        email: user.email,
        name: nextName,
        avatarUrl: userDoc?.avatarUrl,
        avatarPreset: userDoc?.avatarPreset,
        emailVerified: userDoc?.emailVerified as boolean | undefined,
        googleId: userDoc?.googleId as string | undefined,
      }))
    } catch (error) {
      handleApiError(res, error, 'Failed to update profile')
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

      if (!userDoc.passwordHash) {
        sendError(
          res,
          400,
          'Your account uses Google sign-in. Set a password from forgot-password if you want email login.',
          'VALIDATION_ERROR',
        )
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

      await revokeAllUserSessions(user.userId, user.sessionId)

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

      await revokeAllUserSessions(user.userId)

      logSecurityEvent('PASSWORD_RESET_SUCCESS', { userId: user.userId, ip })
      res.json({ message: 'Password reset successfully. You can now log in.' })
    } catch (error) {
      handleApiError(res, error, 'Failed to reset password. Please try again.')
    }
  })

  app.post('/api/auth/verify-email/send', authMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    const rateLimit = checkRateLimit(`verify-email-send:${user.userId}`, 3, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      sendError(res, 429, 'Too many requests. Please try again later.', 'RATE_LIMITED')
      return
    }

    try {
      const parsed = parseBody(res, req.body ?? {}, ResendEmailOtpSchema)
      if (!parsed) return

      const db = await getDatabase()
      const userDoc = await db.collection('users').findOne({ userId: user.userId })
      if (!userDoc) {
        sendError(res, 404, 'User not found', 'NOT_FOUND')
        return
      }

      if (userDoc.emailVerified) {
        res.json({ message: 'Email is already verified', emailVerified: true })
        return
      }

      if (userDoc.googleId && !userDoc.passwordHash) {
        await db.collection('users').updateOne(
          { userId: user.userId },
          { $set: { emailVerified: true, updatedAt: new Date() } },
        )
        res.json({ message: 'Email verified via Google', emailVerified: true })
        return
      }

      const { sent, throttled } = await createAndSendEmailOtp(user.userId, { force: parsed.force })
      if (!sent) {
        sendError(res, 503, 'Could not send verification email. Please try again later.', 'SERVICE_UNAVAILABLE')
        return
      }

      res.json({
        message: throttled ? 'Verification code already sent recently' : 'Verification code sent',
        emailVerified: false,
        throttled: Boolean(throttled),
      })
    } catch (error) {
      handleApiError(res, error, 'Failed to send verification code')
    }
  })

  app.post('/api/auth/verify-email/confirm', authMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    const rateLimit = checkRateLimit(`verify-email-confirm:${user.userId}`, 10, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      sendError(res, 429, 'Too many attempts. Please try again later.', 'RATE_LIMITED')
      return
    }

    try {
      const parsed = parseBody(res, req.body, VerifyEmailOtpSchema)
      if (!parsed) return

      const result = await verifyEmailOtp(user.userId, parsed.code)
      if (!result.ok) {
        sendError(res, 400, result.error, 'VALIDATION_ERROR')
        return
      }

      const db = await getDatabase()
      const userDoc = await db.collection('users').findOne({ userId: user.userId })
      const session = await getSession(req)
      if (session) {
        await refreshSessionCookie(res, { ...session, emailVerified: true })
      }

      res.json(formatUserProfile({
        userId: user.userId,
        email: user.email,
        name: userDoc?.name || user.name,
        avatarUrl: userDoc?.avatarUrl,
        avatarPreset: userDoc?.avatarPreset,
        emailVerified: true,
      }))
    } catch (error) {
      handleApiError(res, error, 'Failed to verify email')
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

  app.delete('/api/auth/sessions/others', authMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    try {
      const revoked = await revokeAllUserSessions(user.userId, user.sessionId)
      res.json({ revoked })
    } catch (error) {
      handleApiError(res, error, 'Failed to revoke other sessions')
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
