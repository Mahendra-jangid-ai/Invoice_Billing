import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileCardList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('pwa-shell-only space-y-2.5 md:hidden', className)}>{children}</div>
}

export function MobileCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function MobileCardBody({
  children,
  className,
  onClick,
  href,
  showChevron = false,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
  showChevron?: boolean
}) {
  const bodyClass = cn('block p-4 active:bg-slate-50/80 transition-colors', className)
  const content = (
    <>
      {children}
      {showChevron && (
        <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn(bodyClass, showChevron && 'relative pr-10')}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(bodyClass, 'w-full text-left', showChevron && 'relative pr-10')}>
        {content}
      </button>
    )
  }

  return <div className={bodyClass}>{children}</div>
}

export function MobileCardRow({
  title,
  subtitle,
  meta,
  badge,
  amount,
  className,
}: {
  title: string
  subtitle?: string
  meta?: string
  badge?: React.ReactNode
  amount?: string
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="truncate text-[15px] font-semibold text-slate-900">{title}</p>
          {badge}
        </div>
        {subtitle && <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>}
        {meta && <p className="mt-2 text-xs text-slate-400">{meta}</p>}
      </div>
      {amount && (
        <p className="shrink-0 text-base font-bold tabular-nums text-slate-900">{amount}</p>
      )}
    </div>
  )
}

export function MobileCardActions({ children }: { children: React.ReactNode }) {
  return <div className="flex divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/50">{children}</div>
}

const ACTION_VARIANTS = {
  primary: 'text-[#2563EB] active:bg-blue-50/80',
  amber: 'text-amber-600 active:bg-amber-50/80',
  danger: 'text-red-600 active:bg-red-50/80',
  muted: 'text-slate-600 active:bg-slate-100/80',
} as const

export function MobileCardAction({
  label,
  icon: Icon,
  onClick,
  href,
  variant = 'muted',
}: {
  label: string
  icon: LucideIcon
  onClick?: () => void
  href?: string
  variant?: keyof typeof ACTION_VARIANTS
  bordered?: boolean
}) {
  const className = cn(
    'flex min-h-11 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors',
    ACTION_VARIANTS[variant],
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

export function MobileAvatar({
  label,
  className,
  tone = 'blue',
}: {
  label: string
  className?: string
  tone?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate'
}) {
  const tones = {
    blue: 'bg-blue-50 text-[#2563EB]',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-100 text-slate-600',
  }

  return (
    <div
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold',
        tones[tone],
        className,
      )}
    >
      {label}
    </div>
  )
}

export function MobileStatGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('pwa-shell-only grid grid-cols-2 gap-2.5 md:hidden', className)}>{children}</div>
}

export function MobileStatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClassName,
}: {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  iconClassName?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{value}</p>
          {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
        </div>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50', iconClassName)}>
          <Icon className="h-4 w-4 text-[#2563EB]" />
        </div>
      </div>
    </div>
  )
}

export function MobileSectionHeader({
  title,
  action,
  className,
}: {
  title: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3 px-0.5', className)}>
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {action}
    </div>
  )
}

export function MobileEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center md:hidden">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <div>
        <p className="text-base font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}
