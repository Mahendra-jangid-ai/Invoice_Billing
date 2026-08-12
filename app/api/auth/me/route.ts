import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getActiveSessionRecord } from '@/lib/session-store'
import { handleApiError } from '@/lib/api-errors'

export async function GET() {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const activeSession = await getActiveSessionRecord(user.sessionId)
    if (!activeSession) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    return NextResponse.json({
      userId: user.userId,
      email: user.email,
      name: user.name,
      sessionId: user.sessionId,
      deviceName: activeSession.deviceName,
      browser: activeSession.browser,
      os: activeSession.os,
      ipAddress: activeSession.ipAddress,
      createdAt: activeSession.createdAt,
      lastSeenAt: activeSession.lastSeenAt,
      expiresAt: activeSession.expiresAt,
    })
  } catch (error) {
    return handleApiError(error, 'Failed to get user info')
  }
}
