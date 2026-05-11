import type { SubtaskWithChildren } from '@/features/projects/subtasks/types'
import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { calculateReorderPosition, hasDraggableData } from '@/shared/utils'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Subtask } from '../shared-types'
import { recalculateParentStatus, transformSubtasks } from '../utils'
import { updateSubtaskSchema } from '../validations'
import { useUpdateSubtask } from './use-update-subtask'

interface UseSubtaskDndProps {
  taskId?: string
  identifier?: string
  milestoneIdentifier?: string
  subtasks: BasePaginationResponse<Subtask> | null | undefined
}

export const useSubtaskDnd = ({ taskId, identifier, milestoneIdentifier, subtasks }: UseSubtaskDndProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const queryKey = queryKeys.subtasks.byTask(taskId)

  const [activeParentSubtask, setActiveParentSubtask] = useState<SubtaskWithChildren | null>(null)
  const [activeChildSubtask, setActiveChildSubtask] = useState<Subtask | null>(null)

  const { updateSubtask } = useUpdateSubtask({ taskId, identifier, milestoneIdentifier })

  const groupedSubtasks = transformSubtasks(subtasks?.value.items || [])
  const parentSubtasksIds = useMemo(() => groupedSubtasks.map((s) => s.id), [groupedSubtasks])

  const onDragStart = (event: DragStartEvent) => {
    if (!hasDraggableData(event.active)) return
    const data = event.active.data.current

    if (data?.type === 'ParentSubtask') {
      setActiveParentSubtask(data.subtask)
      return
    }

    if (data?.type === 'ChildSubtask') {
      setActiveChildSubtask(data.subtask)
      return
    }
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    if (!hasDraggableData(active) || !hasDraggableData(over)) return

    const activeData = active.data.current
    const overData = over.data.current

    const isActiveAParent = activeData?.type === 'ParentSubtask'
    const isOverAParent = overData?.type === 'ParentSubtask'
    const isActiveAChild = activeData?.type === 'ChildSubtask'
    const isOverAChild = overData?.type === 'ChildSubtask'

    // parent subtask over parent subtask
    if (isActiveAParent && isOverAParent) {
      queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKey, (old) => {
        if (!old) return old
        const activeIndex = old.value.items.findIndex((item) => item.id === activeId && item.parentId === null)
        const overIndex = old.value.items.findIndex((item) => item.id === overId && item.parentId === null)
        return {
          ...old,
          value: {
            ...old.value,
            items: arrayMove(old.value.items, activeIndex, overIndex)
          }
        }
      })
    }

    if (!isActiveAChild) return

    // child subtask over child subtask
    if (isActiveAChild && isOverAChild) {
      queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKey, (old) => {
        if (!old) return old
        const newItems = [...old.value.items]
        const activeIndex = newItems.findIndex((t) => t.id === activeId)
        const overIndex = newItems.findIndex((t) => t.id === overId)

        const activeChild = newItems[activeIndex]
        const overChild = newItems[overIndex]

        // move child subtask between parent subtask
        if (activeChild && overChild && activeChild.parentId !== overChild.parentId) {
          const oldParentId = activeChild.parentId
          const newParentId = overChild.parentId

          // update parentId
          newItems[activeIndex] = { ...activeChild, parentId: newParentId }

          // move item
          const reorderedItems = arrayMove(newItems, activeIndex, overIndex - 1)

          // recalculate parent status
          if (oldParentId) recalculateParentStatus(reorderedItems, oldParentId)
          if (newParentId) recalculateParentStatus(reorderedItems, newParentId)

          return { ...old, value: { ...old.value, items: reorderedItems } }
        }

        // reorder within same parent subtask
        return { ...old, value: { ...old.value, items: arrayMove(newItems, activeIndex, overIndex) } }
      })
    }

    // child subtask over empty parent subtask
    if (isActiveAChild && isOverAParent) {
      queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKey, (old) => {
        if (!old) return old
        const newItems = [...old.value.items]
        const activeIndex = newItems.findIndex((t) => t.id === activeId)
        const activeChild = newItems[activeIndex]

        if (activeIndex !== -1) {
          const oldParentId = activeChild.parentId
          const newParentId = overData.subtask.id

          if (oldParentId !== newParentId) {
            newItems[activeIndex] = { ...newItems[activeIndex], parentId: newParentId }

            // recalculate parent status
            if (oldParentId) recalculateParentStatus(newItems, oldParentId)
            if (newParentId) recalculateParentStatus(newItems, newParentId)

            return { ...old, value: { ...old.value, items: newItems } }
          }
        }
        return old
      })
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active } = event

    const originalParent = activeParentSubtask
    const originalChild = activeChildSubtask

    setActiveParentSubtask(null)
    setActiveChildSubtask(null)

    if (!hasDraggableData(active)) return

    const activeId = active.id as string
    const activeData = active.data.current
    const allSubtasks = subtasks?.value.items || []

    if (activeData?.type === 'ParentSubtask' && originalParent) {
      const parents = allSubtasks.filter((s) => s.parentId === null)
      const currentIndex = parents.findIndex((p) => p.id === activeId)
      const newIndex = calculateReorderPosition(
        parents.map((p) => ({ position: p.index })),
        currentIndex
      )

      if (originalParent.index === newIndex) return

      const validated = updateSubtaskSchema(t).safeParse({
        id: activeId,
        name: originalParent.name,
        index: newIndex,
        parentId: null
      })

      if (validated.success) {
        updateSubtask({
          body: validated.data,
          meta: { oldParentId: null }
        })
      }
      return
    }

    if (activeData?.type === 'ChildSubtask' && originalChild) {
      const currentChild = allSubtasks.find((s) => s.id === activeId)
      if (!currentChild) return

      const childrenInParent = allSubtasks.filter((s) => s.parentId === currentChild.parentId)
      const indexInParent = childrenInParent.findIndex((s) => s.id === activeId)
      const newIndex = calculateReorderPosition(
        childrenInParent.map((c) => ({ position: c.index })),
        indexInParent
      )

      if (originalChild.index === newIndex && originalChild.parentId === currentChild.parentId) return

      const validated = updateSubtaskSchema(t).safeParse({
        id: activeId,
        name: originalChild.name,
        index: newIndex,
        parentId: currentChild.parentId
      })

      if (validated.success) {
        updateSubtask({
          body: validated.data,
          meta: { oldParentId: originalChild.parentId }
        })
      }
    }
  }

  return {
    onDragStart,
    onDragOver,
    onDragEnd,
    activeParentSubtask,
    activeChildSubtask,
    groupedSubtasks,
    parentSubtasksIds
  }
}
