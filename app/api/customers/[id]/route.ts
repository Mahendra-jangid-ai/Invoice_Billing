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
      email: body.email,
      phone: body.phone,
      address: body.address,
      gstnumber: body.gstnumber,
      updatedAt: new Date(),
    }

    await db.collection('customers').updateOne(
      { id: id },
      { $set: updateData }
    )

    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    console.error('Failed to update customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDatabase()

    await db.collection('customers').deleteOne({ id: id })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
