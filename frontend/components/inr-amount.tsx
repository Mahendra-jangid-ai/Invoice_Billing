import { cn } from '@/lib/utils'
import { formatInr, INR_TEXT_CLASS } from '@/lib/format-inr'

export function InrAmount({
  value,
  className,
  options,
  negative = false,
}: {
  value: number
  className?: string
  options?: Intl.NumberFormatOptions
  negative?: boolean
}) {
  return (
    <span className={cn('font-semibold tabular-nums', INR_TEXT_CLASS, className)}>
      {negative ? '-' : ''}
      {formatInr(value, options)}
    </span>
  )
}
