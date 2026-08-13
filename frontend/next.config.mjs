import path from 'path'
import { fileURLToPath } from 'url'
import withPWAInit from '@ducanh2912/next-pwa'

/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production'
const backendUrl = process.env.BACKEND_URL || (isProduction ? '' : 'http://localhost:4000')
const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (isProduction && !backendUrl) {
  throw new Error('BACKEND_URL environment variable is required in production')
}

const devOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(',').map((item) => item.trim()).filter(Boolean) ?? []

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: false,
  cacheOnFrontEndNav: false,
  reloadOnOnline: true,
  extendDefaultRuntimeCaching: false,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-images',
          expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
})

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

if (isProduction) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  })
}

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
  },
  ...(devOrigins.length > 0 ? { allowedDevOrigins: devOrigins } : {}),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default withPWA(nextConfig)
