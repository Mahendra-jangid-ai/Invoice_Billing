'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Settings, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useIsInstalledPwa } from '@/lib/use-installed-pwa'
import { cn } from '@/lib/utils'

const LINKS = [
  {
    href: '/company-settings',
    icon: Building2,
    label: 'Company',
    description: 'Business profile & GST',
    tone: 'bg-blue-50 text-[#2563EB]',
  },
  {
    href: '/setting',
    icon: Settings,
    label: 'Settings',
    description: 'App & session preferences',
    tone: 'bg-slate-100 text-slate-600',
  },
] as const

export function MobileMoreHub({ className }: { className?: string }) {
  const { logout } = useAuth()
  const router = useRouter()

  return (
    <div className={cn('space-y-3 md:hidden', className)}>
      <div className="grid grid-cols-2 gap-2.5">
        {LINKS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[88px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] active:bg-slate-50"
            >
              <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl', item.tone)}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{item.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <button
        type="button"
        onClick={async () => {
          await logout()
          router.push('/login')
        }}
        className="flex w-full items-center justify-between rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3.5 text-left active:bg-red-50"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
            <LogOut className="h-4 w-4" />
          </span>
          <span>
            <p className="text-sm font-semibold text-red-700">Sign out</p>
            <p className="text-[11px] text-red-500/80">Log out of your account</p>
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-red-300" />
      </button>
    </div>
  )
}
