import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/shared/utils'
import type { ReactNode } from 'react'
import type { Config } from '../../types'

export interface CategoryEditorItem {
  key: string
  label: string
  config: Config | null
  mono?: boolean
  icon?: ReactNode
}

interface CategoryEditorPanelProps {
  items: readonly CategoryEditorItem[]
  selectedKey: string | null
  onSelect: (key: string) => void
  navLabel: string
  children: (item: CategoryEditorItem) => ReactNode
  footer?: ReactNode
  contentClassName?: string
}

export default function CategoryEditorPanel({
  items,
  selectedKey,
  onSelect,
  navLabel,
  children,
  footer,
  contentClassName
}: CategoryEditorPanelProps) {
  const selected = items.find((item) => item.key === selectedKey) ?? items[0]
  if (!selected) return null

  const labels = items.map((item) => item.config?.value?.label?.trim() || item.label)

  return (
    <Tabs
      value={selected.key}
      onValueChange={onSelect}
      activationMode='manual'
      className='min-h-0 min-w-0 flex-1 gap-0'
    >
      {items.length > 1 && (
        <div className='shrink-0 border-b px-4 py-3'>
          <TabsList aria-label={navLabel} className='h-auto flex-wrap justify-start gap-1'>
            {items.map((item, index) => {
              const label = labels[index]
              const disambiguator = labels.filter((other) => other === label).length > 1 ? item.label : null
              const isActive = selected.key === item.key

              return (
                <TabsTrigger
                  key={item.key}
                  value={item.key}
                  title={item.key}
                  className={cn(
                    'max-w-64 flex-none text-xs min-w-32',
                    !item.config && 'border-dashed border-muted-foreground/40 text-muted-foreground',
                    isActive ? 'bg-primary! text-primary-foreground' : ''
                  )}
                >
                  {item.icon}
                  <span className={cn('truncate', item.mono && label === item.label && 'font-mono')}>{label}</span>
                  {disambiguator && (
                    <span className={cn('shrink-0 opacity-70', item.mono && 'font-mono')}>{disambiguator}</span>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
      )}

      <TabsContent value={selected.key} className={cn('flex min-w-0 flex-col', contentClassName)}>
        {children(selected)}
      </TabsContent>

      {footer}
    </Tabs>
  )
}
