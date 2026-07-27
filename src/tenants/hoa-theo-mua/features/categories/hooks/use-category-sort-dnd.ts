import { calculateReorderPosition } from '@/shared/utils'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { SortableCategory } from '../types'
import { useReorderCategory } from './use-reorder-category'

// Same key the board's query is registered under — the optimistic writes below target that cache
// entry directly, and `useReorderCategory` invalidates the `categoryProducts` prefix on settle.
const SORTABLE_CATEGORIES_QUERY_KEY = ['categoryProducts', 'sortable']

interface NodeLocation {
  /** The (mutable) array that currently holds the node — the tree is cloned before locating. */
  siblings: SortableCategory[]
  index: number
  node: SortableCategory
  /** The parent category's id, or `null` when the node sits at the root level. */
  parentId: string | null
}

/** Deep-clone the tree so optimistic cache writes never mutate the arrays held by React Query. */
const cloneTree = (nodes: SortableCategory[]): SortableCategory[] =>
  nodes.map((node) => ({ ...node, children: cloneTree(node.children ?? []) }))

/** Depth-first search for a node anywhere in the tree, regardless of nesting depth. */
const locateNode = (nodes: SortableCategory[], id: string, parentId: string | null = null): NodeLocation | null => {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index]
    if (node.categoryId === id) return { siblings: nodes, index, node, parentId }
    const found = locateNode(node.children ?? [], id, node.categoryId)
    if (found) return found
  }
  return null
}

/** True when `id` is the node itself or lives in its subtree — used to forbid dropping a node into
 *  its own descendant, which would otherwise detach the whole branch from the tree. */
const isSelfOrDescendant = (node: SortableCategory, id: string): boolean =>
  node.categoryId === id || (node.children ?? []).some((child) => isSelfOrDescendant(child, id))

interface UseCategorySortDndProps {
  categories: SortableCategory[] | undefined
}

/**
 * Drag-and-drop engine for the category sort board. The sort tree can be nested arbitrarily deep:
 * every category is a uniform, draggable node. `onDragOver` rewrites the reordered/reparented tree
 * straight into the query cache for instant feedback (working at any depth), and `onDragEnd`
 * computes the dropped node's new position among its final siblings and persists it.
 */
export const useCategorySortDnd = ({ categories }: UseCategorySortDndProps) => {
  const queryClient = useQueryClient()
  const { reorderCategory, isReorderingCategory } = useReorderCategory()

  const [activeNode, setActiveNode] = useState<SortableCategory | null>(null)

  const roots = useMemo(() => categories ?? [], [categories])
  const rootIds = useMemo(() => roots.map((root) => root.categoryId), [roots])

  const onDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current
    if (data?.type === 'CategoryNode') setActiveNode(data.category as SortableCategory)
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overData = over.data.current
    if (!overData) return

    // Over another node — become its sibling at its slot (reorder within, or reparent across, a parent).
    if (overData.type === 'CategoryNode') {
      const overId = String(over.id)
      if (activeId === overId) return

      queryClient.setQueryData<SortableCategory[]>(SORTABLE_CATEGORIES_QUERY_KEY, (old) => {
        if (!old) return old
        const tree = cloneTree(old)
        const from = locateNode(tree, activeId)
        const to = locateNode(tree, overId)
        if (!from || !to) return old
        if (isSelfOrDescendant(from.node, overId)) return old

        const [moved] = from.siblings.splice(from.index, 1)
        if (from.parentId === to.parentId) {
          // Same parent → pure reorder (arrayMove semantics via splice).
          from.siblings.splice(to.index, 0, moved)
        } else {
          // Different parent → drop into the over node's slot and adopt its parent.
          to.siblings.splice(to.index, 0, { ...moved, parentId: to.parentId })
        }
        return tree
      })
      return
    }

    // Over a childless node's drop zone — nest the active node as that node's child.
    if (overData.type === 'CategoryDropZone') {
      const containerId = String(overData.containerId)
      if (containerId === activeId) return

      queryClient.setQueryData<SortableCategory[]>(SORTABLE_CATEGORIES_QUERY_KEY, (old) => {
        if (!old) return old
        const tree = cloneTree(old)
        const from = locateNode(tree, activeId)
        const container = locateNode(tree, containerId)
        if (!from || !container) return old
        if (isSelfOrDescendant(from.node, containerId)) return old
        if (from.parentId === containerId) return old

        const [moved] = from.siblings.splice(from.index, 1)
        container.node.children = [...(container.node.children ?? []), { ...moved, parentId: containerId }]
        return tree
      })
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const original = activeNode
    setActiveNode(null)
    if (!original) return

    const activeId = String(event.active.id)
    const tree = queryClient.getQueryData<SortableCategory[]>(SORTABLE_CATEGORIES_QUERY_KEY) ?? categories ?? []
    const located = locateNode(tree, activeId)
    if (!located) return

    // Position is computed among the destination siblings (the node's final resting level).
    const newPosition = calculateReorderPosition(
      located.siblings.map((sibling) => ({ position: sibling.position ?? 0 })),
      located.index
    )

    const isReparented = located.parentId !== original.parentId
    if (!isReparented && newPosition === original.position) return

    reorderCategory({ category: original, position: newPosition, parentId: located.parentId })
  }

  return {
    roots,
    rootIds,
    activeNode,
    isReorderingCategory,
    onDragStart,
    onDragOver,
    onDragEnd
  }
}
