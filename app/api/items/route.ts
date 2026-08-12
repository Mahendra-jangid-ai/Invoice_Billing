import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { handleApiError, parseBody } from '@/lib/api-errors'
import { ItemSchema } from '@/lib/schemas/api-schemas'

export async function GET() {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const db = await getDatabase()
    const items = await db.collection('items').find({ userId: user.userId }).toArray()
    const formatted = items.map((i) => ({
      id: i.id || i._id.toString(),
      name: i.name || '',
      description: i.description || '',
      hsnsac: i.hsnsac || '',
      unitprice: Number(i.unitprice) || 0,
    }))
    return NextResponse.json(formatted)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch items')
  }
}

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const parsed = await parseBody(request, ItemSchema)
    if (parsed instanceof NextResponse) return parsed

    const db = await getDatabase()
    const newItem = {
      id: parsed.id || Date.now().toString(),
      userId: user.userId,
      name: parsed.name,
      description: parsed.description,
      hsnsac: parsed.hsnsac,
      unitprice: parsed.unitprice,
      createdAt: new Date(),
    }

    await db.collection('items').insertOne(newItem)
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Failed to create item')
  }
}
