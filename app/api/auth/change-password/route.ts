import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { hashPassword, verifyPassword, requireAuth, logSecurityEvent, getClientIp } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { errorResponse, handleApiError, parseBody } from '@/lib/api-errors'
import { ChangePasswordSchema } from '@/lib/schemas/api-schemas'

export async function POST(request: NextRequest) {
  const { user, errorResponse: authError } = await requireAuth()
  if (authError) return authError

  const ip = getClientIp(request)
  const rateLimit = checkRateLimit(`change-password:${user.userId}`, 5, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return errorResponse(429, 'Too many requests. Please try again later.', 'RATE_LIMITED')
  }

  try {
    const parsed = await parseBody(request, ChangePasswordSchema)
    if (parsed instanceof NextResponse) return parsed

    const { currentPassword, newPassword } = parsed
    const db = await getDatabase()

    const userDoc = await db.collection('users').findOne({ userId: user.userId })
    if (!userDoc) {
      return errorResponse(404, 'User not found', 'NOT_FOUND')
    }

    const isValid = await verifyPassword(currentPassword, userDoc.passwordHash)
    if (!isValid) {
      logSecurityEvent('PASSWORD_CHANGED', { userId: user.userId, success: false, ip })
      return errorResponse(401, 'Current password is incorrect', 'AUTHENTICATION_REQUIRED')
    }

    const newHash = await hashPassword(newPassword)
    await db.collection('users').updateOne(
      { userId: user.userId },
      { $set: { passwordHash: newHash, updatedAt: new Date() } }
    )

    logSecurityEvent('PASSWORD_CHANGED', { userId: user.userId, success: true, ip })

    return NextResponse.json({ message: 'Password changed successfully' })
  } catch (error) {
    return handleApiError(error, 'Failed to change password. Please try again.')
  }
}
