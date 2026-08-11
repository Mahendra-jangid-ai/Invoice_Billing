import { NextResponse } from 'next/server'
import { deleteSession, getSession } from '@/lib/session'
import { logSecurityEvent } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getSession()
    if (session) {
      logSecurityEvent('LOGOUT', { userId: session.userId })
    }
    await deleteSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
