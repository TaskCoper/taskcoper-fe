import { Skeleton } from '@/components/ui/skeleton'
import { useDndSensors } from '@/components/dnd/use-dnd-sensors'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { DndContext, DragOverlay, closestCenter, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { POSITION_GAP } from '@/shared/constants'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { PackageOpenIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PinnedProductCard } from '../features/products/components/pinned-product-card'
import { SortablePinnedProductCard } from '../features/products/components/sortable-pinned-product-card'
import { useGetPinnedProducts } from '../features/products/hooks/use-get-pinned-products'
import { usePinProduct } from '../features/products/hooks/use-pin-product'
import { useReorderPinnedProducts } from '../features/products/hooks/use-reorder-pinned-products'
import type { PinnedProduct } from '../features/products/types'

// 5 cards per row on wide screens, degrading gracefully on smaller viewports.
const GRID_CLASS = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'

/** Ascending by `position`; unset positions sink to the end while preserving server order (stable sort). */
const byPositionAsc = (a: PinnedProduct, b: PinnedProduct) =>
  (a.position ?? Number.POSITIVE_INFINITY) - (b.position ?? Number.POSITIVE_INFINITY)

/** Sort a pinned list into the same position order the server will return after a refetch. */
const sortByPosition = (products: PinnedProduct[]) => [...products].sort(byPositionAsc)

export default function PinnedProductsPage() {
  const { t } = useTenantTranslation()
  const sensors = useDndSensors()

  const { pinnedProducts, isGettingPinnedProducts } = useGetPinnedProducts()
  const { reorderPinnedProducts, isReorderingPinnedProducts } = useReorderPinnedProducts()
  const { pinProduct, pinningProductId, isPinningProduct } = usePinProduct()

  // Any drag-persist or unpin freezes dragging and every card's unpin button until it settles.
  const isBusy = isReorderingPinnedProducts || isPinningProduct

  // Local mirror of the server order so drag reordering is instant. Re-synced during render
  // whenever the query returns a new reference (e.g. after a move settles) — the React-endorsed
  // "adjust state while rendering" pattern, which avoids a cascading setState-in-effect.
  const [items, setItems] = useState<PinnedProduct[]>(() => sortByPosition(pinnedProducts ?? []))
  const [syncedProducts, setSyncedProducts] = useState(pinnedProducts)
  const [activeId, setActiveId] = useState<string | null>(null)

  if (pinnedProducts !== syncedProducts) {
    setSyncedProducts(pinnedProducts)
    setItems(sortByPosition(pinnedProducts ?? []))
  }

  const itemIds = useMemo(() => items.map((product) => product.productId), [items])
  const activeIndex = useMemo(() => items.findIndex((product) => product.productId === activeId), [items, activeId])
  const activeProduct = activeIndex === -1 ? null : items[activeIndex]

  const handleUnpin = (product: PinnedProduct) => {
    // Optimistically drop it from the grid; the mutation's invalidation re-syncs on settle.
    setItems((current) => current.filter((item) => item.productId !== product.productId))
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

    // Re-number the whole reordered list to clean, evenly-spaced positions. The server orders by the
    // `position` field, but that data can contain duplicates (many items share INITIAL_POSITION), and
    // a fractional midpoint can't produce a distinct value between two equal positions at this
    // magnitude. Assigning fresh gapped positions keeps ordering unambiguous; we persist only the
    // cards whose position actually changed (the first drag repairs every degenerate position).
    const reordered = arrayMove(items, oldIndex, newIndex)
    const renumbered = reordered.map((product, index) => ({ ...product, position: (index + 1) * POSITION_GAP }))
    setItems(renumbered)

    const updates = renumbered
      .filter((product, index) => product.position !== reordered[index].position)
      .map((product) => ({ id: product.productId, position: product.position }))

    if (updates.length > 0) reorderPinnedProducts(updates)
  }

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div>
          <p className='text-2xl font-bold'>{t('products.pinned.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('products.pinned.description')}</p>
        </div>

        {isGettingPinnedProducts ? (
          <div className={GRID_CLASS}>
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className='aspect-[3/4] w-full rounded-xl' />
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
                {items.map((product, index) => (
                  <SortablePinnedProductCard
                    key={product.productId}
                    product={product}
                    t={t}
                    onUnpin={handleUnpin}
                    isUnpinning={pinningProductId === product.productId}
                    isBusy={isBusy}
                    disabled={isBusy}
                    position={index + 1}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeProduct ? (
                <PinnedProductCard product={activeProduct} t={t} isOverlay position={activeIndex + 1} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}
