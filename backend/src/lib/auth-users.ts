import type { Request, Response } from 'express'
import crypto from 'crypto'
import { getDatabase } from './mongodb.js'
import { createSession } from './session.js'
import {
  createSessionRecord,
  enforceSessionLimit,
} from './session-store.js'
import { getClientIp, logSecurityEvent } from './auth.js'

interface UserDoc {
  userId: string
  email: string
  name: string
  passwordHash?: string
  googleId?: string
  avatarUrl?: string
  avatarPreset?: string
  emailVerified?: boolean
}

export function resolveEmailVerified(userDoc: {
  emailVerified?: boolean
  googleId?: string
}): boolean {
  if (userDoc.googleId) return true
  if (userDoc.emailVerified === false) return false
  return true
}

export function formatUserProfile(userDoc: {
  userId: string
  email: string
  name: string
  avatarUrl?: string
  avatarPreset?: string
  emailVerified?: boolean
  googleId?: string
}) {
  return {
    userId: userDoc.userId,
    email: userDoc.email,
    name: userDoc.name,
    avatarUrl: userDoc.avatarUrl || '',
    avatarPreset: userDoc.avatarPreset || 'character-1',
    emailVerified: resolveEmailVerified(userDoc),
  }
}

export async function establishUserSession(
  req: Request,
  res: Response,
  userDoc: UserDoc,
  event: 'LOGIN_SUCCESS' | 'SIGNUP_SUCCESS' = 'LOGIN_SUCCESS',
): Promise<void> {
  const ip = getClientIp(req)
  const emailVerified = resolveEmailVerified(userDoc)
  const { sessionId, expiresAt } = await createSession(
    res,
    userDoc.userId,
    userDoc.email,
    userDoc.name,
    emailVerified,
  )
  await createSessionRecord(
    sessionId,
    userDoc.userId,
    userDoc.email,
    userDoc.name,
    {
      userAgent: req.headers['user-agent'] || 'Unknown device',
      ipAddress: ip,
    },
    expiresAt,
  )
  await enforceSessionLimit(userDoc.userId)
  logSecurityEvent(event, { userId: userDoc.userId, email: userDoc.email, ip })
}

export async function findOrCreateGoogleUser(profile: {
  sub: string
  email: string
  name: string
  picture?: string
}): Promise<{ user: UserDoc; isNewUser: boolean }> {
  const db = await getDatabase()
  const users = db.collection('users')

  const byGoogle = await users.findOne({ googleId: profile.sub })
  if (byGoogle) {
    return {
      user: {
        userId: String(byGoogle.userId),
        email: String(byGoogle.email),
        name: String(byGoogle.name),
        passwordHash: byGoogle.passwordHash as string | undefined,
        googleId: String(byGoogle.googleId),
        avatarUrl: typeof byGoogle.avatarUrl === 'string' ? byGoogle.avatarUrl : '',
        avatarPreset: typeof byGoogle.avatarPreset === 'string' ? byGoogle.avatarPreset : 'character-1',
      },
      isNewUser: false,
    }
  }

  const byEmail = await users.findOne({ email: profile.email })
  if (byEmail) {
    const updates: Record<string, unknown> = {
      googleId: profile.sub,
      emailVerified: true,
      updatedAt: new Date(),
      authProvider: byEmail.passwordHash ? 'both' : 'google',
    }

    if (!byEmail.avatarUrl && profile.picture) {
      updates.avatarUrl = profile.picture
      updates.avatarPreset = 'custom'
    }

    await users.updateOne({ userId: byEmail.userId }, { $set: updates })

    const linked = await users.findOne({ userId: byEmail.userId })
    return {
      user: {
        userId: String(linked!.userId),
        email: String(linked!.email),
        name: String(linked!.name),
        passwordHash: linked!.passwordHash as string | undefined,
        googleId: String(linked!.googleId),
        avatarUrl: typeof linked!.avatarUrl === 'string' ? linked!.avatarUrl : '',
        avatarPreset: typeof linked!.avatarPreset === 'string' ? linked!.avatarPreset : 'character-1',
      },
      isNewUser: false,
    }
  }

  const userId = crypto.randomUUID()
  const newUser = {
    userId,
    name: profile.name,
    email: profile.email,
    googleId: profile.sub,
    role: 'user',
    authProvider: 'google',
    emailVerified: true,
    avatarUrl: profile.picture || '',
    avatarPreset: profile.picture ? 'custom' : 'character-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await users.insertOne(newUser)

  return {
    user: {
      userId,
      email: profile.email,
      name: profile.name,
      googleId: profile.sub,
      avatarUrl: profile.picture || '',
      avatarPreset: profile.picture ? 'custom' : 'character-1',
    },
    isNewUser: true,
  }
}
