import type { ReactNode } from 'react'

interface FormActionsProps {
  children: ReactNode
  className?: string
}

/** Consistent submit/cancel row — stacks full-width on mobile, right-aligned on desktop. */
export function FormActions({ children, className = '' }: FormActionsProps) {
  return (
    <div className={`form-actions-bar ${className}`}>
      <div className="form-actions-inner">{children}</div>
    </div>
  )
}
