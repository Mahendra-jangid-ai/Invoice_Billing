'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  MoreHorizontal,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsInstalledPwa } from '@/lib/use-installed-pwa'
import { shouldHideBottomNav } from '@/lib/mobile-chrome'

const MAIN_TABS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home', match: (p: string) => p === '/dashboard' },
  { href: '/invoices', icon: FileText, label: 'Invoices', match: (p: string) => p.startsWith('/invoices') },
  { href: '/customers', icon: Users, label: 'Clients', match: (p: string) => p === '/customers' },
  { href: '/items', icon: Package, label: 'Items', match: (p: string) => p === '/items' },
] as const

function shouldHideBottomNavOnRoute(pathname: string) {
  return shouldHideBottomNav(pathname)
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const isInstalledPwa = useIsInstalledPwa()

  if (!isInstalledPwa || shouldHideBottomNavOnRoute(pathname)) return null

  const moreActive =
    pathname === '/more' ||
    pathname === '/setting' ||
    pathname === '/company-settings' ||
    pathname === '/settings'

  return (
    <>
      <Link
        href="/invoices/new"
        className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-40 md:hidden inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
        aria-label="Create new invoice"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </Link>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Main navigation"
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1">
          {MAIN_TABS.map((tab) => {
            const active = tab.match(pathname)
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-colors',
                  active ? 'text-[#2563EB]' : 'text-slate-400 active:text-slate-600',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                    active && 'bg-blue-50',
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
                </span>
                <span className={cn('text-[10px] font-semibold leading-none', active && 'text-[#2563EB]')}>
                  {tab.label}
                </span>
              </Link>
            )
          })}

          <Link
            href="/more"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-colors',
              moreActive ? 'text-[#2563EB]' : 'text-slate-400 active:text-slate-600',
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                moreActive && 'bg-blue-50',
              )}
            >
              <MoreHorizontal className="h-5 w-5" strokeWidth={moreActive ? 2.25 : 2} />
            </span>
            <span className={cn('text-[10px] font-semibold leading-none', moreActive && 'text-[#2563EB]')}>
              More
            </span>
          </Link>
        </div>
      </nav>
    </>
  )
}
