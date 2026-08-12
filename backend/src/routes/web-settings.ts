import type { Express, Request, Response } from 'express'
import { getDatabase } from '../lib/mongodb.js'
import { authMiddleware, getClientIp } from '../lib/auth.js'
import { handleApiError, parseBody } from '../lib/api-errors.js'
import { WebSettingsSchema } from '../lib/schemas/api-schemas.js'

const COLLECTION_NAME = 'web_settings'

const DEFAULT_SETTINGS = {
  websiteName: 'Billing Studio',
  tagline: 'Professional billing and invoicing software',
  supportEmail: '',
  supportPhone: '',
  footerText: '',
  language: 'en',
  updatedAt: new Date().toISOString(),
}

function formatWebSettings(doc: Record<string, unknown> | null) {
  if (!doc) return DEFAULT_SETTINGS
  return {
    websiteName: String(doc.websiteName ?? DEFAULT_SETTINGS.websiteName),
    tagline: String(doc.tagline ?? DEFAULT_SETTINGS.tagline),
    supportEmail: String(doc.supportEmail ?? ''),
    supportPhone: String(doc.supportPhone ?? ''),
    footerText: String(doc.footerText ?? ''),
    language: String(doc.language ?? 'en'),
    updatedAt: doc.updatedAt instanceof Date
      ? doc.updatedAt.toISOString()
      : String(doc.updatedAt ?? new Date().toISOString()),
  }
}

export function registerWebSettingsRoutes(app: Express): void {
  app.get('/api/web-settings', authMiddleware, async (req: Request, res: Response) => {
    try {
      const db = await getDatabase()
      const settings = await db.collection(COLLECTION_NAME).findOne({ userId: req.user!.userId })
      res.json(formatWebSettings(settings as Record<string, unknown> | null))
    } catch (error) {
      handleApiError(res, error, 'Failed to load web settings')
    }
  })

  app.put('/api/web-settings', authMiddleware, async (req: Request, res: Response) => {
    try {
      const parsed = parseBody(res, req.body, WebSettingsSchema)
      if (!parsed) return

      const db = await getDatabase()
      const ip = getClientIp(req)
      const userId = req.user!.userId

      const nextSettings = {
        websiteName: parsed.websiteName,
        tagline: parsed.tagline,
        supportEmail: parsed.supportEmail,
        supportPhone: parsed.supportPhone,
        footerText: parsed.footerText,
        language: parsed.language,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      }

      await db.collection(COLLECTION_NAME).updateOne(
        { userId },
        { $set: { ...nextSettings, userId } },
        { upsert: true },
      )

      console.info('[SECURITY]', JSON.stringify({
        event: 'WEB_SETTINGS_UPDATED',
        timestamp: new Date().toISOString(),
        userId,
        ip,
      }))

      res.json(formatWebSettings(nextSettings as unknown as Record<string, unknown>))
    } catch (error) {
      handleApiError(res, error, 'Failed to save web settings')
    }
  })
}
