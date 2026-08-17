import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { registerAuthRoutes } from './routes/auth.js'
import { registerCustomerRoutes } from './routes/customers.js'
import { registerItemRoutes } from './routes/items.js'
import { registerInvoiceRoutes } from './routes/invoices.js'
import { registerCompanyRoutes } from './routes/company.js'
import { registerWebSettingsRoutes } from './routes/web-settings.js'
import { handleApiError, sendError } from './lib/api-errors.js'
import { ensureIndexes, getDatabase, getMongoClient } from './lib/mongodb.js'
import { corsOrigin } from './lib/cors.js'
import { globalApiRateLimit } from './lib/api-middleware.js'

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(backendRoot, '.env') })

if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET environment variable is required')
  process.exit(1)
}
if (process.env.SESSION_SECRET.length < 32) {
  console.error('SESSION_SECRET must be at least 32 characters long')
  process.exit(1)
}

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
const port = Number(process.env.PORT) || 4000

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  next()
})
app.use(express.json({ limit: '2mb' }))
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    sendError(res, 400, 'Invalid JSON in request body', 'INVALID_JSON')
    return
  }
  next(err)
})
app.use(cookieParser())

app.use(globalApiRateLimit)

app.get('/', (_req, res) => {
  res.json({
    service: 'Capsi Books API',
    status: 'running',
    health: '/api/health',
  })
})

app.get('/api/health', async (_req, res) => {
  try {
    const db = await getDatabase()
    await db.command({ ping: 1 })
    res.json({ ok: true })
  } catch {
    res.status(503).json({ ok: false, error: 'Database unavailable' })
  }
})

registerAuthRoutes(app)
registerCustomerRoutes(app)
registerItemRoutes(app)
registerInvoiceRoutes(app)
registerCompanyRoutes(app)
registerWebSettingsRoutes(app)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  handleApiError(res, err)
})

const server = app.listen(port, () => {
  console.info(`Backend API running at http://localhost:${port}`)
  ensureIndexes().catch((err) => {
    console.error('Failed to ensure database indexes:', err instanceof Error ? err.message : err)
  })
})

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${port} is already in use. Stop the other process or set PORT in .env.\n` +
        `Windows: netstat -ano | findstr :${port}  then  taskkill /PID <pid> /F`,
    )
    process.exit(1)
  }
  console.error(err)
  process.exit(1)
})

function shutdown(signal: string) {
  console.info(`Received ${signal}, shutting down gracefully...`)
  server.close(() => {
    getMongoClient()
      .then((client) => client.close())
      .catch(() => undefined)
      .finally(() => process.exit(0))
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
