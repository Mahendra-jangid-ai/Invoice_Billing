import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    // Only return safe fields — never password, hash, or tokens
    return NextResponse.json({
      userId: session.userId,
      email: session.email,
      name: session.name,
    })
  } catch (error) {
    console.error('Auth/me error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 })
  }
}
