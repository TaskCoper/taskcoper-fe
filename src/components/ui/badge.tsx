import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { primaryControlEffectClasses, secondaryControlEffectClasses } from '@/shared/effects'
import { cn } from '@/shared/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: ['border-transparent text-primary-foreground', primaryControlEffectClasses],
        outline:
          'border-transparent bg-secondary text-secondary-foreground relative isolate ring-1 ring-border shadow-[0_1px_--theme(--color-white/0.6)_inset,0_1px_3px_--theme(--color-gray-900/0.06)] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-linear-to-b after:from-white/25 after:from-44% after:via-transparent after:via-50% after:to-black/8 after:to-56% after:mix-blend-overlay',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        secondary: secondaryControlEffectClasses
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return <Comp data-slot='badge' className={cn(badgeVariants({ variant }), className)} {...props} />
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
