import path from 'path'
import { fileURLToPath } from 'url'
import withPWAInit from '@ducanh2912/next-pwa'

/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
})

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['172.14.3.72'],
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
