import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getActiveSessionRecord } from '@/lib/session-store'

export async function GET() {
  try {
    const session = await getCurrentUser()
    if (!session || !session.userId || !session.sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const activeSession = await getActiveSessionRecord(session.sessionId)
    if (!activeSession) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Only return safe fields — never password, hash, or tokens
    return NextResponse.json({
      userId: session.userId,
      email: session.email,
      name: session.name,
      sessionId: session.sessionId,
      deviceName: activeSession.deviceName,
      browser: activeSession.browser,
      os: activeSession.os,
      ipAddress: activeSession.ipAddress,
      createdAt: activeSession.createdAt,
      lastSeenAt: activeSession.lastSeenAt,
      expiresAt: activeSession.expiresAt,
    })
  } catch (error) {
    console.error('Auth/me error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 })
  }
}
