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

  const pageLabel = pathname === '/dashboard'
    ? 'Dashboard'
    : pathname.startsWith('/invoices')
      ? 'Invoices'
      : pathname === '/customers'
        ? 'Customers'
        : pathname === '/items'
          ? 'Items'
          : pathname === '/company-settings'
            ? 'Company Settings'
            : pathname === '/setting'
              ? 'Settings'
            : 'Workspace'

  const breadcrumbItems = (() => {
    if (pathname === '/dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard' }]
    }

    if (pathname === '/customers') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Customers', href: '/customers' },
      ]
    }

    if (pathname === '/items') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Items', href: '/items' },
      ]
    }

    if (pathname === '/company-settings') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Company Settings', href: '/company-settings' },
      ]
    }

    if (pathname === '/setting') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings', href: '/setting' },
      ]
    }

    if (pathname === '/invoices') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Invoices', href: '/invoices' },
      ]
    }

    if (pathname === '/invoices/new') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Invoices', href: '/invoices' },
        { label: 'Create Invoice', href: '/invoices/new' },
      ]
    }

    const invoiceMatch = pathname.match(/^\/invoices\/([^/]+)(?:\/(edit))?$/)
    if (invoiceMatch) {
      const invoiceId = invoiceMatch[1]
      const isEdit = invoiceMatch[2] === 'edit'

      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Invoices', href: '/invoices' },
        { label: invoiceId, href: `/invoices/${invoiceId}` },
        ...(isEdit ? [{ label: 'Edit', href: `/invoices/${invoiceId}/edit` }] : []),
      ]
    }

    return [{ label: pageLabel, href: pathname || '/dashboard' }]
  })()

  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-[#F9FAFB] text-[#111827] transition-colors duration-200">
      <div
        className={`fixed inset-0 z-40 bg-[#111827]/40 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      <div className="md:flex">
        <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 min-w-0 md:ml-72">
          <div className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 px-4 py-4 shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-2 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B7280]">{pageLabel}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-[#111827] md:text-base">
                  {breadcrumbItems.map((item, index) => (
                    <div key={item.href} className="flex items-center gap-2">
                      {index > 0 && <span className="text-[#9CA3AF]">/</span>}
                      {index === breadcrumbItems.length - 1 ? (
                        <span>{item.label}</span>
                      ) : (
                        <Link href={item.href} className="text-[#6B7280] hover:text-[#111827]">
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 xl:justify-end">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((open) => !open)}
                  className="inline-flex items-center rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#111827] shadow-sm transition hover:bg-[#F9FAFB] md:hidden"
                >
                  Menu
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((open) => !open)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] shadow-sm transition hover:bg-[#F9FAFB]"
                  >
                    <span>{user?.name || 'Profile'}</span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] text-[#111827]">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-[#E5E7EB] bg-white p-3 shadow-xl shadow-[#111827]/10">
                      <div className="mb-3 rounded-2xl bg-[#F9FAFB] p-3 text-sm text-[#374151]">
                        <p className="font-semibold text-[#111827]">{user?.name || 'Your Account'}</p>
                        <p className="text-xs text-[#6B7280]">{user?.email || 'No email available'}</p>
                      </div>
                      <div className="space-y-2 text-center">
                        <button
                          type="button"
                          onClick={async () => {
                            await logout()
                            router.push('/login')
                          }}
                          className="w-full rounded-2xl bg-[#2563EB] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
                        >
                          Logout
                        </button>
                        <Link
                          href="/company-settings"
                          className="block rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-center text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                        >
                          Account settings
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false)
                            router.push('/setting#sessions')
                          }}
                          className="block w-full rounded-2xl border border-transparent px-3 py-2 text-center text-sm font-medium text-[#6B7280] hover:text-[#111827]"
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
