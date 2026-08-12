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
    <div className="hero-card px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {label && <p className="section-label">{label}</p>}
          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl tracking-tight leading-snug">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="page-actions flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:shrink-0">
            {actions}
          </div>
        )}
      </div>
      {footer && (
        <div className="mt-4 border-t border-slate-100 pt-4 sm:mt-5">
          {footer}
        </div>
      )}
    </div>
  )
}
