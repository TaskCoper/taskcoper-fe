import { useDndSensors } from '@/components/dnd/use-dnd-sensors'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { closestCenter, defaultDropAnimation, DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FolderTreeIcon } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import SortableCategoryNode from '../features/categories/components/sortable-category-node'
import { INDENTATION_WIDTH, useCategorySortDnd } from '../features/categories/hooks/use-category-sort-dnd'
import { useGetSortableCategories } from '../features/categories/hooks/use-get-sortable-categories'
import { CategoryProductPage, CategoryProductPageLabel } from '../features/categories/types'

const CATEGORY_PREFIX = 'productCategories' as const

export default function ProductCategoriesSortPage() {
  const { t } = useTenantTranslation()
  const sensors = useDndSensors()

  const [pageFilter, setPageFilter] = useQueryState(
    'categories_page',
    parseAsStringEnum<CategoryProductPage>(Object.values(CategoryProductPage)).withDefault(CategoryProductPage.Products)
  )

  const { sortableCategories, isLoadingSortableCategories } = useGetSortableCategories({ page: [pageFilter] })

  const {
    roots,
    flattenedItems,
    sortedIds,
    guidesById,
    projected,
    activeId,
    activeNode,
    isReorderingCategory,
    onDragStart,
    onDragMove,
    onDragOver,
    onDragEnd,
    onDragCancel
  } = useCategorySortDnd({ categories: sortableCategories })

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <p className='text-2xl font-bold'>{t(`${CATEGORY_PREFIX}.sort.title`)}</p>
            <p className='text-sm text-muted-foreground'>{t(`${CATEGORY_PREFIX}.sort.description`)}</p>
          </div>

          <Select value={pageFilter} onValueChange={(value) => setPageFilter(value as CategoryProductPage)}>
            <SelectTrigger className='w-full sm:w-56'>
              <SelectValue placeholder={t(`${CATEGORY_PREFIX}.sort.filterPlaceholder`)} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CategoryProductPage).map((page) => (
                <SelectItem key={page} value={page}>
                  {t(CategoryProductPageLabel[page])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoadingSortableCategories ? (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className='h-16 w-full rounded-xl' />
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
            collisionDetection={closestCenter}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
          >
            <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
              <div className='space-y-1'>
                {flattenedItems.map((item) => (
                  <SortableCategoryNode
                    key={item.categoryId}
                    category={item.category}
                    depth={item.categoryId === activeId && projected ? projected.depth : item.depth}
                    indentationWidth={INDENTATION_WIDTH}
                    t={t}
                    disabled={isReorderingCategory}
                    isLast={guidesById.get(item.categoryId)?.isLast}
                    ancestorLines={guidesById.get(item.categoryId)?.ancestorLines}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={defaultDropAnimation}>
              {activeNode ? (
                <SortableCategoryNode
                  isOverlay
                  category={activeNode}
                  depth={projected?.depth ?? 0}
                  indentationWidth={INDENTATION_WIDTH}
                  t={t}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}
