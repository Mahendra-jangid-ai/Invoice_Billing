import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, getSession } from '@/lib/session'
import { getCurrentUser } from '@/lib/auth'
import { revokeUserSessionRecord } from '@/lib/session-store'

interface RouteParams {
  params: Promise<{
    sessionId: string
  }>
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentUser()
    if (!session?.userId || !session.sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { sessionId } = await params
    if (!sessionId) {
      return NextResponse.json({ error: 'Session id is required' }, { status: 400 })
    }

    const revoked = await revokeUserSessionRecord(sessionId, session.userId)
    if (!revoked) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 })
    }

    if (session.sessionId === sessionId) {
      await deleteSession()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session revoke error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 })
  }
}