import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Billing Studio — Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F9FAFB] px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white to-transparent opacity-80" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Billing Studio logo" className="mx-auto mb-4 h-16 w-auto object-contain" />
          <p className="sr-only">Billing Studio</p>
          <p className="mt-2 text-sm text-[#475569]">Modern invoicing with a premium, efficient workspace.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
