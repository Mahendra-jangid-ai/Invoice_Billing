import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold transition-colors duration-200 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-px disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-slate-950 text-white hover:bg-slate-800 shadow-sm shadow-slate-950/10 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100',
        secondary: 'bg-slate-100 text-slate-950 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
        outline:
          'bg-transparent border-slate-300 text-slate-950 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900',
        ghost:
          'bg-transparent text-slate-950 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
        link: 'bg-transparent text-slate-950 underline-offset-4 hover:underline dark:text-slate-100',
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
