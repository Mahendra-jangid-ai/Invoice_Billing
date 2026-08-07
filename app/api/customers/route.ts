import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    const customers = await db.collection('customers').find({}).toArray()
    // Map _id or ensure id field is string
    const formatted = customers.map((c) => ({
      id: c.id || c._id.toString(),
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      gstnumber: c.gstnumber || '',
    }))
    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = await getDatabase()

    const newCustomer = {
      id: body.id || Date.now().toString(),
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      gstnumber: body.gstnumber,
      createdAt: new Date(),
    }

    await db.collection('customers').insertOne(newCustomer)
    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error) {
    console.error('Failed to create customer:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
