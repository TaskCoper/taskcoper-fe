import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as React from 'react'

import { cn } from '@/shared/utils'

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      className={cn(
        'cursor-pointer peer relative isolate overflow-hidden data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent data-[state=unchecked]:shadow-xs data-[state=checked]:shadow-[0_1px_--theme(--color-white/0.07)_inset,0_1px_3px_--theme(--color-gray-900/0.2)] transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-linear-to-b before:from-white/20 before:opacity-0 data-[state=checked]:before:opacity-50 before:transition-opacity after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-linear-to-b after:from-white/15 after:from-44% after:via-transparent after:via-50% after:to-black/12 after:to-56% after:mix-blend-overlay after:opacity-0 data-[state=checked]:after:opacity-100',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className={cn(
          'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
