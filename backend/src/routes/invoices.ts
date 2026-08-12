import type { Express, Request, Response } from 'express'
import { getDatabase } from '../lib/mongodb.js'
import { authMiddleware, logSecurityEvent } from '../lib/auth.js'
import { handleApiError, parseBody, sendError } from '../lib/api-errors.js'
import { InvoiceSchema, ResourceIdSchema } from '../lib/schemas/api-schemas.js'

function formatInvoice(inv: Record<string, unknown>) {
  return {
    id: inv.id || String(inv._id),
    invoiceNumber: inv.invoiceNumber || '',
    date: inv.date || '',
    dueDate: inv.dueDate || '',
    paymentTermsDays: Number(inv.paymentTermsDays) || 30,
    reverseCharge: inv.reverseCharge || 'No',
    companyState: inv.companyState || '',
    companyStateCode: inv.companyStateCode || '',
    woNumber: inv.woNumber || '',
    descriptionOfService: inv.descriptionOfService || '',
    periodOfService: inv.periodOfService || '',
    placeOfService: inv.placeOfService || '',
    placeOfServiceCode: inv.placeOfServiceCode || '',
    customerId: inv.customerId || '',
    billTo: inv.billTo || null,
    shipTo: inv.shipTo || null,
    sameAsBillTo: inv.sameAsBillTo ?? true,
    items: inv.items || [],
    taxPercentage: Number(inv.taxPercentage) || 0,
    notes: inv.notes || '',
    cashDiscount: inv.cashDiscount || null,
    payments: inv.payments || [],
    status: inv.status || 'draft',
  }
}

export function registerInvoiceRoutes(app: Express): void {
  app.get('/api/invoices', authMiddleware, async (req: Request, res: Response) => {
    try {
      const db = await getDatabase()
      const invoices = await db.collection('invoices').find({ userId: req.user!.userId }).toArray()
      res.json(invoices.map((inv) => formatInvoice(inv as Record<string, unknown>)))
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch invoices')
    }
  })

  app.post('/api/invoices', authMiddleware, async (req: Request, res: Response) => {
    try {
      const parsed = parseBody(res, req.body, InvoiceSchema)
      if (!parsed) return

      const db = await getDatabase()
      const newInvoice = {
        id: parsed.id || Date.now().toString(),
        userId: req.user!.userId,
        invoiceNumber: parsed.invoiceNumber,
        date: parsed.date,
        dueDate: parsed.dueDate || '',
        paymentTermsDays: parsed.paymentTermsDays,
        reverseCharge: parsed.reverseCharge,
        companyState: parsed.companyState,
        companyStateCode: parsed.companyStateCode,
        woNumber: parsed.woNumber,
        descriptionOfService: parsed.descriptionOfService,
        periodOfService: parsed.periodOfService,
        placeOfService: parsed.placeOfService,
        placeOfServiceCode: parsed.placeOfServiceCode,
        customerId: parsed.customerId,
        billTo: parsed.billTo || null,
        shipTo: parsed.shipTo || null,
        sameAsBillTo: parsed.sameAsBillTo,
        items: parsed.items,
        taxPercentage: parsed.taxPercentage,
        notes: parsed.notes,
        cashDiscount: parsed.cashDiscount || null,
        payments: parsed.payments || [],
        status: parsed.status,
        createdAt: new Date(),
      }

      await db.collection('invoices').insertOne(newInvoice)
      res.status(201).json(newInvoice)
    } catch (error) {
      handleApiError(res, error, 'Failed to create invoice')
    }
  })

  app.get('/api/invoices/:id', authMiddleware, async (req: Request, res: Response) => {
    const idParsed = ResourceIdSchema.safeParse(req.params.id)
    if (!idParsed.success) {
      sendError(res, 400, 'Invoice ID is required', 'VALIDATION_ERROR')
      return
    }

    try {
      const db = await getDatabase()
      const inv = await db.collection('invoices').findOne({
        id: idParsed.data,
        userId: req.user!.userId,
      })
      if (!inv) {
        sendError(res, 404, 'Invoice not found', 'NOT_FOUND')
        return
      }
      res.json(formatInvoice(inv as Record<string, unknown>))
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch invoice')
    }
  })

  app.put('/api/invoices/:id', authMiddleware, async (req: Request, res: Response) => {
    const idParsed = ResourceIdSchema.safeParse(req.params.id)
    if (!idParsed.success) {
      sendError(res, 400, 'Invoice ID is required', 'VALIDATION_ERROR')
      return
    }
    const id = idParsed.data

    try {
      const parsed = parseBody(res, req.body, InvoiceSchema)
      if (!parsed) return

      const db = await getDatabase()
      const updateData = {
        invoiceNumber: parsed.invoiceNumber,
        date: parsed.date,
        dueDate: parsed.dueDate || '',
        paymentTermsDays: parsed.paymentTermsDays,
        reverseCharge: parsed.reverseCharge,
        companyState: parsed.companyState,
        companyStateCode: parsed.companyStateCode,
        woNumber: parsed.woNumber,
        descriptionOfService: parsed.descriptionOfService,
        periodOfService: parsed.periodOfService,
        placeOfService: parsed.placeOfService,
        placeOfServiceCode: parsed.placeOfServiceCode,
        customerId: parsed.customerId,
        billTo: parsed.billTo || null,
        shipTo: parsed.shipTo || null,
        sameAsBillTo: parsed.sameAsBillTo,
        items: parsed.items,
        taxPercentage: parsed.taxPercentage,
        notes: parsed.notes,
        cashDiscount: parsed.cashDiscount || null,
        payments: parsed.payments || [],
        status: parsed.status,
        updatedAt: new Date(),
      }

      const result = await db.collection('invoices').updateOne(
        { id, userId: req.user!.userId },
        { $set: updateData },
      )

      if (result.matchedCount === 0) {
        logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
          userId: req.user!.userId,
          resource: 'invoice',
          resourceId: id,
          action: 'update',
        })
        sendError(res, 404, 'Invoice not found', 'NOT_FOUND')
        return
      }

      res.json({ id, ...updateData })
    } catch (error) {
      handleApiError(res, error, 'Failed to update invoice')
    }
  })

  app.delete('/api/invoices/:id', authMiddleware, async (req: Request, res: Response) => {
    const idParsed = ResourceIdSchema.safeParse(req.params.id)
    if (!idParsed.success) {
      sendError(res, 400, 'Invoice ID is required', 'VALIDATION_ERROR')
      return
    }
    const id = idParsed.data

    try {
      const db = await getDatabase()
      const result = await db.collection('invoices').deleteOne({ id, userId: req.user!.userId })

      if (result.deletedCount === 0) {
        logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
          userId: req.user!.userId,
          resource: 'invoice',
          resourceId: id,
          action: 'delete',
        })
        sendError(res, 404, 'Invoice not found', 'NOT_FOUND')
        return
      }

      res.json({ success: true })
    } catch (error) {
      handleApiError(res, error, 'Failed to delete invoice')
    }
  })
}
