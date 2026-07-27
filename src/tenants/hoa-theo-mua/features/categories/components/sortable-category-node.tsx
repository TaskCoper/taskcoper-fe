import { Badge } from '@/components/ui/badge'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon } from 'lucide-react'
import { useMemo } from 'react'
import type { CategoryDropZoneData, CategoryNodeDragData, SortableCategory } from '../types'
import { CategoryTypeBadge, CategoryWindow } from './category-product-badges'

const CATEGORY_I18N_PREFIX = 'productCategories' as const

function NodeDropZone({ containerId, t }: { containerId: string; t: TenantT }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `dropzone:${containerId}`,
    data: { type: 'CategoryDropZone', containerId } satisfies CategoryDropZoneData
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center justify-center rounded-lg border border-dashed py-4 text-center text-xs text-muted-foreground transition-colors',
        isOver && 'border-primary bg-primary/5 text-primary'
      )}
    >
      {t(`${CATEGORY_I18N_PREFIX}.sort.dropInto`)}
    </div>
  )
}

interface SortableCategoryNodeProps {
  category: SortableCategory
  depth: number
  t: TenantT
  /** Whether a drag is currently in progress — childless nodes only expose a drop zone while dragging. */
  isDragActive?: boolean
  disabled?: boolean
  isOverlay?: boolean
}

/**
 * A single node in the category sort tree, rendered recursively so the board supports arbitrarily
 * deep nesting. Each node is draggable via its grip (reorders among siblings / reparents), and hosts
 * its own `SortableContext` for its children plus a drop zone when it is empty.
 */
export default function SortableCategoryNode({
  category,
  depth,
  t,
  isDragActive = false,
  disabled,
  isOverlay = false
}: SortableCategoryNodeProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: category.categoryId,
    data: { type: 'CategoryNode', category } satisfies CategoryNodeDragData,
    attributes: { roleDescription: 'CategoryNode' },
    disabled
  })

  const children = useMemo(() => category.children ?? [], [category.children])
  const childIds = useMemo(() => children.map((child) => child.categoryId), [children])

  const name = category.name?.trim()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  const header = (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        aria-label={t(`${CATEGORY_I18N_PREFIX}.sort.reorder`)}
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground/60',
          'touch-none hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          isOverlay ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        )}
        {...(isOverlay ? {} : { ...attributes, ...listeners })}
      >
        <GripVerticalIcon className='size-4' />
      </button>

      <p
        className={cn('truncate font-medium', depth === 0 && 'font-semibold', !name && 'italic text-muted-foreground')}
        title={name || undefined}
      >
        {name || t(`${CATEGORY_I18N_PREFIX}.column.noName`)}
      </p>

      <CategoryTypeBadge type={category.type} t={t} />

      <div className='ml-auto flex shrink-0 items-center gap-2'>
        <CategoryWindow category={category} t={t} />
        {children.length > 0 && (
          <Badge variant='secondary' className='tabular-nums'>
            {t(`${CATEGORY_I18N_PREFIX}.sort.itemCount`, { count: children.length })}
          </Badge>
        )}
      </div>
    </div>
  )

  if (isOverlay) {
    return <div className='rounded-xl bg-card p-3 shadow-lg ring-2 ring-primary ring-offset-2'>{header}</div>
  }

  const showDropZone = isDragActive && children.length === 0

  return (
    <div ref={setNodeRef} style={style} className={cn('rounded-xl border bg-card', depth === 0 ? 'p-4' : 'p-3')}>
      {header}

      {(children.length > 0 || showDropZone) && (
        <div className='mt-3 space-y-2 border-l border-dashed pl-3'>
          <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
            {children.map((child) => (
              <SortableCategoryNode
                key={child.categoryId}
                category={child}
                depth={depth + 1}
                t={t}
                isDragActive={isDragActive}
                disabled={disabled}
              />
            ))}
          </SortableContext>

          {showDropZone && <NodeDropZone containerId={category.categoryId} t={t} />}
        </div>
      )}
    </div>
  )
}
