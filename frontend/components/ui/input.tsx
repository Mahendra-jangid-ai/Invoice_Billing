import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'

import { cn } from '@/lib/utils'

function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-sm text-[#111827] placeholder:text-[#6B7280] transition duration-200 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
