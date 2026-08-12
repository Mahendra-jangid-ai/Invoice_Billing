import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { handleApiError, parseBody } from '@/lib/api-errors'
import { CustomerSchema } from '@/lib/schemas/api-schemas'

export async function GET() {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const db = await getDatabase()
    const customers = await db.collection('customers').find({ userId: user.userId }).toArray()
    const formatted = customers.map((c) => ({
      id: c.id || c._id.toString(),
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      gstnumber: c.gstnumber || '',
      state: c.state || '',
      code: c.code || '',
    }))
    return NextResponse.json(formatted)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch customers')
  }
}

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const parsed = await parseBody(request, CustomerSchema)
    if (parsed instanceof NextResponse) return parsed

    const db = await getDatabase()
    const newCustomer = {
      id: parsed.id || Date.now().toString(),
      userId: user.userId,
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
    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Failed to create customer')
  }
}
