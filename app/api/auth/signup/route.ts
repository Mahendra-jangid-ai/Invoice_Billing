import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/mongodb'
import { hashPassword, logSecurityEvent, getClientIp } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { checkRateLimit } from '@/lib/rate-limit'

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  // Rate limit: 5 signup attempts per 15 minutes per IP
  const rateLimit = checkRateLimit(`signup:${ip}`, 5, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = SignupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data
    const db = await getDatabase()

    // Check if email already exists
    const existing = await db.collection('users').findOne({ email })
    if (existing) {
      // Generic message to prevent user enumeration
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`

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

    await createSession(userId, email, name)

    logSecurityEvent('SIGNUP_SUCCESS', { userId, email, ip })

    return NextResponse.json(
      { userId, email, name },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
