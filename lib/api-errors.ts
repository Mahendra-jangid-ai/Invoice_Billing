import 'server-only'

import { NextResponse } from 'next/server'
import { MongoServerError } from 'mongodb'
import { ZodError, type ZodSchema } from 'zod'

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INVALID_JSON'
  | 'DATABASE_UNAVAILABLE'
  | 'INTERNAL_ERROR'

export interface ApiErrorBody {
  error: string
  code?: ApiErrorCode
  details?: unknown
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: ApiErrorCode,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function errorResponse(
  status: number,
  message: string,
  code?: ApiErrorCode,
  details?: unknown,
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error: message }
  if (code) body.code = code
  if (details !== undefined) body.details = details
  return NextResponse.json(body, { status })
}

export function validationError(zodError: ZodError): NextResponse<ApiErrorBody> {
  const firstMessage = zodError.errors[0]?.message || 'Invalid input'
  return errorResponse(
    400,
    firstMessage,
    'VALIDATION_ERROR',
    zodError.errors.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  )
}

export function isMongoDuplicateKey(error: unknown): boolean {
  return error instanceof MongoServerError && error.code === 11000
}

export function isMongoConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes('econnrefused') ||
    message.includes('failed to connect') ||
    message.includes('connection timed out') ||
    message.includes('topology') ||
    message.includes('server selection')
  )
}

export async function parseJsonBody<T>(request: Request): Promise<T | NextResponse> {
  try {
    return (await request.json()) as T
  } catch {
    return errorResponse(400, 'Invalid JSON body', 'INVALID_JSON')
  }
}

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<T | NextResponse> {
  const body = await parseJsonBody<unknown>(request)
  if (body instanceof NextResponse) return body

  const parsed = schema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error)
  return parsed.data
}

export function handleApiError(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred',
): NextResponse<ApiErrorBody> {
  if (error instanceof ApiError) {
    return errorResponse(error.status, error.message, error.code, error.details)
  }

  if (isMongoDuplicateKey(error)) {
    return errorResponse(409, 'A record with this value already exists', 'CONFLICT')
  }

  if (isMongoConnectionError(error)) {
    console.error(
      'Database connection error:',
      error instanceof Error ? error.message : error,
    )
    return errorResponse(
      503,
      'Service temporarily unavailable. Please try again later.',
      'DATABASE_UNAVAILABLE',
    )
  }

  console.error('API error:', error instanceof Error ? error.message : error)
  return errorResponse(500, fallbackMessage, 'INTERNAL_ERROR')
}
