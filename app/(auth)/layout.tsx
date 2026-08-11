import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Billing Studio — Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="absolute inset-x-0 top-0 h-48 bg-slate-950/10 blur-3xl dark:bg-slate-200/10" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Billing Studio logo" className="mx-auto mb-4 h-12 w-auto object-contain" />
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Billing Studio</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Modern invoicing with a premium, efficient workspace.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
