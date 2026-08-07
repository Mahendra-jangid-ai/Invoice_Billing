'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Home,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
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
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-6 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            BS
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white">
              Billing
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Pro
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {routes.map((route) => {
            const Icon = route.icon
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  route.active
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-5 w-5" />
                {route.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            © 2025 Billing Software
          </p>
        </div>
      </div>
    </aside>
  )
}
