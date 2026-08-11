import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/mongodb'
import { hashPassword, verifyPassword, requireAuth, logSecurityEvent, getClientIp } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  const ip = getClientIp(request)

  // Rate limit: 5 attempts per 15 minutes per user
  const rateLimit = checkRateLimit(`change-password:${user.userId}`, 5, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = ChangePasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = parsed.data
    const db = await getDatabase()

    const userDoc = await db.collection('users').findOne({ userId: user.userId })
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isValid = await verifyPassword(currentPassword, userDoc.passwordHash)
    if (!isValid) {
      logSecurityEvent('PASSWORD_CHANGED', { userId: user.userId, success: false, ip })
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const newHash = await hashPassword(newPassword)
    await db.collection('users').updateOne(
      { userId: user.userId },
      { $set: { passwordHash: newHash, updatedAt: new Date() } }
    )

    logSecurityEvent('PASSWORD_CHANGED', { userId: user.userId, success: true, ip })

    return NextResponse.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to change password. Please try again.' },
      { status: 500 }
    )
  }
}
