import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { hashPassword, logSecurityEvent, getClientIp } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { createSessionRecord } from '@/lib/session-store'
import { checkRateLimit } from '@/lib/rate-limit'
import { errorResponse, handleApiError, isMongoDuplicateKey, parseBody } from '@/lib/api-errors'
import { SignupSchema } from '@/lib/schemas/api-schemas'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  const rateLimit = checkRateLimit(`signup:${ip}`, 5, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return errorResponse(429, 'Too many requests. Please try again later.', 'RATE_LIMITED')
  }

  try {
    const parsed = await parseBody(request, SignupSchema)
    if (parsed instanceof NextResponse) return parsed

    const { name, email, password } = parsed
    const db = await getDatabase()

    const existing = await db.collection('users').findOne({ email })
    if (existing) {
      return errorResponse(409, 'An account with this email already exists', 'CONFLICT')
    }

    const passwordHash = await hashPassword(password)
    const userId = crypto.randomUUID()

    await db.collection('users').insertOne({
      userId,
      name,
      email,
      passwordHash,
      role: 'user',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const { sessionId, expiresAt } = await createSession(userId, email, name)
    await createSessionRecord(
      sessionId,
      userId,
      email,
      name,
      {
        userAgent: request.headers.get('user-agent') || 'Unknown device',
        ipAddress: ip,
      },
      expiresAt,
    )

    logSecurityEvent('SIGNUP_SUCCESS', { userId, email, ip })

    return NextResponse.json(
      { userId, email, name, sessionId },
      { status: 201 }
    )
  } catch (error) {
    if (isMongoDuplicateKey(error)) {
      return errorResponse(409, 'An account with this email already exists', 'CONFLICT')
    }
    return handleApiError(error, 'Failed to create account. Please try again.')
  }
}
