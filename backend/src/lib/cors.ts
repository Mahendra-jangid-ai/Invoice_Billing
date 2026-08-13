const LOCAL_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
])

function isLocalOrigin(origin: string): boolean {
  if (LOCAL_ORIGINS.has(origin)) return true
  if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    return true
  }
  return false
}

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '')
}

function getConfiguredOrigins(): Set<string> {
  const origins = new Set<string>()
  const frontendUrl = process.env.FRONTEND_URL?.trim()
  if (frontendUrl) {
    origins.add(normalizeOrigin(frontendUrl))
  }

  const extra = process.env.ALLOWED_ORIGINS?.split(',') ?? []
  for (const origin of extra) {
    const trimmed = origin.trim()
    if (trimmed) origins.add(normalizeOrigin(trimmed))
  }

  return origins
}

export function isAllowedOrigin(origin: string): boolean {
  const normalized = normalizeOrigin(origin)
  const configured = getConfiguredOrigins()

  if (configured.has(normalized)) return true
  if (isLocalOrigin(normalized)) return true

  return false
}

export function corsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  // Server-side proxies (Next.js rewrites) and health checks omit Origin.
  if (!origin) {
    callback(null, true)
    return
  }

  if (isAllowedOrigin(origin)) {
    callback(null, true)
    return
  }

  console.warn('[CORS] Blocked origin:', origin)
  callback(new Error(`CORS blocked for origin: ${origin}`))
}
