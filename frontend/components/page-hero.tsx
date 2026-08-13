import type { ReactNode } from 'react'

interface PageHeroProps {
  label?: string
  title: string
  description?: string
  actions?: ReactNode
  footer?: ReactNode
}

export function PageHero({ label, title, description, actions, footer }: PageHeroProps) {
  return (
    <div className="hero-card px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {label && <p className="section-label text-[11px]">{label}</p>}
          <h1 className="mt-0.5 text-lg font-bold text-slate-900 sm:mt-1 sm:text-2xl tracking-tight leading-snug">
            {title}
          </h1>
          {description && (
            <p className="hero-description mt-1.5 text-sm text-slate-500 leading-relaxed max-w-2xl sm:mt-2">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="page-actions flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end lg:shrink-0 [&_button]:w-full [&_a]:w-full sm:[&_button]:w-auto sm:[&_a]:w-auto">
            {actions}
          </div>
        )}
      </div>
      {footer && (
        <div className="mt-3 border-t border-slate-100 pt-3 sm:mt-5 sm:pt-4">
          {footer}
        </div>
      )}
    </div>
  )
}
