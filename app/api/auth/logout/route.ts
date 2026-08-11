import { NextResponse } from 'next/server'
import { deleteSession, getSession } from '@/lib/session'
import { logSecurityEvent } from '@/lib/auth'
import { revokeSessionRecord } from '@/lib/session-store'

export async function POST() {
  try {
    const session = await getSession()
    if (session) {
      logSecurityEvent('LOGOUT', { userId: session.userId })
      if (session.sessionId) {
        await revokeSessionRecord(session.sessionId)
      }
    }
    await deleteSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
