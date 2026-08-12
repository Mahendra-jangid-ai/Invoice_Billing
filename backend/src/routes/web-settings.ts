import type { Express, Request, Response } from 'express'
import { getDatabase } from '../lib/mongodb.js'
import { authMiddleware, getClientIp } from '../lib/auth.js'
import { handleApiError, parseBody } from '../lib/api-errors.js'
import { WebSettingsSchema } from '../lib/schemas/api-schemas.js'

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

export function registerWebSettingsRoutes(app: Express): void {
  app.get('/api/web-settings', authMiddleware, async (req: Request, res: Response) => {
    try {
      const db = await getDatabase()
      const settings = await db.collection(COLLECTION_NAME).findOne({ userId: req.user!.userId })
      res.json(settings || DEFAULT_SETTINGS)
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

      const nextSettings = {
        _id: SETTINGS_ID,
        websiteName: parsed.websiteName,
        tagline: parsed.tagline,
        supportEmail: parsed.supportEmail,
        supportPhone: parsed.supportPhone,
        footerText: parsed.footerText,
        language: parsed.language,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user!.userId,
      }

      await db.collection(COLLECTION_NAME).updateOne(
        { userId: req.user!.userId },
        { $set: { ...nextSettings, userId: req.user!.userId } },
        { upsert: true },
      )

      console.info('[SECURITY]', JSON.stringify({
        event: 'WEB_SETTINGS_UPDATED',
        timestamp: new Date().toISOString(),
        userId: req.user!.userId,
        ip,
      }))

      res.json({ ...nextSettings, _id: SETTINGS_ID })
    } catch (error) {
      handleApiError(res, error, 'Failed to save web settings')
    }
  })
}
