import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/utils'

const progressVariants = cva('relative h-2 w-full overflow-hidden rounded-full', {
  variants: {
    variant: {
      default: ['bg-primary/20', '**:data-[slot=progress-indicator]:bg-primary'],
      success: ['bg-emerald-500/20', '**:data-[slot=progress-indicator]:bg-emerald-500'],
      destructive: ['bg-destructive/20', '**:data-[slot=progress-indicator]:bg-destructive'],
      warning: ['bg-yellow-500/20', '**:data-[slot=progress-indicator]:bg-yellow-500'],
      info: ['bg-blue-500/20', '**:data-[slot=progress-indicator]:bg-blue-500']
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
        className='h-full w-full flex-1 transition-all'
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
