import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/mongodb'
import { generateResetToken, hashToken, logSecurityEvent, getClientIp } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
})

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  // Rate limit: 3 requests per 15 minutes per IP
  const rateLimit = checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  // Always return success to prevent user enumeration
  const SAFE_RESPONSE = NextResponse.json({
    message: 'If an account with that email exists, a password reset link has been sent.',
  })

  try {
    const body = await request.json()
    const parsed = ForgotPasswordSchema.safeParse(body)
    if (!parsed.success) return SAFE_RESPONSE

    const { email } = parsed.data
    const db = await getDatabase()
    const user = await db.collection('users').findOne({ email })

    if (!user) {
      // Don't reveal whether email exists
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

    // In production, send rawToken via email.
    // For development, log the reset URL to the server console.
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[DEV] Password reset URL for ${email}: ${resetUrl}`)
    }

    return SAFE_RESPONSE
  } catch (error) {
    console.error('Forgot password error:', error instanceof Error ? error.message : 'Unknown error')
    // Return safe response even on error — don't reveal internal issues
    return SAFE_RESPONSE
  }
}
