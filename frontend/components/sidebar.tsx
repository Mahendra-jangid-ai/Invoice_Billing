'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Package, Settings, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const groups = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard'  },
    ],
  },
  {
    title: 'Billing',
    items: [
      { href: '/invoices',         icon: FileText,        label: 'Invoices'  },
      { href: '/customers',        icon: Users,           label: 'Customers' },
      { href: '/items',            icon: Package,         label: 'Items'     },
    ],
  },
  {
    title: 'Manage',
    items: [
      { href: '/company-settings', icon: Building2,       label: 'Company Settings' },
      { href: '/setting',          icon: Settings,        label: 'Settings'  },
    ],
  },
]

export function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : href === '/invoices'
      ? pathname.startsWith('/invoices')
      : pathname === href

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col',
        'border-r border-slate-200 bg-white',
        'transition-transform duration-300 ease-in-out will-change-transform',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0'
      )}
    >
      {/* ── Logo area (mobile: with close button) ── */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:hidden">
        <img src="/logo.png" alt="Billing Studio logo" className="h-9 w-auto object-contain" />
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>

      {/* ── Logo area (desktop) ── */}
      <div className="hidden border-b border-slate-100 px-5 py-5 md:block">
        <img src="/logo.png" alt="Billing Studio logo" className="h-10 w-auto object-contain" />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.title} className="mb-5 last:mb-0">
            <p className="mb-1.5 px-3 text-xs font-medium text-slate-400">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                        active
                          ? 'bg-[#2563EB] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-slate-100 px-5 py-4">
        <p className="text-xs text-slate-400">
          © 2025{' '}
          <img
            src="/logo.png"
            alt="Billing Studio logo"
            className="inline-block ml-1 h-4 w-auto object-contain"
          />
        </p>
      </div>
    </aside>
  )
}
