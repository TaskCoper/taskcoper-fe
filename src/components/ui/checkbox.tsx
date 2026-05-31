import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/shared/utils'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'cursor-pointer peer relative isolate overflow-hidden border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:shadow-[0_1px_--theme(--color-white/0.07)_inset,0_1px_3px_--theme(--color-gray-900/0.2)] focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-md border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[3px] before:bg-linear-to-b before:from-white/20 before:opacity-0 before:transition-opacity before:duration-300 before:ease-[cubic-bezier(0.4,0.36,0,1)] data-[state=checked]:before:opacity-50 after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[3px] after:bg-linear-to-b after:from-white/15 after:from-44% after:via-transparent after:via-50% after:to-black/12 after:to-56% after:mix-blend-overlay after:opacity-0 data-[state=checked]:after:opacity-100',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='grid place-content-center text-current transition-none'
      >
        <CheckIcon className='size-3.5 text-primary-foreground' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
