import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'
import { requireAuth } from '@/lib/auth'
import { revokeUserSessionRecord } from '@/lib/session-store'
import { errorResponse, handleApiError } from '@/lib/api-errors'
import { ResourceIdSchema } from '@/lib/schemas/api-schemas'

interface RouteParams {
  params: Promise<{
    sessionId: string
  }>
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { user, errorResponse: authError } = await requireAuth()
  if (authError) return authError

  try {
    const { sessionId: rawSessionId } = await params
    const sessionIdParsed = ResourceIdSchema.safeParse(rawSessionId)
    if (!sessionIdParsed.success) {
      return errorResponse(400, 'Session id is required', 'VALIDATION_ERROR')
    }
    const sessionId = sessionIdParsed.data

    const revoked = await revokeUserSessionRecord(sessionId, user.userId)
    if (!revoked) {
      return errorResponse(404, 'Session not found or access denied', 'NOT_FOUND')
    }

    if (user.sessionId === sessionId) {
      await deleteSession()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to revoke session')
  }
}
