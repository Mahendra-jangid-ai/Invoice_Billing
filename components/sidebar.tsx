'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Package, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname()

  const groups = [
    {
      title: 'Overview',
      items: [
        {
          href: '/dashboard',
          icon: LayoutDashboard,
          label: 'Dashboard',
          active: pathname === '/dashboard',
        },
      ],
    },
    {
      title: 'Billing',
      items: [
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
      ],
    },
    {
      title: 'System',
      items: [
        {
          href: '/settings',
          icon: Settings,
          label: 'Company Settings',
          active: pathname === '/settings',
        },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200/80 bg-white/95 backdrop-blur-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/95',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800 md:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-base font-semibold text-white shadow-sm shadow-slate-950/20">
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
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">Billing Studio</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <p className="px-4 pb-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {group.title}
              </p>
              <nav className="space-y-1">
                {group.items.map((route) => {
                  const Icon = route.icon
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition duration-200',
                        route.active
                          ? 'bg-slate-950 text-white shadow-sm shadow-slate-950/10'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      )}
                    >
                      <span className={cn('grid h-10 w-10 place-items-center rounded-2xl', route.active ? 'bg-white/15' : 'bg-slate-100 dark:bg-slate-800')}>
                        <Icon className="h-5 w-5" />
                      </span>
                      {route.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200/80 px-6 py-4 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">© 2025 Billing Studio</p>
        </div>
      </div>
    </aside>
  )
}
