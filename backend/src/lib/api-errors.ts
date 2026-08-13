import type { Response } from 'express'
import { MongoServerError } from 'mongodb'
import { ZodError, type ZodSchema } from 'zod'

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'GOOGLE_AUTH_REQUIRED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INVALID_JSON'
  | 'DATABASE_UNAVAILABLE'
  | 'SERVICE_UNAVAILABLE'
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

export function sendError(
  res: Response,
  status: number,
  message: string,
  code?: ApiErrorCode,
  details?: unknown,
): void {
  const body: ApiErrorBody = { error: message }
  if (code) body.code = code
  if (details !== undefined) body.details = details
  res.status(status).json(body)
}

export function validationError(res: Response, zodError: ZodError): void {
  const firstMessage = zodError.errors[0]?.message || 'Invalid input'
  sendError(
    res,
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

export function parseBody<T>(
  res: Response,
  body: unknown,
  schema: ZodSchema<T>,
): T | null {
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    validationError(res, parsed.error)
    return null
  }
  return parsed.data
}

export function handleApiError(res: Response, error: unknown, fallbackMessage = 'An unexpected error occurred'): void {
  if (error instanceof ApiError) {
    sendError(res, error.status, error.message, error.code, error.details)
    return
  }

  if (isMongoDuplicateKey(error)) {
    sendError(res, 409, 'A record with this value already exists', 'CONFLICT')
    return
  }

  if (isMongoConnectionError(error)) {
    console.error('Database connection error:', error instanceof Error ? error.message : error)
    sendError(res, 503, 'Service temporarily unavailable. Please try again later.', 'DATABASE_UNAVAILABLE')
    return
  }

  console.error('API error:', error instanceof Error ? error.message : error)
  if (error instanceof Error && error.stack) {
    console.error(error.stack)
  }
  sendError(res, 500, fallbackMessage, 'INTERNAL_ERROR')
}
