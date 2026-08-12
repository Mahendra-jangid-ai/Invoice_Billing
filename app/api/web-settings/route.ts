import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getClientIp, requireAuth } from '@/lib/auth'
import { handleApiError, parseBody } from '@/lib/api-errors'
import { WebSettingsSchema } from '@/lib/schemas/api-schemas'

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
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const db = await getDatabase()
    const settings = await db.collection(COLLECTION_NAME).findOne({ userId: user.userId })
    return NextResponse.json(settings || DEFAULT_SETTINGS)
  } catch (error) {
    return handleApiError(error, 'Failed to load web settings')
  }
}

export async function PUT(request: NextRequest) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const parsed = await parseBody(request, WebSettingsSchema)
    if (parsed instanceof NextResponse) return parsed

    const db = await getDatabase()
    const ip = getClientIp(request)

    const nextSettings = {
      _id: SETTINGS_ID,
      websiteName: parsed.websiteName,
      tagline: parsed.tagline,
      supportEmail: parsed.supportEmail,
      supportPhone: parsed.supportPhone,
      footerText: parsed.footerText,
      language: parsed.language,
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
    return handleApiError(error, 'Failed to save web settings')
  }
}
