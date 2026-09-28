/* eslint-disable react-refresh/only-export-components */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/shared/utils'
import type { ReactNode } from 'react'
import { type LocalizedText } from '../../../types'

// A titled section card wrapping a group of fields.
export function SectionCard({
  title,
  description,
  children,
  className
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <div className='text-sm font-semibold'>{title}</div>
        {description && <div className='text-xs text-muted-foreground'>{description}</div>}
      </div>
      {children}
    </div>
  )
}

// A collapsible row for one code-bound array item (id is fixed, only copy is edited).
export function ItemRow({ index, label, children }: { index: number; label: string; children: ReactNode }) {
  return (
    <AccordionItem value={`row-${index}`} className='border-b-transparent'>
      <div className='flex items-center gap-2 rounded-xl border bg-muted'>
        <AccordionTrigger className='min-w-0 flex-1 p-2 hover:no-underline' headerClassName='min-w-0 flex-1'>
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            <span className='flex size-6 shrink-0 items-center justify-center rounded-md bg-background text-xs font-medium text-muted-foreground'>
              {index + 1}
            </span>
            <span className='min-w-0 flex-1 truncate text-left text-sm font-medium'>{label}</span>
          </div>
        </AccordionTrigger>
      </div>
      <AccordionContent className='space-y-3 p-4'>{children}</AccordionContent>
    </AccordionItem>
  )
}

export { Accordion }

export const updateInList = <T,>(list: T[], index: number, next: T): T[] =>
  list.map((it, i) => (i === index ? next : it))

export const previewLabel = (value: LocalizedText, fallback: string): string =>
  value.vi.trim() || value.en.trim() || fallback
