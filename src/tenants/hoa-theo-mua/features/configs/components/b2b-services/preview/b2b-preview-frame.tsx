import { cn } from '@/shared/utils'
import type { ReactNode } from 'react'
import './b2b-preview.css'

// Every preview renders inside this wrapper: it scopes the public site's palette,
// fonts and heading rules to its subtree (see b2b-preview.css).
export function B2BPreviewFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('b2b-preview relative overflow-hidden bg-background text-foreground', className)}>
      {children}
    </div>
  )
}
