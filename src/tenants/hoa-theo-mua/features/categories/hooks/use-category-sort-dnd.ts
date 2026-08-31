import { calculateReorderPosition } from '@/shared/utils'
import type { DragEndEvent, DragMoveEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { buildTree, computeTreeGuides, flattenTree, getProjection, locateNode, removeChildrenOf } from '../tree-utils'
import type { CategoryProductPage, SortableCategory } from '../types'
import { useReorderCategory } from './use-reorder-category'

/** Horizontal distance (px) the pointer must travel to nest/unnest by one level while dragging. */
export const INDENTATION_WIDTH = 32

interface UseCategorySortDndProps {
  categories: SortableCategory[] | undefined
  /** Must match the `page` filter passed to `useGetSortableCategories` so the optimistic write below
   *  lands on the exact cache entry the page reads from - see `use-get-sortable-categories.ts`. */
  page?: CategoryProductPage[]
}

/**
 * Drag-and-drop engine for the category sort board. The tree can be nested arbitrarily deep, so it
 * is rendered as a single flat list: a plain vertical sort picks the drop *slot* (`over`), while the
 * pointer's horizontal offset picks the *depth/parent* via `getProjection`. On drop we splice the
 * dragged row into its projected slot, rebuild the nested tree, compute its position among its new
 * siblings, write it into the cache for instant feedback, and persist.
 */
export const useCategorySortDnd = ({ categories, page }: UseCategorySortDndProps) => {
  const queryClient = useQueryClient()
  const { reorderCategory, isReorderingCategory } = useReorderCategory()

  // Same key `useGetSortableCategories` registers its query under - the optimistic write below
  // targets that cache entry directly, and `useReorderCategory` invalidates the `categoryProducts`
  // prefix on settle.
  const sortableCategoriesQueryKey = ['categoryProducts', 'sortable', page]

  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [offsetLeft, setOffsetLeft] = useState(0)

  const roots = useMemo(() => categories ?? [], [categories])

  // Full flatten - used verbatim when committing a drop so a moved node keeps its subtree.
  const flattenedTree = useMemo(() => flattenTree(roots), [roots])

  // While dragging, collapse the active node's subtree so projection neighbours reflect where the
  // branch will actually land (and its own descendants can't become drop targets).
  const flattenedItems = useMemo(
    () => (activeId ? removeChildrenOf(flattenedTree, [activeId]) : flattenedTree),
    [activeId, flattenedTree]
  )

  const sortedIds = useMemo(() => flattenedItems.map((item) => item.categoryId), [flattenedItems])

  // Guide lines are derived from the resting (undragged) tree shape, so they stay stable while a
  // node's own row is being dragged around - only its indentation changes live, see the node component.
  const guidesById = useMemo(() => new Map(computeTreeGuides(roots).map((guide) => [guide.categoryId, guide])), [roots])

  const projected =
    activeId && overId ? getProjection(flattenedItems, activeId, overId, offsetLeft, INDENTATION_WIDTH) : null

  const activeNode = useMemo(
    () => (activeId ? (flattenedTree.find((item) => item.categoryId === activeId)?.category ?? null) : null),
    [activeId, flattenedTree]
  )

  const resetState = () => {
    setActiveId(null)
    setOverId(null)
    setOffsetLeft(0)
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    const id = String(active.id)
    setActiveId(id)
    setOverId(id)
  }

  const onDragMove = ({ delta }: DragMoveEvent) => setOffsetLeft(delta.x)

  const onDragOver = ({ over }: DragOverEvent) => setOverId(over ? String(over.id) : null)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const original = activeNode
    const target = projected
    resetState()
    if (!original || !over || !target) return

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)

    // Rebuild from the full flatten (descendants included) so the moved node carries its subtree.
    const clonedItems = flattenTree(roots)
    const activeIndex = clonedItems.findIndex((item) => item.categoryId === activeIdStr)
    const overIndex = clonedItems.findIndex((item) => item.categoryId === overIdStr)
    if (activeIndex === -1 || overIndex === -1) return

    clonedItems[activeIndex] = { ...clonedItems[activeIndex], depth: target.depth, parentId: target.parentId }
    const newTree = buildTree(arrayMove(clonedItems, activeIndex, overIndex))

    const located = locateNode(newTree, activeIdStr)
    if (!located) return

    const newPosition = calculateReorderPosition(
      located.siblings.map((sibling) => ({ position: sibling.position ?? 0 })),
      located.index
    )

    const isReparented = target.parentId !== original.parentId
    if (!isReparented && newPosition === original.position) return

    // Reflect the new slot/level immediately, then persist (settle re-syncs from the server).
    located.node.position = newPosition
    queryClient.setQueryData<SortableCategory[]>(sortableCategoriesQueryKey, newTree)

    reorderCategory({ category: original, position: newPosition, parentId: target.parentId, page })
  }

  const onDragCancel = () => resetState()

  return {
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
  }
}
