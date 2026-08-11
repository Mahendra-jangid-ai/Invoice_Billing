import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getClientIp, requireAuth } from '@/lib/auth'

const COLLECTION_NAME = 'web_settings'
const SETTINGS_ID = 'singleton'

const DEFAULT_SETTINGS = {
  websiteName: 'Billing Studio',
  tagline: 'Professional billing and invoicing software',
  supportEmail: '',
  supportPhone: '',
  footerText: '',
  language: 'en',
  updatedAt: new Date().toISOString(),
}

export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth()
    if (errorResponse) return errorResponse

    const db = await getDatabase()
    const settings = await db.collection(COLLECTION_NAME).findOne({ userId: user.userId })

    return NextResponse.json(settings || DEFAULT_SETTINGS)
  } catch (error) {
    console.error('Web settings GET error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to load web settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth()
    if (errorResponse) return errorResponse

    const body = await request.json()
    const db = await getDatabase()
    const ip = getClientIp(request)

    const nextSettings = {
      _id: SETTINGS_ID,
      websiteName: String(body.websiteName || DEFAULT_SETTINGS.websiteName).trim(),
      tagline: String(body.tagline || '').trim(),
      supportEmail: String(body.supportEmail || '').trim(),
      supportPhone: String(body.supportPhone || '').trim(),
      footerText: String(body.footerText || '').trim(),
      language: String(body.language || DEFAULT_SETTINGS.language).trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    }

    await db.collection(COLLECTION_NAME).updateOne(
      { userId: user.userId },
      { $set: { ...nextSettings, userId: user.userId } },
      { upsert: true }
    )

    console.info('[SECURITY]', JSON.stringify({
      event: 'WEB_SETTINGS_UPDATED',
      timestamp: new Date().toISOString(),
      userId: user.userId,
      ip,
    }))

    return NextResponse.json({ ...nextSettings, _id: SETTINGS_ID })
  } catch (error) {
    console.error('Web settings PUT error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to save web settings' }, { status: 500 })
  }
}