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
      customerId: body.customerId,
      items: body.items,
      taxPercentage: Number(body.taxPercentage),
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
