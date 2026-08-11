import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Billing Studio — Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="relative w-full max-w-md px-4 py-12">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm shadow-slate-900/10 dark:bg-slate-100 dark:text-slate-950">
            BS
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-slate-950 dark:text-white">Billing Studio</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Professional invoicing</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
