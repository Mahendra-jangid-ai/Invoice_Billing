"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useBilling } from '@/lib/context'
import { ApiErrorBanner } from '@/components/api-error-banner'
import {
  Menu,
  ChevronRight,
  LogOut,
  Settings,
  User,
} from 'lucide-react'

// ── Lazy-load the sidebar (it's heavy with icons + nav) ─────────────────────
const Sidebar = dynamic(
  () => import('@/components/sidebar').then((m) => ({ default: m.Sidebar })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-y-0 left-0 z-40 w-72 border-r border-gray-200 bg-white" />
    ),
  }
)

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function getPageMeta(pathname: string): { label: string; breadcrumbs: { label: string; href: string }[] } {
  if (pathname === '/dashboard')
    return { label: 'Dashboard', breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }] }

  if (pathname === '/customers')
    return { label: 'Customers', breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Customers', href: '/customers' }] }

  if (pathname === '/items')
    return { label: 'Items', breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Items', href: '/items' }] }

  if (pathname === '/company-settings')
    return { label: 'Company Settings', breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Company Settings', href: '/company-settings' }] }

  if (pathname === '/setting')
    return { label: 'Settings', breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings', href: '/setting' }] }

  if (pathname === '/invoices')
    return { label: 'Invoices', breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Invoices', href: '/invoices' }] }

  if (pathname === '/invoices/new')
    return {
      label: 'New Invoice',
      breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Invoices', href: '/invoices' }, { label: 'New Invoice', href: '/invoices/new' }],
    }

  const m = pathname.match(/^\/invoices\/([^/]+)(?:\/(edit))?$/)
  if (m)
    return {
      label: m[2] === 'edit' ? 'Edit Invoice' : `Invoice ${m[1]}`,
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Invoices', href: '/invoices' },
        { label: m[1], href: `/invoices/${m[1]}` },
        ...(m[2] === 'edit' ? [{ label: 'Edit', href: `/invoices/${m[1]}/edit` }] : []),
      ],
    }

  return { label: 'Workspace', breadcrumbs: [{ label: 'Workspace', href: pathname }] }
}

/* ─── Layout ────────────────────────────────────────────────────────────────── */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { error: billingError, clearError } = useBilling()
  const router = useRouter()

  // Close everything on navigation
  useEffect(() => {
    setSidebarOpen(false)
    setProfileOpen(false)
  }, [pathname])

  // Close profile on outside click
  useEffect(() => {
    if (!profileOpen) return
    const handle = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('[data-profile-menu]')) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [profileOpen])

  const { label, breadcrumbs } = getPageMeta(pathname)
  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="relative min-h-screen bg-[#F6F7FB]">

      {/* ── Mobile backdrop ── */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      {/* ── Sidebar ── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main area ── */}
      <div className="md:pl-72 flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-3 py-2.5 backdrop-blur-xl sm:px-6 lg:px-8 shadow-sm pt-[max(0.5rem,env(safe-area-inset-top))]">

          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="md:hidden touch-target inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm active:bg-slate-50 transition"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden min-w-0 sm:flex sm:items-center sm:gap-1 sm:text-sm">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-slate-900 truncate">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-slate-400 hover:text-slate-700 transition truncate"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            <p className="truncate text-sm font-semibold text-slate-900 sm:hidden">{label}</p>
          </div>

          {/* Right: profile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative" data-profile-menu>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-xs font-bold text-white">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                  {user?.name || 'Profile'}
                </span>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60 animate-scale-in z-50">
                  {/* User info */}
                  <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold text-white flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user?.name || 'Your Account'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/company-settings"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Account settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setProfileOpen(false); router.push('/setting#sessions') }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Session info
                    </button>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={async () => {
                        await logout()
                        router.push('/login')
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 mobile-page">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <ApiErrorBanner message={billingError} onDismiss={clearError} />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
