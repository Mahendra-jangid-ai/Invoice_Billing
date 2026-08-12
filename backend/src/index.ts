import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { registerAuthRoutes } from './routes/auth.js'
import { registerCustomerRoutes } from './routes/customers.js'
import { registerItemRoutes } from './routes/items.js'
import { registerInvoiceRoutes } from './routes/invoices.js'
import { registerCompanyRoutes } from './routes/company.js'
import { registerWebSettingsRoutes } from './routes/web-settings.js'
import { handleApiError } from './lib/api-errors.js'
import { ensureIndexes } from './lib/mongodb.js'

dotenv.config()

const DEFAULT_SESSION_SECRET = 'VGdqDIcgZxAmsvcQSXTFhiAI30gFNLkWDF/Xhf77BAA='
if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET environment variable is required')
  process.exit(1)
}
if (process.env.NODE_ENV === 'production' && process.env.SESSION_SECRET === DEFAULT_SESSION_SECRET) {
  console.error('SESSION_SECRET must be changed from the default value in production')
  process.exit(1)
}

const app = express()
app.set('trust proxy', 1)
const port = Number(process.env.PORT) || 4000
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

function corsOrigin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
  if (!origin) {
    if (process.env.NODE_ENV === 'production') {
      callback(new Error('CORS: origin header required'))
      return
    }
    callback(null, true)
    return
  }
  const allowed = new Set([
    frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ])
  if (allowed.has(origin)) {
    callback(null, true)
    return
  }
  if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost:\d+$/.test(origin)) {
    callback(null, true)
    return
  }
  callback(new Error(`CORS blocked for origin: ${origin}`))
}

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
})
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

app.get('/', (_req, res) => {
  res.json({
    service: 'Capsi Books API',
    status: 'running',
    health: '/api/health',
  })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
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
