import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getActiveSessionRecord, listUserSessions } from '@/lib/session-store'
import { handleApiError } from '@/lib/api-errors'

export async function GET() {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const [currentSession, sessions] = await Promise.all([
      getActiveSessionRecord(user.sessionId),
      listUserSessions(user.userId),
    ])

    return NextResponse.json({
      currentSessionId: user.sessionId,
      currentSession,
      sessions: sessions.map((item) => ({
        ...item,
        isCurrent: item.sessionId === user.sessionId,
      })),
    })
  } catch (error) {
    return handleApiError(error, 'Failed to load sessions')
  }
}
