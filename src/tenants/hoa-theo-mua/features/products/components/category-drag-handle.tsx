import { useDataTableRowDrag } from '@/components/data-table/use-data-table-row-drag'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { GripVerticalIcon } from 'lucide-react'

const CATEGORY_I18N_PREFIX = 'productCategories' as const

/**
 * Grip handle for reordering child categories. Only child rows are made draggable by the page,
 * so `useDataTableRowDrag` is null for top-level rows and we render nothing (reorder is children-only).
 */
export function CategoryDragHandle({ t }: { t: TenantT }) {
  const drag = useDataTableRowDrag()

  if (!drag) return null

  return (
    <button
      type='button'
      aria-label={t(`${CATEGORY_I18N_PREFIX}.action.reorder`)}
      className={cn(
        'flex size-6 items-center justify-center rounded text-muted-foreground/60 hover:text-muted-foreground',
        'touch-none focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring',
        drag.isDragging ? 'cursor-grabbing' : 'cursor-grab'
      )}
      {...drag.attributes}
      {...drag.listeners}
    >
      <GripVerticalIcon className='size-4' />
    </button>
  )
}
