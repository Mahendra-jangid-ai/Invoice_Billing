import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/mongodb'
import { verifyPassword, logSecurityEvent, getClientIp } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { createSessionRecord } from '@/lib/session-store'
import { checkRateLimit } from '@/lib/rate-limit'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  // Rate limit: 10 login attempts per 15 minutes per IP
  const rateLimit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data
    const emailKey = `${ip}:${email}`
    const emailRateLimit = checkRateLimit(`login:${emailKey}`, 8, 15 * 60 * 1000)
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts for this account. Please try again later.' },
        { status: 429 }
      )
    }

    const db = await getDatabase()
    const userDoc = await db.collection('users').findOne({ email })

    // Always run bcrypt compare to prevent timing attacks (even if user not found)
    const dummyHash = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.Q8H0Io7k7CzsV1.jT3rzH0K6mX7Eo6'
    const passwordHash = userDoc?.passwordHash || dummyHash
    const isValid = await verifyPassword(password, passwordHash)

    if (!userDoc || !isValid) {
      logSecurityEvent('LOGIN_FAILED', { email, ip })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
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
    console.error('Login error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
