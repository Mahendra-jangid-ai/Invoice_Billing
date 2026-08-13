import type { Express, Request, Response } from 'express'
import crypto from 'crypto'
import { getDatabase } from '../lib/mongodb.js'
import { authMiddleware, logSecurityEvent } from '../lib/auth.js'
import { handleApiError, parseBody, sendError } from '../lib/api-errors.js'
import { ItemSchema, ResourceIdSchema } from '../lib/schemas/api-schemas.js'

export function registerItemRoutes(app: Express): void {
  app.get('/api/items', authMiddleware, async (req: Request, res: Response) => {
    try {
      const db = await getDatabase()
      const items = await db
        .collection('items')
        .find({ userId: req.user!.userId })
        .sort({ name: 1 })
        .limit(5000)
        .toArray()
      res.json(
        items.map((item) => ({
          id: item.id || String(item._id),
          name: item.name || '',
          description: item.description || '',
          hsnsac: item.hsnsac || '',
          unitprice: Number(item.unitprice) || 0,
        })),
      )
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch items')
    }
  })

  app.post('/api/items', authMiddleware, async (req: Request, res: Response) => {
    try {
      const parsed = parseBody(res, req.body, ItemSchema)
      if (!parsed) return

      const db = await getDatabase()
      const newItem = {
        id: parsed.id || crypto.randomUUID(),
        userId: req.user!.userId,
        name: parsed.name,
        description: parsed.description,
        hsnsac: parsed.hsnsac,
        unitprice: parsed.unitprice,
        createdAt: new Date(),
      }

      await db.collection('items').insertOne(newItem)
      res.status(201).json(newItem)
    } catch (error) {
      handleApiError(res, error, 'Failed to create item')
    }
  })

  app.put('/api/items/:id', authMiddleware, async (req: Request, res: Response) => {
    const idParsed = ResourceIdSchema.safeParse(req.params.id)
    if (!idParsed.success) {
      sendError(res, 400, 'Item ID is required', 'VALIDATION_ERROR')
      return
    }
    const id = idParsed.data

    try {
      const parsed = parseBody(res, req.body, ItemSchema)
      if (!parsed) return

      const db = await getDatabase()
      const updateData = {
        name: parsed.name,
        description: parsed.description,
        hsnsac: parsed.hsnsac,
        unitprice: parsed.unitprice,
        updatedAt: new Date(),
      }

      const result = await db.collection('items').updateOne(
        { id, userId: req.user!.userId },
        { $set: updateData },
      )

      if (result.matchedCount === 0) {
        logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
          userId: req.user!.userId,
          resource: 'item',
          resourceId: id,
          action: 'update',
        })
        sendError(res, 404, 'Item not found', 'NOT_FOUND')
        return
      }

      res.json({ id, ...updateData })
    } catch (error) {
      handleApiError(res, error, 'Failed to update item')
    }
  })

  app.delete('/api/items/:id', authMiddleware, async (req: Request, res: Response) => {
    const idParsed = ResourceIdSchema.safeParse(req.params.id)
    if (!idParsed.success) {
      sendError(res, 400, 'Item ID is required', 'VALIDATION_ERROR')
      return
    }
    const id = idParsed.data

    try {
      const db = await getDatabase()
      const result = await db.collection('items').deleteOne({ id, userId: req.user!.userId })

      if (result.deletedCount === 0) {
        logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
          userId: req.user!.userId,
          resource: 'item',
          resourceId: id,
          action: 'delete',
        })
        sendError(res, 404, 'Item not found', 'NOT_FOUND')
        return
      }

      res.json({ success: true })
    } catch (error) {
      handleApiError(res, error, 'Failed to delete item')
    }
  })
}
