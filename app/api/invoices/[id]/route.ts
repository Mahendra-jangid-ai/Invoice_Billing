import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      status: body.status,
      updatedAt: new Date(),
    }

    await db.collection('invoices').updateOne(
      { id: id },
      { $set: updateData }
    )

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
  try {
    const { id } = await params
    const db = await getDatabase()

    await db.collection('invoices').deleteOne({ id: id })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete invoice:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
