import type { BasePaginationResponse } from '@/lib/axios'
import { calculateReorderPosition, hasDraggableData } from '@/shared/utils'
import type { Milestone, ParentMilestone } from '@/types/milestone.type'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { updateMilestoneSchema } from '../validations'
import { useUpdateMilestone } from './use-update-milestone'

interface UseParentMilestoneDragDropProps {
  items: Milestone[]
  queryKey: unknown[]
}

export function useParentMilestoneDragDrop({ items, queryKey }: UseParentMilestoneDragDropProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { updateMilestone } = useUpdateMilestone()

  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null)

  const onDragStart = (event: DragStartEvent) => {
    if (!hasDraggableData(event.active)) return
    const data = event.active.data.current

    if (data?.type === 'MilestoneTab') {
      setActiveMilestone(data.milestone)
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

    const isActiveATab = activeData?.type === 'MilestoneTab'
    const isOverATab = overData?.type === 'MilestoneTab'

    if (isActiveATab && isOverATab) {
      queryClient.setQueryData<BasePaginationResponse<ParentMilestone>>(queryKey, (old) => {
        if (!old) return old
        const activeIndex = old.value.items.findIndex((item) => item.id === activeId)
        const overIndex = old.value.items.findIndex((item) => item.id === overId)
        return {
          ...old,
          value: {
            ...old.value,
            items: arrayMove(old.value.items, activeIndex, overIndex)
          }
        }
      })
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active } = event

    const originalMilestone = activeMilestone

    setActiveMilestone(null)

    if (!hasDraggableData(active)) return

    const activeData = active.data.current

    if (activeData?.type === 'MilestoneTab' && originalMilestone) {
      const currentIndex = items.findIndex((item) => item.id === active.id)
      const newPosition = calculateReorderPosition(items, currentIndex)

      if (originalMilestone.position === newPosition) {
        return
      }

      queryClient.setQueryData<BasePaginationResponse<ParentMilestone>>(queryKey, (old) => {
        if (!old) return old
        const newItems = [...old.value.items]
        newItems[currentIndex] = { ...newItems[currentIndex], position: newPosition }
        return {
          ...old,
          value: {
            ...old.value,
            items: newItems
          }
        }
      })

      const validated = updateMilestoneSchema(t).safeParse({
        milestoneId: active.id,
        parentId: null,
        milestoneName: activeData.milestone.name,
        position: newPosition
      })

      if (validated.success) {
        updateMilestone({ body: validated.data })
      }
    }
  }

  return {
    activeMilestone,
    onDragStart,
    onDragOver,
    onDragEnd
  }
}
