import * as React from 'react'

import { cn } from '@/shared/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-8.5 w-full min-w-0 rounded-lg bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow] ring-1 ring-gray-900/10 shadow-[0_1px_5px_-4px_rgba(19,19,22,0.4),0_2px_5px_rgba(32,42,54,0.06)] dark:bg-input/30 dark:ring-white/10 dark:shadow-[0_-1px_rgba(255,255,255,0.06),0_4px_8px_rgba(0,0,0,0.05),0_1px_6px_-4px_#000] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

export { Input }
