import type { Request, Response, NextFunction } from 'express'
import { checkRateLimit } from './rate-limit.js'
import { getClientIp } from './auth.js'
import { sendError } from './api-errors.js'

const API_RATE_LIMIT = 300
const API_RATE_WINDOW_MS = 60 * 1000

export function globalApiRateLimit(req: Request, res: Response, next: NextFunction): void {
  if (!req.path.startsWith('/api/') || req.path === '/api/health') {
    next()
    return
  }

  const ip = getClientIp(req)
  const userId = req.user?.userId
  const key = userId ? `api:user:${userId}` : `api:ip:${ip}`
  const result = checkRateLimit(key, API_RATE_LIMIT, API_RATE_WINDOW_MS)

  if (!result.allowed) {
    sendError(res, 429, 'Too many requests. Please slow down and try again.', 'RATE_LIMITED')
    return
  }

  next()
}
