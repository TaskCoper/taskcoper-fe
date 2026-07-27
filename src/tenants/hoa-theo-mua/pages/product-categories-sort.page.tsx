import { customCollisionDetection } from '@/components/dnd/collision-detection'
import { useDndSensors } from '@/components/dnd/use-dnd-sensors'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { defaultDropAnimation, DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FolderTreeIcon } from 'lucide-react'
import SortableCategoryNode from '../features/categories/components/sortable-category-node'
import { useCategorySortDnd } from '../features/categories/hooks/use-category-sort-dnd'
import { useGetSortableCategories } from '../features/categories/hooks/use-get-sortable-categories'

const CATEGORY_PREFIX = 'productCategories' as const

export default function ProductCategoriesSortPage() {
  const { t } = useTenantTranslation()
  const sensors = useDndSensors()

  const { sortableCategories, isLoadingSortableCategories } = useGetSortableCategories()

  const { roots, rootIds, activeNode, isReorderingCategory, onDragStart, onDragOver, onDragEnd } = useCategorySortDnd({
    categories: sortableCategories
  })

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div>
          <p className='text-2xl font-bold'>{t(`${CATEGORY_PREFIX}.sort.title`)}</p>
          <p className='text-sm text-muted-foreground'>{t(`${CATEGORY_PREFIX}.sort.description`)}</p>
        </div>

        {isLoadingSortableCategories ? (
          <div className='space-y-4'>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className='h-40 w-full rounded-xl' />
            ))}
          </div>
        ) : roots.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center'>
            <FolderTreeIcon className='size-10 text-muted-foreground/50' />
            <p className='text-sm text-muted-foreground'>{t(`${CATEGORY_PREFIX}.sort.empty`)}</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
              <div className='space-y-4'>
                {roots.map((root) => (
                  <SortableCategoryNode
                    key={root.categoryId}
                    category={root}
                    depth={0}
                    t={t}
                    isDragActive={!!activeNode}
                    disabled={isReorderingCategory}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={defaultDropAnimation}>
              {activeNode ? <SortableCategoryNode isOverlay category={activeNode} depth={0} t={t} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}
