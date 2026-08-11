import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getActiveSessionRecord, listUserSessions } from '@/lib/session-store'

export async function GET() {
  try {
    const session = await getCurrentUser()
    if (!session?.userId || !session.sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const [currentSession, sessions] = await Promise.all([
      getActiveSessionRecord(session.sessionId),
      listUserSessions(session.userId),
    ])

    return NextResponse.json({
      currentSessionId: session.sessionId,
      currentSession,
      sessions: sessions.map((item) => ({
        ...item,
        isCurrent: item.sessionId === session.sessionId,
      })),
    })
  } catch (error) {
    console.error('Sessions list error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 })
  }
}