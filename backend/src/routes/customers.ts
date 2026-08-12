import type { Express, Request, Response } from 'express'
import crypto from 'crypto'
import { getDatabase } from '../lib/mongodb.js'
import { authMiddleware, logSecurityEvent } from '../lib/auth.js'
import { handleApiError, parseBody, sendError } from '../lib/api-errors.js'
import { CustomerSchema, ResourceIdSchema } from '../lib/schemas/api-schemas.js'

export function registerCustomerRoutes(app: Express): void {
  app.get('/api/customers', authMiddleware, async (req: Request, res: Response) => {
    try {
      const db = await getDatabase()
      const customers = await db.collection('customers').find({ userId: req.user!.userId }).toArray()
      res.json(
        customers.map((c) => ({
          id: c.id || String(c._id),
          name: c.name || '',
          email: c.email || '',
          phone: c.phone || '',
          address: c.address || '',
          gstnumber: c.gstnumber || '',
          state: c.state || '',
          code: c.code || '',
        })),
      )
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch customers')
    }
  })

  app.post('/api/customers', authMiddleware, async (req: Request, res: Response) => {
    try {
      const parsed = parseBody(res, req.body, CustomerSchema)
      if (!parsed) return

      const db = await getDatabase()
      const newCustomer = {
        id: parsed.id || crypto.randomUUID(),
        userId: req.user!.userId,
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        address: parsed.address,
        gstnumber: parsed.gstnumber,
        state: parsed.state,
        code: parsed.code,
        createdAt: new Date(),
      }

      await db.collection('customers').insertOne(newCustomer)
      res.status(201).json(newCustomer)
    } catch (error) {
      handleApiError(res, error, 'Failed to create customer')
    }
  })

  app.put('/api/customers/:id', authMiddleware, async (req: Request, res: Response) => {
    const idParsed = ResourceIdSchema.safeParse(req.params.id)
    if (!idParsed.success) {
      sendError(res, 400, 'Customer ID is required', 'VALIDATION_ERROR')
      return
    }
    const id = idParsed.data

    try {
      const parsed = parseBody(res, req.body, CustomerSchema)
      if (!parsed) return

      const db = await getDatabase()
      const updateData = {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        address: parsed.address,
        gstnumber: parsed.gstnumber,
        state: parsed.state,
        code: parsed.code,
        updatedAt: new Date(),
      }

      const result = await db.collection('customers').updateOne(
        { id, userId: req.user!.userId },
        { $set: updateData },
      )

      if (result.matchedCount === 0) {
        logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
          userId: req.user!.userId,
          resource: 'customer',
          resourceId: id,
          action: 'update',
        })
        sendError(res, 404, 'Customer not found', 'NOT_FOUND')
        return
      }

      res.json({ id, ...updateData })
    } catch (error) {
      handleApiError(res, error, 'Failed to update customer')
    }
  })

  app.delete('/api/customers/:id', authMiddleware, async (req: Request, res: Response) => {
    const idParsed = ResourceIdSchema.safeParse(req.params.id)
    if (!idParsed.success) {
      sendError(res, 400, 'Customer ID is required', 'VALIDATION_ERROR')
      return
    }
    const id = idParsed.data

    try {
      const db = await getDatabase()
      const result = await db.collection('customers').deleteOne({ id, userId: req.user!.userId })

      if (result.deletedCount === 0) {
        logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
          userId: req.user!.userId,
          resource: 'customer',
          resourceId: id,
          action: 'delete',
        })
        sendError(res, 404, 'Customer not found', 'NOT_FOUND')
        return
      }

      res.json({ success: true })
    } catch (error) {
      handleApiError(res, error, 'Failed to delete customer')
    }
  })
}
