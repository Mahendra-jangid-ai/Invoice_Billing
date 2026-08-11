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
          href: '/company-settings',
          icon: Settings,
          label: 'Company Settings',
          active: pathname === '/company-settings',
        },
        {
          href: '/setting',
          icon: Settings,
          label: 'Settings',
          active: pathname === '/setting',
        },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-72 border-r border-[#E5E7EB] bg-white/95 backdrop-blur-xl transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4 md:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm">
            <img src="/logo.png" alt="Billing Studio logo" className="h-9 w-auto object-contain" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#111827] shadow-sm transition hover:bg-[#F9FAFB]"
          >
            Close
          </button>
        </div>

        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <img src="/logo.png" alt="Billing Studio logo" className="h-15 justify-content-center w-auto object-contain" />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <p className="px-4 pb-2 text-xs uppercase tracking-[0.2em] text-[#6B7280]">
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
                          ? 'bg-[#2563EB] text-white shadow-sm shadow-[#2563EB]/10'
                          : 'text-[#374151] hover:bg-[#F9FAFB]'
                      )}
                    >
                      <span className={cn('grid h-10 w-10 place-items-center rounded-2xl', route.active ? 'bg-white/15' : 'bg-[#F3F4F6]')}>
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

        <div className="border-t border-[#E5E7EB] px-6 py-4">
          <p className="text-xs text-[#6B7280]">© 2025 <img src="/logo.png" alt="Billing Studio logo" className="inline-block ml-1 h-4 w-auto object-contain" /></p>
        </div>
      </div>
    </aside>
  )
}
