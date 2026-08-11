import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAuth, logSecurityEvent } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

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
      state: body.state || '',
      code: body.code || '',
      updatedAt: new Date(),
    }

    // IDOR protection: filter by both id AND userId so User A cannot modify User B's customer
    const result = await db.collection('customers').updateOne(
      { id: id, userId: user.userId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        userId: user.userId,
        resource: 'customer',
        resourceId: id,
        action: 'update',
      })
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    console.error('Failed to update customer:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const { id } = await params
    const db = await getDatabase()

    // IDOR protection: filter by both id AND userId
    const result = await db.collection('customers').deleteOne({ id: id, userId: user.userId })

    if (result.deletedCount === 0) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        userId: user.userId,
        resource: 'customer',
        resourceId: id,
        action: 'delete',
      })
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete customer:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
