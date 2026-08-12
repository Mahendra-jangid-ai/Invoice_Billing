import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAuth, logSecurityEvent } from '@/lib/auth'
import { errorResponse, handleApiError, parseBody } from '@/lib/api-errors'
import { ItemSchema, ResourceIdSchema } from '@/lib/schemas/api-schemas'

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
      return errorResponse(400, 'Item ID is required', 'VALIDATION_ERROR')
    }
    const id = idParsed.data

    const parsed = await parseBody(request, ItemSchema)
    if (parsed instanceof NextResponse) return parsed

    const db = await getDatabase()
    const updateData = {
      name: parsed.name,
      description: parsed.description,
      hsnsac: parsed.hsnsac,
      unitprice: parsed.unitprice,
      updatedAt: new Date(),
    }

    const result = await db.collection('items').updateOne(
      { id, userId: user.userId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        userId: user.userId,
        resource: 'item',
        resourceId: id,
        action: 'update',
      })
      return errorResponse(404, 'Item not found', 'NOT_FOUND')
    }

    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    return handleApiError(error, 'Failed to update item')
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
      return errorResponse(400, 'Item ID is required', 'VALIDATION_ERROR')
    }
    const id = idParsed.data

    const db = await getDatabase()
    const result = await db.collection('items').deleteOne({ id, userId: user.userId })

    if (result.deletedCount === 0) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        userId: user.userId,
        resource: 'item',
        resourceId: id,
        action: 'delete',
      })
      return errorResponse(404, 'Item not found', 'NOT_FOUND')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to delete item')
  }
}
