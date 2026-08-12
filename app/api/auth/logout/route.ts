import { NextResponse } from 'next/server'
import { deleteSession, getSession } from '@/lib/session'
import { logSecurityEvent } from '@/lib/auth'
import { revokeSessionRecord } from '@/lib/session-store'
import { handleApiError } from '@/lib/api-errors'

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
    // Still clear session cookie even if DB revoke fails
    try {
      await deleteSession()
    } catch {
      // ignore secondary failure
    }
    return handleApiError(error, 'Logout failed')
  }
}
