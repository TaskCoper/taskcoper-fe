import { useDndSensors } from '@/components/dnd/use-dnd-sensors'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { POSITION_GAP } from '@/shared/constants'
import { DndContext, DragOverlay, closestCenter, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { PackageOpenIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import PinnedCategoryFilter from '../features/products/components/pinned-category-filter'
import { PinnedProductCard } from '../features/products/components/pinned-product-card'
import { SortablePinnedProductCard } from '../features/products/components/sortable-pinned-product-card'
import { useGetPinnedProducts } from '../features/products/hooks/use-get-pinned-products'
import { usePinProduct } from '../features/products/hooks/use-pin-product'
import { useReorderPinnedProducts } from '../features/products/hooks/use-reorder-pinned-products'
import { productKeys } from '../features/products/query-keys'
import type { PinnedProduct } from '../features/products/types'

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'

export default function PinnedProductsPage() {
  const { t } = useTenantTranslation()
  const sensors = useDndSensors()
  const queryClient = useQueryClient()

  const [categoryId, setCategoryId] = useQueryState('categoryId', parseAsString)

  const scopedCategoryId = categoryId ?? undefined
  const queryKey = productKeys.pinned(scopedCategoryId)

  const { pinnedProducts, isGettingPinnedProducts } = useGetPinnedProducts(scopedCategoryId)
  const { reorderPinnedProducts, isReorderingPinnedProducts } = useReorderPinnedProducts(scopedCategoryId)
  const { pinProduct, pinningProductId, isPinningProduct } = usePinProduct(scopedCategoryId)

  const isBusy = isReorderingPinnedProducts || isPinningProduct

  const items = useMemo(() => pinnedProducts ?? [], [pinnedProducts])
  const [activeId, setActiveId] = useState<string | null>(null)

  const itemIds = useMemo(() => items.map((product) => product.productId), [items])
  const activeIndex = useMemo(() => items.findIndex((product) => product.productId === activeId), [items, activeId])
  const activeProduct = activeIndex === -1 ? null : items[activeIndex]

  const handleUnpin = (product: PinnedProduct) => {
    queryClient.setQueryData(queryKey, (old?: PinnedProduct[]) =>
      old?.filter((item) => item.productId !== product.productId)
    )
    pinProduct({ body: { productId: product.productId, isPin: false } })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)

    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((product) => product.productId === active.id)
    const newIndex = items.findIndex((product) => product.productId === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(items, oldIndex, newIndex)
    const renumbered = reordered.map((product, index) => ({ ...product, position: (index + 1) * POSITION_GAP }))
    queryClient.setQueryData(queryKey, renumbered)

    const updates = renumbered
      .filter((product, index) => product.position !== reordered[index].position)
      .map((product) => ({ id: product.productId, position: product.position }))

    if (updates.length > 0) {
      reorderPinnedProducts(updates)
    }
  }

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6 mx-auto max-w-7xl'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-2xl font-bold'>{t('products.pinned.title')}</p>
            <p className='text-sm text-muted-foreground'>{t('products.pinned.description')}</p>
          </div>

          <PinnedCategoryFilter value={categoryId} onChange={setCategoryId} disabled={isBusy} />
        </div>

        {isGettingPinnedProducts ? (
          <div className={GRID_CLASS}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className='aspect-3/4 w-full rounded-xl' />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center'>
            <PackageOpenIcon className='size-10 text-muted-foreground/50' />
            <p className='text-sm text-muted-foreground'>{t('products.pinned.empty')}</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={itemIds} strategy={rectSortingStrategy}>
              <div className={GRID_CLASS}>
                {items.map((product) => (
                  <SortablePinnedProductCard
                    key={product.productId}
                    product={product}
                    t={t}
                    onUnpin={handleUnpin}
                    isUnpinning={pinningProductId === product.productId}
                    isBusy={isBusy}
                    disabled={isBusy}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeProduct ? <PinnedProductCard product={activeProduct} t={t} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}
