import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/mongodb'
import { hashPassword, hashToken, logSecurityEvent, getClientIp } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  // Rate limit: 5 attempts per 15 minutes per IP
  const rateLimit = checkRateLimit(`reset-password:${ip}`, 5, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = ResetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data
    const hashedToken = hashToken(token)
    const db = await getDatabase()

    const user = await db.collection('users').findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new one.' },
        { status: 400 }
      )
    }

    const newPasswordHash = await hashPassword(password)

    await db.collection('users').updateOne(
      { userId: user.userId },
      {
        $set: {
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
        $unset: {
          passwordResetToken: '',
          passwordResetExpiresAt: '',
        },
      }
    )

    logSecurityEvent('PASSWORD_RESET_SUCCESS', { userId: user.userId, ip })

    return NextResponse.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (error) {
    console.error('Reset password error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    )
  }
}
