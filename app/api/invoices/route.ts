import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    const invoices = await db.collection('invoices').find({}).toArray()
    const formatted = invoices.map((inv) => ({
      id: inv.id || inv._id.toString(),
      invoiceNumber: inv.invoiceNumber || '',
      date: inv.date || '',
      customerId: inv.customerId || '',
      items: inv.items || [],
      taxPercentage: Number(inv.taxPercentage) || 0,
      notes: inv.notes || '',
      status: inv.status || 'draft',
    }))
    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = await getDatabase()

    const newInvoice = {
      id: body.id || Date.now().toString(),
      invoiceNumber: body.invoiceNumber,
      date: body.date,
      customerId: body.customerId,
      items: body.items,
      taxPercentage: Number(body.taxPercentage),
      notes: body.notes || '',
      status: body.status || 'draft',
      createdAt: new Date(),
    }

    await db.collection('invoices').insertOne(newInvoice)
    return NextResponse.json(newInvoice, { status: 201 })
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
