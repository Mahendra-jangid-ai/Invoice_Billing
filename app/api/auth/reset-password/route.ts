import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { hashPassword, hashToken, logSecurityEvent, getClientIp } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { errorResponse, handleApiError, parseBody } from '@/lib/api-errors'
import { ResetPasswordSchema } from '@/lib/schemas/api-schemas'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  const rateLimit = checkRateLimit(`reset-password:${ip}`, 5, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return errorResponse(429, 'Too many requests. Please try again later.', 'RATE_LIMITED')
  }

  try {
    const parsed = await parseBody(request, ResetPasswordSchema)
    if (parsed instanceof NextResponse) return parsed

    const { token, password } = parsed
    const hashedToken = hashToken(token)
    const db = await getDatabase()

    const user = await db.collection('users').findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    })

    if (!user) {
      return errorResponse(
        400,
        'Invalid or expired reset token. Please request a new one.',
        'VALIDATION_ERROR',
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
    return handleApiError(error, 'Failed to reset password. Please try again.')
  }
}
