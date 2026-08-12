import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { handleApiError, parseBody } from '@/lib/api-errors'
import { InvoiceSchema } from '@/lib/schemas/api-schemas'

export async function GET() {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const db = await getDatabase()
    const invoices = await db.collection('invoices').find({ userId: user.userId }).toArray()
    const formatted = invoices.map((inv) => ({
      id: inv.id || inv._id.toString(),
      invoiceNumber: inv.invoiceNumber || '',
      date: inv.date || '',
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
      status: inv.status || 'draft',
    }))
    return NextResponse.json(formatted)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch invoices')
  }
}

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const parsed = await parseBody(request, InvoiceSchema)
    if (parsed instanceof NextResponse) return parsed

    const db = await getDatabase()
    const newInvoice = {
      id: parsed.id || Date.now().toString(),
      userId: user.userId,
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
      createdAt: new Date(),
    }

    await db.collection('invoices').insertOne(newInvoice)
    return NextResponse.json(newInvoice, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Failed to create invoice')
  }
}
