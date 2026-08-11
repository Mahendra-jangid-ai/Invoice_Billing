"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { useAuth } from '@/lib/auth-context'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsSidebarOpen(false)
    setIsProfileOpen(false)
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

  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      <div className="md:flex">
        <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 min-w-0 md:ml-72">
          <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-2 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{pageTitle}</p>
                <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">{pageSubtitle}</h1>
              </div>

              <div className="flex items-center justify-between gap-3 xl:justify-end">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((open) => !open)}
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 md:hidden"
                >
                  Menu
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((open) => !open)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <span>{user?.name || 'Profile'}</span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-950">
                      <div className="mb-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        <p className="font-semibold text-slate-900 dark:text-white">{user?.name || 'Your Account'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'No email available'}</p>
                      </div>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await logout()
                            router.push('/auth/login')
                          }}
                          className="w-full rounded-2xl bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          Logout
                        </button>
                        <Link
                          href="/settings"
                          className="block rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                        >
                          Account settings
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false)
                            router.push('/settings')
                          }}
                          className="block w-full rounded-2xl border border-transparent px-3 py-2 text-left text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                        >
                          Session info
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <main className="pb-10">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
