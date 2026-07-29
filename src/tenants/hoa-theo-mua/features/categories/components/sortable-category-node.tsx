import { Badge } from '@/components/ui/badge'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FolderOpenIcon, GripVerticalIcon, TagIcon } from 'lucide-react'
import { type CategoryNodeDragData, type SortableCategory } from '../types'
import { CategoryWindow } from './category-product-badges'

const CATEGORY_I18N_PREFIX = 'productCategories' as const

interface SortableCategoryNodeProps {
  category: SortableCategory
  /** Effective nesting level — drives both indentation and styling. While a row is dragged this is
   *  the *projected* depth, so the placeholder and overlay preview the level it will drop into. */
  depth: number
  indentationWidth: number
  t: TenantT
  disabled?: boolean
  isOverlay?: boolean
  /** Whether this node is the last child among its siblings — decides the connector's shape (└ vs ├). */
  isLast?: boolean
  /** For each ancestor depth, whether that ancestor's guide column still has a line running through it. */
  ancestorLines?: boolean[]
}

export default function SortableCategoryNode({
  category,
  depth,
  indentationWidth,
  t,
  disabled,
  isOverlay = false,
  isLast = false,
  ancestorLines = []
}: SortableCategoryNodeProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: category.categoryId,
    data: { type: 'CategoryNode', category } satisfies CategoryNodeDragData,
    attributes: { roleDescription: 'CategoryNode' },
    disabled
  })

  const childCount = category.children?.length ?? 0
  const hasChildren = childCount > 0
  const name = category.name?.trim()

  const icon = hasChildren ? (
    <FolderOpenIcon className={cn('size-4 shrink-0 text-muted-foreground', depth === 0 ? 'text-primary' : '')} />
  ) : (
    <TagIcon className={cn('size-4 shrink-0 text-muted-foreground', depth === 0 ? 'text-primary' : '')} />
  )

  const card = (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border bg-card p-2',
        isOverlay && 'shadow-lg ring-2 ring-primary ring-offset-2',
        !isOverlay && isDragging && 'opacity-40'
      )}
    >
      <button
        type='button'
        aria-label={t(`${CATEGORY_I18N_PREFIX}.sort.reorder`)}
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground/60',
          'touch-none hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
        )}
        {...(isOverlay ? {} : { ...attributes, ...listeners })}
      >
        <GripVerticalIcon className='size-4' />
      </button>

      {icon}

      <p
        className={cn(
          'truncate font-medium',
          depth === 0 && 'font-semibold text-primary',
          !name && 'italic text-muted-foreground'
        )}
        title={name || undefined}
      >
        {name || t(`${CATEGORY_I18N_PREFIX}.column.noName`)}
      </p>

      <div className='ml-auto flex shrink-0 items-center gap-2'>
        <CategoryWindow category={category} t={t} />

        {childCount > 0 && (
          <Badge variant='secondary' className='tabular-nums'>
            {t(`${CATEGORY_I18N_PREFIX}.sort.itemCount`, { count: childCount })}
          </Badge>
        )}
      </div>
    </div>
  )

  if (isOverlay) {
    return <div style={{ paddingLeft: depth * indentationWidth }}>{card}</div>
  }

  const guides = (
    <>
      {ancestorLines.map((showLine, index) => (
        <div key={index} style={{ width: indentationWidth }} className='relative shrink-0'>
          {showLine && <span className='absolute -bottom-1 left-1/2 top-0 w-px -translate-x-1/2 bg-border' />}
        </div>
      ))}
      {depth > 0 && (
        <div style={{ width: indentationWidth }} className='relative shrink-0'>
          <span
            className={cn('absolute left-1/2 top-0 w-px -translate-x-1/2 bg-border', isLast ? 'h-1/2' : '-bottom-1')}
          />
          <span className='absolute left-1/2 top-1/2 h-px w-1/2 -translate-y-1/2 bg-border' />
        </div>
      )}
    </>
  )

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('flex items-stretch', isDragging && 'relative z-10')}
    >
      {isDragging ? <div style={{ width: depth * indentationWidth }} className='shrink-0' /> : guides}
      <div className='min-w-0 flex-1'>{card}</div>
    </div>
  )
}
