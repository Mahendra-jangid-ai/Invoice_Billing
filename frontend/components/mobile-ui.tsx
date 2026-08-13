import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileCardList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('space-y-3 md:hidden', className)}>{children}</div>
}

export function MobileCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

export function MobileCardBody({
  children,
  className,
  onClick,
  href,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
}) {
  const bodyClass = cn('block p-4 active:bg-slate-50', className)

  if (href) {
    return (
      <Link href={href} className={bodyClass}>
        {children}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(bodyClass, 'w-full text-left')}>
        {children}
      </button>
    )
  }

  return <div className={bodyClass}>{children}</div>
}

export function MobileCardActions({ children }: { children: React.ReactNode }) {
  return <div className="flex border-t border-slate-100">{children}</div>
}

const ACTION_VARIANTS = {
  primary: 'text-[#2563EB] active:bg-blue-50',
  amber: 'text-amber-600 active:bg-amber-50',
  danger: 'text-red-600 active:bg-red-50',
  muted: 'text-slate-600 active:bg-slate-50',
} as const

export function MobileCardAction({
  label,
  icon: Icon,
  onClick,
  href,
  variant = 'muted',
  bordered = true,
}: {
  label: string
  icon: LucideIcon
  onClick?: () => void
  href?: string
  variant?: keyof typeof ACTION_VARIANTS
  bordered?: boolean
}) {
  const className = cn(
    'flex min-h-11 flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold',
    ACTION_VARIANTS[variant],
    bordered && 'border-l border-slate-100 first:border-l-0',
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

export function MobileAvatar({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-[#2563EB]',
        className,
      )}
    >
      {label}
    </div>
  )
}
