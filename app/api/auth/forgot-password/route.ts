import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { generateResetToken, hashToken, logSecurityEvent, getClientIp } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { errorResponse, parseBody } from '@/lib/api-errors'
import { ForgotPasswordSchema } from '@/lib/schemas/api-schemas'

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000

const SAFE_RESPONSE = NextResponse.json({
  message: 'If an account with that email exists, a password reset link has been sent.',
})

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  const rateLimit = checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return errorResponse(429, 'Too many requests. Please try again later.', 'RATE_LIMITED')
  }

  try {
    const parsed = await parseBody(request, ForgotPasswordSchema)
    if (parsed instanceof NextResponse) return SAFE_RESPONSE

    const { email } = parsed
    const db = await getDatabase()
    const user = await db.collection('users').findOne({ email })

    if (!user) {
      return SAFE_RESPONSE
    }

    const rawToken = generateResetToken()
    const hashedToken = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)

    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          passwordResetToken: hashedToken,
          passwordResetExpiresAt: expiresAt,
          updatedAt: new Date(),
        },
      }
    )

    logSecurityEvent('PASSWORD_RESET_REQUESTED', { userId: user.userId, email, ip })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[DEV] Password reset URL for ${email}: ${resetUrl}`)
    }

    return SAFE_RESPONSE
  } catch (error) {
    console.error('Forgot password error:', error instanceof Error ? error.message : 'Unknown error')
    return SAFE_RESPONSE
  }
}
