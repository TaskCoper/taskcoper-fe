import { cn } from '@/shared/utils'
import { Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

type CalloutTone = 'info' | 'warning'

const TONES: Record<CalloutTone, { wrapper: string; icon: string; text: string }> = {
  info: {
    wrapper: 'border-dashed border-sky-300 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/50',
    icon: 'text-sky-600 dark:text-sky-400',
    text: 'text-sky-900 dark:text-sky-200'
  },
  warning: {
    wrapper: 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-900 dark:text-amber-200'
  }
}

export default function EditorCallout({
  tone = 'info',
  children,
  className
}: {
  tone?: CalloutTone
  children: ReactNode
  className?: string
}) {
  const styles = TONES[tone]
  const Icon = tone === 'warning' ? TriangleAlert : Info

  return (
    <div className={cn('flex items-center gap-2 rounded-lg border border-dashed px-3 py-2', styles.wrapper, className)}>
      <Icon className={cn('size-3.5 shrink-0', styles.icon)} aria-hidden='true' />
      <p className={cn('text-sm font-medium', styles.text)}>{children}</p>
    </div>
  )
}
