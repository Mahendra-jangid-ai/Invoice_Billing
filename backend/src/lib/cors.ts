const LOCAL_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
])

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
  if (LOCAL_ORIGINS.has(normalized)) return true

  // Vercel production + preview deployments
  if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(normalized)) return true

  if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost:\d+$/.test(normalized)) {
    return true
  }

  return false
}

export function corsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  // Vercel/Next.js server proxy and health checks often omit Origin — allow them.
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
