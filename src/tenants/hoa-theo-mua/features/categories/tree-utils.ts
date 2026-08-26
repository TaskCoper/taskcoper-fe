import { arrayMove } from '@dnd-kit/sortable'
import type { SortableCategory } from './types'

/**
 * Helpers for the category sort board. The board renders the arbitrarily-deep category tree as a
 * single *flat* list (one `SortableContext`), which is the only way to get reliable collision
 * detection and smooth cross-level dragging regardless of nesting depth: nested droppables make the
 * pointer land inside every ancestor at once, so the drop target is ambiguous. Instead we flatten
 * the tree, let a plain vertical sort decide the *slot*, and derive the target *depth/parent* from
 * how far the pointer has been dragged horizontally (see `getProjection`).
 */

export interface FlattenedCategory {
  categoryId: string
  category: SortableCategory
  parentId: string | null
  depth: number
  /** Index among its siblings in the source tree - unused by the sort, kept for completeness. */
  index: number
}

/** Depth-first flatten of the tree into visual (top-to-bottom) order. */
export const flattenTree = (
  nodes: SortableCategory[],
  parentId: string | null = null,
  depth = 0
): FlattenedCategory[] =>
  nodes.flatMap((node, index) => [
    { categoryId: node.categoryId, category: node, parentId, depth, index },
    ...flattenTree(node.children ?? [], node.categoryId, depth + 1)
  ])

/**
 * Drop every descendant of the given ids out of the flat list. Used while dragging so the moving
 * branch collapses to a single row - this keeps the projection's neighbour lookups (and the depth
 * range they allow) honest, and makes it impossible to drop a node into its own subtree.
 */
export const removeChildrenOf = (items: FlattenedCategory[], ids: string[]): FlattenedCategory[] => {
  const excludeParentIds = new Set(ids)

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.has(item.parentId)) {
      if ((item.category.children?.length ?? 0) > 0) excludeParentIds.add(item.categoryId)
      return false
    }
    return true
  })
}

export interface Projection {
  depth: number
  maxDepth: number
  minDepth: number
  parentId: string | null
}

const getDragDepth = (offset: number, indentationWidth: number) => Math.round(offset / indentationWidth)

/**
 * Given where the dragged row currently sits (`overId`) and how far it has been dragged sideways
 * (`dragOffset`), work out the depth it would land at and which category becomes its parent. The
 * depth is clamped to what the surrounding rows physically allow: you can nest at most one level
 * deeper than the row above, and no shallower than the row below.
 */
export const getProjection = (
  items: FlattenedCategory[],
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number
): Projection => {
  const overItemIndex = items.findIndex((item) => item.categoryId === overId)
  const activeItemIndex = items.findIndex((item) => item.categoryId === activeId)
  const activeItem = items[activeItemIndex]
  const newItems = arrayMove(items, activeItemIndex, overItemIndex)
  const previousItem = newItems[overItemIndex - 1]
  const nextItem = newItems[overItemIndex + 1]

  const projectedDepth = (activeItem?.depth ?? 0) + getDragDepth(dragOffset, indentationWidth)
  const maxDepth = previousItem ? previousItem.depth + 1 : 0
  const minDepth = nextItem ? nextItem.depth : 0
  const depth = Math.max(minDepth, Math.min(projectedDepth, maxDepth))

  const getParentId = (): string | null => {
    if (depth === 0 || !previousItem) return null
    if (depth === previousItem.depth) return previousItem.parentId
    if (depth > previousItem.depth) return previousItem.categoryId

    return (
      newItems
        .slice(0, overItemIndex)
        .reverse()
        .find((item) => item.depth === depth)?.parentId ?? null
    )
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() }
}

/**
 * Rebuild the nested tree from a flat list, honouring each row's (possibly reassigned) `parentId`.
 * A parent always precedes its children in the flat order, and lookups go through the map, so a
 * moved node keeps its whole subtree even though only its own row changed position.
 */
export const buildTree = (flattenedItems: FlattenedCategory[]): SortableCategory[] => {
  const roots: SortableCategory[] = []
  const nodeMap = new Map<string, SortableCategory>()

  for (const item of flattenedItems) {
    nodeMap.set(item.categoryId, { ...item.category, parentId: item.parentId, children: [] })
  }

  for (const item of flattenedItems) {
    const node = nodeMap.get(item.categoryId)
    if (!node) continue

    const parent = item.parentId ? nodeMap.get(item.parentId) : null
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  return roots
}

export interface CategoryGuide {
  categoryId: string
  /** Whether this node is the last child among its siblings - decides the connector's shape (└ vs ├). */
  isLast: boolean
  /** For each ancestor depth, whether that ancestor's guide column still has a line running through it. */
  ancestorLines: boolean[]
}

/**
 * Depth-first tree-connector metadata (same traversal order as `flattenTree`), used to render the
 * "├─ / └─" guide lines that show a row's place in the hierarchy independent of its indentation.
 */
export const computeTreeGuides = (nodes: SortableCategory[], ancestorLines: boolean[] = []): CategoryGuide[] =>
  nodes.flatMap((node, index) => {
    const isLast = index === nodes.length - 1
    return [
      { categoryId: node.categoryId, isLast, ancestorLines },
      ...computeTreeGuides(node.children ?? [], [...ancestorLines, !isLast])
    ]
  })

export interface NodeLocation {
  /** The array that holds the node among its final siblings. */
  siblings: SortableCategory[]
  index: number
  node: SortableCategory
  parentId: string | null
}

/** Depth-first search for a node anywhere in the tree, regardless of nesting depth. */
export const locateNode = (
  nodes: SortableCategory[],
  id: string,
  parentId: string | null = null
): NodeLocation | null => {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index]
    if (node.categoryId === id) return { siblings: nodes, index, node, parentId }

    const found = locateNode(node.children ?? [], id, node.categoryId)
    if (found) return found
  }
  return null
}
