import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse
  try {
    const { id } = await params
    const body = await request.json()
    const db = await getDatabase()

    const updateData = {
      invoiceNumber: body.invoiceNumber,
      date: body.date,
      reverseCharge: body.reverseCharge || 'No',
      companyState: body.companyState || '',
      companyStateCode: body.companyStateCode || '',
      woNumber: body.woNumber || '',
      descriptionOfService: body.descriptionOfService || '',
      periodOfService: body.periodOfService || '',
      placeOfService: body.placeOfService || '',
      placeOfServiceCode: body.placeOfServiceCode || '',
      customerId: body.customerId || '',
      billTo: body.billTo || null,
      shipTo: body.shipTo || null,
      sameAsBillTo: body.sameAsBillTo ?? true,
      items: body.items || [],
      taxPercentage: Number(body.taxPercentage) || 0,
      notes: body.notes || '',
      cashDiscount: body.cashDiscount || null,
      status: body.status,
      updatedAt: new Date(),
    }

    const result = await db.collection('invoices').updateOne(
      { id: id, userId: user.userId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    console.error('Failed to update invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const { id } = await params
    const db = await getDatabase()

    const result = await db.collection('invoices').deleteOne({ id: id, userId: user.userId })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete invoice:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
