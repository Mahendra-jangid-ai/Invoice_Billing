import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold transition duration-200 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-px disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm shadow-[#2563EB]/20',
        secondary: 'bg-[#F9FAFB] text-[#111827] border border-[#E5E7EB] hover:bg-[#EFF6FF]',
        outline:
          'bg-transparent border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB]',
        ghost:
          'bg-transparent text-[#111827] hover:bg-[#F9FAFB]',
        destructive:
          'bg-red-600 text-white hover:bg-red-700',
        link: 'bg-transparent text-[#2563EB] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 gap-2 px-5',
        xs: 'h-8 gap-1 rounded-lg px-3 text-xs',
        sm: 'h-10 gap-2 px-4 text-sm',
        lg: 'h-12 gap-3 px-6 text-base',
        icon: 'h-10 w-10 p-0',
        'icon-xs': 'h-8 w-8 p-0',
        'icon-sm': 'h-9 w-9 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
