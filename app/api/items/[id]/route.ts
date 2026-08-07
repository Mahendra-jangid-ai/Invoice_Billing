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
      name: body.name,
      description: body.description,
      hsnsac: body.hsnsac,
      unitprice: Number(body.unitprice),
      updatedAt: new Date(),
    }

    await db.collection('items').updateOne(
      { id: id },
      { $set: updateData }
    )

    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    console.error('Failed to update item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDatabase()

    await db.collection('items').deleteOne({ id: id })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
