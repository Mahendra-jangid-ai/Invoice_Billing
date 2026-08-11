import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  const pageTitle = pathname === '/dashboard'
    ? 'Dashboard'
    : pathname.startsWith('/invoices')
      ? 'Invoices'
      : pathname === '/customers'
        ? 'Customers'
        : pathname === '/items'
          ? 'Items'
          : pathname === '/settings'
            ? 'Company Settings'
            : 'Billing Workspace'

  const pageSubtitle = pathname === '/dashboard'
    ? 'Your business snapshot in one place'
    : pathname.startsWith('/invoices')
      ? 'Create and manage invoice workflows'
      : pathname === '/customers'
        ? 'Keep customer details organized'
        : pathname === '/items'
          ? 'Maintain your catalog with ease'
          : pathname === '/settings'
            ? 'Align your branding and company profile'
            : 'Manage your day-to-day billing tasks'

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      <div className="md:flex">
        <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1">
          <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 md:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((open) => !open)}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Menu
            </button>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{pageTitle}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Billing Studio</p>
            </div>
          </div>
        </div>

        <main className="pb-8">
          <div className="mx-auto max-w-6xl px-4 py-0 sm:px-6 lg:px-8 lg:py-2">
            <div className="mb-4 hidden rounded-[30px] border border-slate-200/80 bg-white/80 px-6 py-4 shadow-[0_18px_50px_-25px_rgba(15,23,42,0.25)] backdrop-blur sm:flex sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/70 lg:px-8">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{pageTitle}</p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{pageSubtitle}</h2>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Updated today • Faster workflow
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  </div>
  )
}
