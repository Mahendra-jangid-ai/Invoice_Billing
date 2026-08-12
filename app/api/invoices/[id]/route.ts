import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAuth, logSecurityEvent } from '@/lib/auth'
import { errorResponse, handleApiError, parseBody } from '@/lib/api-errors'
import { InvoiceSchema, ResourceIdSchema } from '@/lib/schemas/api-schemas'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse: authError } = await requireAuth()
  if (authError) return authError

  try {
    const { id: rawId } = await params
    const idParsed = ResourceIdSchema.safeParse(rawId)
    if (!idParsed.success) {
      return errorResponse(400, 'Invoice ID is required', 'VALIDATION_ERROR')
    }
    const id = idParsed.data

    const parsed = await parseBody(request, InvoiceSchema)
    if (parsed instanceof NextResponse) return parsed

    const db = await getDatabase()
    const updateData = {
      invoiceNumber: parsed.invoiceNumber,
      date: parsed.date,
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
      status: parsed.status,
      updatedAt: new Date(),
    }

    const result = await db.collection('invoices').updateOne(
      { id, userId: user.userId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        userId: user.userId,
        resource: 'invoice',
        resourceId: id,
        action: 'update',
      })
      return errorResponse(404, 'Invoice not found', 'NOT_FOUND')
    }

    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    return handleApiError(error, 'Failed to update invoice')
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse: authError } = await requireAuth()
  if (authError) return authError

  try {
    const { id: rawId } = await params
    const idParsed = ResourceIdSchema.safeParse(rawId)
    if (!idParsed.success) {
      return errorResponse(400, 'Invoice ID is required', 'VALIDATION_ERROR')
    }
    const id = idParsed.data

    const db = await getDatabase()
    const result = await db.collection('invoices').deleteOne({ id, userId: user.userId })

    if (result.deletedCount === 0) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        userId: user.userId,
        resource: 'invoice',
        resourceId: id,
        action: 'delete',
      })
      return errorResponse(404, 'Invoice not found', 'NOT_FOUND')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to delete invoice')
  }
}
