'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Package, Settings, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname()

  const routes = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      active: pathname === '/dashboard',
    },
    {
      href: '/invoices',
      icon: FileText,
      label: 'Invoices',
      active: pathname.startsWith('/invoices'),
    },
    {
      href: '/customers',
      icon: Users,
      label: 'Customers',
      active: pathname === '/customers',
    },
    {
      href: '/items',
      icon: Package,
      label: 'Items',
      active: pathname === '/items',
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Company Settings',
      active: pathname === '/settings',
    },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white/90 backdrop-blur-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/90',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:static md:inset-auto'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800 md:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white shadow-lg shadow-blue-600/20">
            BS
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <div className="border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white shadow-lg shadow-blue-600/20">
              BS
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900 dark:text-white">Billing Studio</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Professional invoicing</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {routes.map((route) => {
            const Icon = route.icon
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                  route.active
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <span className={cn('rounded-xl p-2', route.active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800')}>
                  <Icon className="h-4 w-4" />
                </span>
                {route.label}
              </Link>
            )
          })}
        </nav>

        <div className="mx-4 mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Smart workflow
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create, review, and share invoices faster with a cleaner workspace.
          </p>
        </div>

        <div className="border-t border-slate-200/80 px-6 py-4 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">© 2025 Billing Software</p>
        </div>
      </div>
    </aside>
  )
}
