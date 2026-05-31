import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { primaryControlEffectClasses } from '@/shared/effects'
import { cn } from '@/shared/utils'

const progressVariants = cva('relative h-2 w-full overflow-hidden rounded-full', {
  variants: {
    variant: {
      default: 'bg-primary/20',
      success: 'bg-emerald-500/20',
      destructive: 'bg-destructive/20',
      warning: 'bg-yellow-500/20',
      info: 'bg-blue-500/20'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const progressIndicatorVariants = cva('h-full w-full flex-1 transition-all', {
  variants: {
    variant: {
      default: primaryControlEffectClasses,
      success: 'bg-emerald-500',
      destructive: 'bg-destructive',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, VariantProps<typeof progressVariants> {}

function Progress({ className, value, variant, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root data-slot='progress' className={cn(progressVariants({ variant }), className)} {...props}>
      <ProgressPrimitive.Indicator
        data-slot='progress-indicator'
        className={cn(progressIndicatorVariants({ variant }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
