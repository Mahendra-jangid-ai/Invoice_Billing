'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  id?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export function SettingsSection({
  id,
  title,
  description,
  children,
  className,
  action,
}: SettingsSectionProps) {
  return (
    <section id={id} className={cn('premium-card overflow-hidden p-5 sm:p-6', className)}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="card-heading">{title}</h2>
          {description ? <p className="card-subtext mt-1">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function SettingsRow({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="grid gap-2 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-[minmax(0,200px)_1fr] sm:items-center sm:gap-6">
      <div>
        <p className="text-xs font-semibold text-slate-600">{label}</p>
        {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
