import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { BillingProvider } from '@/lib/context'
import { AuthProvider } from '@/lib/auth-context'
import { ConfirmProvider } from '@/components/confirm-provider'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { PwaShellProvider } from '@/lib/use-installed-pwa'
import { BottomChromeSync } from '@/components/bottom-chrome-sync'
import { PwaShellScript } from '@/components/pwa-shell-script'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Billing Studio',
  description: 'Professional billing and invoicing software',
  applicationName: 'Billing Studio',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Billing Studio',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/fevicon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563EB' },
    { media: '(prefers-color-scheme: dark)', color: '#1D4ED8' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <PwaShellScript />
        <AuthProvider>
          <BillingProvider>
            <ConfirmProvider>
              <PwaShellProvider>
                <BottomChromeSync />
                {children}
                <PwaInstallPrompt />
              </PwaShellProvider>
            </ConfirmProvider>
          </BillingProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
