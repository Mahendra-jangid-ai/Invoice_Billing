import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAuth, logSecurityEvent } from '@/lib/auth'
import { errorResponse, handleApiError, parseBody } from '@/lib/api-errors'
import { CustomerSchema, ResourceIdSchema } from '@/lib/schemas/api-schemas'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse: authError } = await requireAuth()
  if (authError) return authError

  try {
    const { id: rawId } = await params
    const idParsed = ResourceIdSchema.safeParse(rawId)
    if (!idParsed.success) {
      return errorResponse(400, 'Customer ID is required', 'VALIDATION_ERROR')
    }
    const id = idParsed.data

    const parsed = await parseBody(request, CustomerSchema)
    if (parsed instanceof NextResponse) return parsed

    const db = await getDatabase()
    const updateData = {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      address: parsed.address,
      gstnumber: parsed.gstnumber,
      state: parsed.state,
      code: parsed.code,
      updatedAt: new Date(),
    }

    const result = await db.collection('customers').updateOne(
      { id, userId: user.userId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        userId: user.userId,
        resource: 'customer',
        resourceId: id,
        action: 'update',
      })
      return errorResponse(404, 'Customer not found', 'NOT_FOUND')
    }

    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    return handleApiError(error, 'Failed to update customer')
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse: authError } = await requireAuth()
  if (authError) return authError

  try {
    const { id: rawId } = await params
    const idParsed = ResourceIdSchema.safeParse(rawId)
    if (!idParsed.success) {
      return errorResponse(400, 'Customer ID is required', 'VALIDATION_ERROR')
    }
    const id = idParsed.data

    const db = await getDatabase()
    const result = await db.collection('customers').deleteOne({ id, userId: user.userId })

    if (result.deletedCount === 0) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        userId: user.userId,
        resource: 'customer',
        resourceId: id,
        action: 'delete',
      })
      return errorResponse(404, 'Customer not found', 'NOT_FOUND')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to delete customer')
  }
}
