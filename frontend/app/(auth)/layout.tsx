import type { Metadata } from 'next'
import { AuthGoogleShell } from '@/components/auth-google-shell'

export const metadata: Metadata = {
  title: 'Billing Studio — Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F7FB] px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white to-transparent opacity-80" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <img src="/logo.png" alt="Billing Studio logo" className="mx-auto mb-3 h-14 w-auto object-contain" />
          <p className="text-sm text-slate-500">Modern invoicing for your business</p>
        </div>
        <AuthGoogleShell>{children}</AuthGoogleShell>
      </div>
    </div>
  )
}
