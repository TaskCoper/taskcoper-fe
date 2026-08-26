import { useDndSensors } from '@/components/dnd/use-dnd-sensors'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs'
import { Fragment, useMemo, useState } from 'react'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { useGetSortableCategories } from '../features/categories/hooks/use-get-sortable-categories'
import { locateNode } from '../features/categories/tree-utils'
import { parseCategoryMetadata } from '../features/categories/types'
import AddPinnedProductsSheet from '../features/products/components/add-pinned-products-sheet'
import { PinnedBoardToolbar } from '../features/products/components/pinned-board-toolbar'
import { PinnedFoldDivider } from '../features/products/components/pinned-fold-divider'
import { PinnedProductActionsMenu } from '../features/products/components/pinned-product-actions-menu'
import { PinnedProductCard, type PinnedBoardView } from '../features/products/components/pinned-product-card'
import { PinnedProductsEmptyState } from '../features/products/components/pinned-products-empty-state'
import { SortablePinnedProductCard } from '../features/products/components/sortable-pinned-product-card'
import { usePinnedBoard } from '../features/products/hooks/use-pinned-board'

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'
const LIST_CLASS = 'flex flex-col gap-2'
const VIEWS = ['grid', 'list'] as const

export default function PinnedProductsPage() {
  const { t } = useTenantTranslation()
  const sensors = useDndSensors()

  const [categoryId, setCategoryId] = useQueryState('categoryId', parseAsString)
  const [view, setView] = useQueryState('view', parseAsStringLiteral(VIEWS).withDefault('grid'))
  const [isAddOpen, setIsAddOpen] = useState(false)

  const scopedCategoryId = categoryId ?? undefined
  const board = usePinnedBoard(scopedCategoryId)

  const { sortableCategories, isLoadingSortableCategories } = useGetSortableCategories()

  const scope = useMemo(
    () => (categoryId ? locateNode(sortableCategories, categoryId) : null),
    [sortableCategories, categoryId]
  )

  // The storefront renders each category's products as a fixed `rows × cols` grid, so anything past
  // that count is pinned but never seen. No equivalent config exists for the homepage list, so the
  // global scope gets no divider rather than a guessed one.
  const foldCount = useMemo(() => {
    if (!scope) return null

    const { rows, cols } = parseCategoryMetadata(scope.node.metaData)
    if (!rows || !cols) return null

    const count = rows * cols
    return count > 0 ? count : null
  }, [scope])

  const pinnedIds = useMemo(() => new Set(board.items.map((product) => product.productId)), [board.items])

  const productHref = (productId: string) => `/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${productId}`

  const renderActions = (productId: string, index: number) => (
    <PinnedProductActionsMenu
      t={t}
      index={index}
      total={board.totalCount}
      productHref={productHref(productId)}
      onMoveToIndex={(toIndex) => board.moveToIndex(productId, toIndex)}
      onUnpin={() => {
        const product = board.items.find((item) => item.productId === productId)
        if (product) board.unpin(product)
      }}
    />
  )

  const containerClass = view === 'list' ? LIST_CLASS : GRID_CLASS

  const renderBoard = () => {
    if (board.isError) {
      return (
        <PinnedProductsEmptyState
          t={t}
          variant='error'
          onAddProducts={() => setIsAddOpen(true)}
          onClearSearch={() => board.setSearch('')}
          onRetry={() => board.refetch()}
        />
      )
    }

    if (board.isLoading) {
      return (
        <div className={containerClass}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className={cn('w-full rounded-xl', view === 'list' ? 'h-20' : 'aspect-3/4')} />
          ))}
        </div>
      )
    }

    if (board.visibleItems.length === 0) {
      return (
        <PinnedProductsEmptyState
          t={t}
          variant={board.isFiltering ? 'filtered' : 'empty'}
          search={board.search}
          onAddProducts={() => setIsAddOpen(true)}
          onClearSearch={() => board.setSearch('')}
          onRetry={() => board.refetch()}
        />
      )
    }

    // While a search is active the visible order no longer matches the real one, so dragging would
    // compute meaningless indices. Render plain cards instead of disabled sortables - a grab cursor
    // that does nothing is worse than no grab cursor. The ⋮ move actions stay live throughout,
    // because they address absolute positions in the full list.
    if (board.isFiltering) {
      return (
        <div className={containerClass}>
          {board.visibleItems.map((product) => {
            const index = board.items.findIndex((item) => item.productId === product.productId)

            return (
              <PinnedProductCard
                key={product.productId}
                product={product}
                t={t}
                position={index + 1}
                href={productHref(product.productId)}
                view={view}
                isPending={board.pendingIds.has(product.productId)}
                isBeyondFold={foldCount != null && index >= foldCount}
                actions={renderActions(product.productId, index)}
              />
            )
          })}
        </div>
      )
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={board.onDragStart}
        onDragEnd={board.onDragEnd}
        onDragCancel={board.onDragCancel}
      >
        <SortableContext
          items={board.itemIds}
          strategy={view === 'list' ? verticalListSortingStrategy : rectSortingStrategy}
        >
          <div className={containerClass}>
            {board.items.map((product, index) => (
              <Fragment key={product.productId}>
                {/* Hidden mid-drag: the divider is a plain grid cell, not a sortable item, so its
                    presence throws off the rect math the sorting strategy uses to slide cards into
                    place, which reads as jank around the fold. */}
                {foldCount != null && index === foldCount && !board.activeId && (
                  <PinnedFoldDivider t={t} count={foldCount} />
                )}
                <SortablePinnedProductCard
                  product={product}
                  t={t}
                  position={index + 1}
                  href={productHref(product.productId)}
                  view={view}
                  isPending={board.pendingIds.has(product.productId)}
                  isBeyondFold={foldCount != null && index >= foldCount}
                  actions={renderActions(product.productId, index)}
                />
              </Fragment>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {board.activeProduct ? <PinnedProductCard product={board.activeProduct} t={t} view={view} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    )
  }

  return (
    <div className='h-full overflow-auto'>
      <div className='mx-auto max-w-7xl space-y-6 p-6'>
        <div>
          <p className='text-2xl font-bold'>{t('products.pinned.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('products.pinned.description')}</p>
        </div>

        <PinnedBoardToolbar
          t={t}
          categories={sortableCategories}
          isLoadingCategories={isLoadingSortableCategories}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          filteredCount={board.visibleItems.length}
          isFiltering={board.isFiltering}
          search={board.search}
          onSearchChange={board.setSearch}
          view={view as PinnedBoardView}
          onViewChange={setView}
          onAddProducts={() => setIsAddOpen(true)}
        />

        {renderBoard()}
      </div>

      <AddPinnedProductsSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        categoryId={scopedCategoryId}
        categoryName={scope?.node.name}
        pinnedIds={pinnedIds}
      />
    </div>
  )
}
