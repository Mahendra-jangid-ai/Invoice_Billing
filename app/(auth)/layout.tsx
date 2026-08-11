import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Billing Studio — Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="absolute inset-x-0 top-0 h-48 bg-slate-950/10 blur-3xl dark:bg-slate-200/10" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-[32px] border border-slate-200/80 bg-white/95 p-8 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-950 text-lg font-semibold text-white shadow-sm shadow-slate-950/20 dark:bg-slate-100 dark:text-slate-950">
            BS
          </div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Billing Studio</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Modern invoicing with a premium, efficient workspace.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
