import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useMutationState, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { productKeys } from '../query-keys'
import { planMove, type PinnedReorderPlan, type PinnedScopeVariables } from '../reorder-utils'
import type { PinnedProduct } from '../types'
import { normalizeForSearch } from '../utils'
import { useGetPinnedProducts } from './use-get-pinned-products'
import { useReorderPinnedProducts } from './use-reorder-pinned-products'
import { useUnpinPinnedProduct } from './use-unpin-pinned-product'

const EMPTY_ITEMS: PinnedProduct[] = []

/**
 * Everything the pinned board needs to read and mutate one scope, so the page stays a layout file
 * and never touches the query cache directly.
 *
 * The two orderings it exposes are deliberately distinct: `items` is the real, full list that every
 * position is computed against, while `visibleItems` is only what the in-page search leaves on
 * screen. Reorder handlers resolve indices against `items` by id - resolving them against a filtered
 * array would silently move products to the wrong place.
 */
export const usePinnedBoard = (categoryId?: string) => {
  const queryClient = useQueryClient()
  const queryKey = productKeys.pinned(categoryId)

  const { pinnedProducts, isGettingPinnedProducts, isPinnedProductsError, refetchPinnedProducts } =
    useGetPinnedProducts(categoryId)

  const { reorderPinnedProducts } = useReorderPinnedProducts(categoryId)
  const { unpinPinnedProduct } = useUnpinPinnedProduct(categoryId)

  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const items = pinnedProducts ?? EMPTY_ITEMS

  const normalizedSearch = normalizeForSearch(search)
  const isFiltering = normalizedSearch.length > 0

  const visibleItems = useMemo(() => {
    if (!normalizedSearch) return items

    return items.filter((product) => {
      const name = normalizeForSearch(product.productName ?? '')
      const code = normalizeForSearch(product.productCode ?? '')

      return name.includes(normalizedSearch) || code.includes(normalizedSearch)
    })
  }, [items, normalizedSearch])

  // Read pending state out of the mutation cache rather than a single `isPending` flag: reorder,
  // unpin, restore and bulk-pin all share this scope's mutation key and several can be in flight at
  // once, so this marks exactly the affected cards instead of freezing the whole board.
  const pendingIdLists = useMutationState({
    filters: { mutationKey: productKeys.pinnedMutation(categoryId), status: 'pending' },
    select: (mutation) => (mutation.state.variables as PinnedScopeVariables | undefined)?.pendingIds ?? []
  })

  const pendingIds = useMemo(() => new Set(pendingIdLists.flat()), [pendingIdLists])

  const activeProduct = useMemo(
    () => items.find((product) => product.productId === activeId) ?? null,
    [items, activeId]
  )

  const itemIds = useMemo(() => items.map((product) => product.productId), [items])

  /**
   * Writes the plan into the cache synchronously - in the same call stack as the drag/menu event -
   * then hands it to the mutation to persist. A `useMutation`'s `onMutate` always fires a tick later
   * (see `useReorderPinnedProducts`), which on a drop renders one frame with the card back at its old
   * slot before it jumps to the new one; writing here, before `setActiveId(null)` even commits,
   * keeps the drag-end and the reorder in the same render.
   */
  const commitPlan = useCallback(
    (plan: PinnedReorderPlan) => {
      queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<PinnedProduct[]>(queryKey)
      queryClient.setQueryData<PinnedProduct[]>(queryKey, plan.items)
      reorderPinnedProducts(plan, previous)
    },
    [queryClient, queryKey, reorderPinnedProducts]
  )

  const moveToIndex = useCallback(
    (productId: string, toIndex: number) => {
      const fromIndex = items.findIndex((product) => product.productId === productId)
      if (fromIndex === -1) return

      const clamped = Math.max(0, Math.min(toIndex, items.length - 1))
      const plan = planMove(items, fromIndex, clamped)

      if (plan) {
        commitPlan(plan)
      }
    },
    [items, commitPlan]
  )

  const onDragStart = useCallback((event: DragStartEvent) => setActiveId(String(event.active.id)), [])
  const onDragCancel = useCallback(() => setActiveId(null), [])

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) {
        setActiveId(null)
        return
      }

      const fromIndex = items.findIndex((product) => product.productId === active.id)
      const toIndex = items.findIndex((product) => product.productId === over.id)
      if (fromIndex === -1 || toIndex === -1) {
        setActiveId(null)
        return
      }

      const plan = planMove(items, fromIndex, toIndex)
      // Commit the reorder *before* clearing the active id: dnd-kit resets the dragged card's
      // transform the moment `isDragging` goes false, so the new order has to already be in the
      // cache by then or the card renders one frame at its pre-drag slot.
      if (plan) commitPlan(plan)
      setActiveId(null)
    },
    [items, commitPlan]
  )

  return {
    items,
    itemIds,
    visibleItems,
    totalCount: items.length,
    isLoading: isGettingPinnedProducts,
    isError: isPinnedProductsError,
    refetch: refetchPinnedProducts,

    search,
    setSearch,
    isFiltering,

    pendingIds,
    activeId,
    activeProduct,

    onDragStart,
    onDragEnd,
    onDragCancel,
    moveToIndex,
    unpin: unpinPinnedProduct
  }
}
