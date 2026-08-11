import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'

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
    console.error('Failed to fetch customers:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const body = await request.json()
    const db = await getDatabase()

    const newCustomer = {
      id: body.id || Date.now().toString(),
      userId: user.userId, // Ownership field — always from server session
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      gstnumber: body.gstnumber,
      state: body.state || '',
      code: body.code || '',
      createdAt: new Date(),
    }

    await db.collection('customers').insertOne(newCustomer)
    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error) {
    console.error('Failed to create customer:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
