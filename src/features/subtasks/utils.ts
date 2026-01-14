import type { Subtask, SubtaskWithChildren } from '@/types/subtask.type'

/**
 * Recalculates a parent subtask's isCompleted status based on its children.
 * Rules:
 * - If no children remain: parent = false (empty parent is incomplete)
 * - If all children are completed: parent = true
 * - Otherwise (mixed): parent = false
 */
export const recalculateParentStatus = (items: Subtask[], parentId: string): void => {
  const parentIndex = items.findIndex((item) => item.id === parentId)
  if (parentIndex === -1) return

  const siblings = items.filter((item) => item.parentId === parentId)

  if (siblings.length === 0) {
    // empty parent -> false
    items[parentIndex] = { ...items[parentIndex], isCompleted: false }
    return
  }

  const allCompleted = siblings.every((sibling) => sibling.isCompleted)
  if (items[parentIndex].isCompleted !== allCompleted) {
    items[parentIndex] = { ...items[parentIndex], isCompleted: allCompleted }
  }
}

/**
 * Transforms a flat list of subtasks into a nested structure with children.
 */
export const transformSubtasks = (subtasks: Subtask[]): SubtaskWithChildren[] => {
  const map = new Map<string, SubtaskWithChildren>()

  // create parent entries
  subtasks.forEach((s) => {
    if (!map.has(s.id) && s.parentId === null) {
      map.set(s.id, { ...s, children: [] })
    }
  })

  // add children to parents
  subtasks.forEach((s) => {
    if (s.parentId && map.has(s.parentId)) {
      map.get(s.parentId)?.children.push(s)
    }
  })

  return Array.from(map.values())
}
