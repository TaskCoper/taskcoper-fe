import { cn } from '@/shared/utils'
import type { ReactNode } from 'react'

interface EditorSectionProps {
  title: string
  description?: string
  action?: ReactNode
  children?: ReactNode
  className?: string
  contentClassName?: string
}

export default function EditorSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName
}: EditorSectionProps) {
  return (
    <section className={cn('space-y-3', className)}>
      <header className='flex items-center justify-between gap-3'>
        <div className='min-w-0 -space-y-0.5'>
          <div className='text-base font-semibold'>{title}</div>
          {description && <p className='text-xs text-muted-foreground'>{description}</p>}
        </div>

        {action && <div className='shrink-0'>{action}</div>}
      </header>

      {children && <div className={contentClassName}>{children}</div>}
    </section>
  )
}
