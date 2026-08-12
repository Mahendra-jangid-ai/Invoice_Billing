import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { verifyPassword, logSecurityEvent, getClientIp } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { createSessionRecord } from '@/lib/session-store'
import { checkRateLimit } from '@/lib/rate-limit'
import { errorResponse, handleApiError, parseBody } from '@/lib/api-errors'
import { LoginSchema } from '@/lib/schemas/api-schemas'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  const rateLimit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return errorResponse(429, 'Too many login attempts. Please try again later.', 'RATE_LIMITED')
  }

  try {
    const parsed = await parseBody(request, LoginSchema)
    if (parsed instanceof NextResponse) {
      return errorResponse(400, 'Invalid email or password', 'VALIDATION_ERROR')
    }

    const { email, password } = parsed
    const emailKey = `${ip}:${email}`
    const emailRateLimit = checkRateLimit(`login:${emailKey}`, 8, 15 * 60 * 1000)
    if (!emailRateLimit.allowed) {
      return errorResponse(
        429,
        'Too many login attempts for this account. Please try again later.',
        'RATE_LIMITED',
      )
    }

    const db = await getDatabase()
    const userDoc = await db.collection('users').findOne({ email })

    const dummyHash = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.Q8H0Io7k7CzsV1.jT3rzH0K6mX7Eo6'
    const passwordHash = userDoc?.passwordHash || dummyHash
    const isValid = await verifyPassword(password, passwordHash)

    if (!userDoc || !isValid) {
      logSecurityEvent('LOGIN_FAILED', { email, ip })
      return errorResponse(401, 'Invalid email or password', 'AUTHENTICATION_REQUIRED')
    }

    const { sessionId, expiresAt } = await createSession(userDoc.userId, userDoc.email, userDoc.name)
    await createSessionRecord(
      sessionId,
      userDoc.userId,
      userDoc.email,
      userDoc.name,
      {
        userAgent: request.headers.get('user-agent') || 'Unknown device',
        ipAddress: ip,
      },
      expiresAt,
    )

    logSecurityEvent('LOGIN_SUCCESS', { userId: userDoc.userId, email, ip })

    return NextResponse.json({
      userId: userDoc.userId,
      email: userDoc.email,
      name: userDoc.name,
      sessionId,
    })
  } catch (error) {
    return handleApiError(error, 'Login failed. Please try again.')
  }
}
