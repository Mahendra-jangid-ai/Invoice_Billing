import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    const items = await db.collection('items').find({}).toArray()
    const formatted = items.map((i) => ({
      id: i.id || i._id.toString(),
      name: i.name || '',
      description: i.description || '',
      hsnsac: i.hsnsac || '',
      unitprice: Number(i.unitprice) || 0,
    }))
    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Failed to fetch items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = await getDatabase()

    const newItem = {
      id: body.id || Date.now().toString(),
      name: body.name,
      description: body.description,
      hsnsac: body.hsnsac,
      unitprice: Number(body.unitprice),
      createdAt: new Date(),
    }

    await db.collection('items').insertOne(newItem)
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Failed to create item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
