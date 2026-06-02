import { customCollisionDetection } from '@/components/dnd/collision-detection'
import { snapCenterToCursor } from '@/components/dnd/modifiers'
import { useDndSensors } from '@/components/dnd/use-dnd-sensors'
import SortableParentSubtaskCard from '@/features/projects/subtasks/components/sortable-parent-subtask-card'
import SortableSubtaskCard from '@/features/projects/subtasks/components/sortable-subtask-card'
import { useSubtaskDnd } from '@/features/projects/subtasks/hooks/use-subtask-dnd'
import type { Subtask } from '@/features/projects/subtasks/shared-types'
import type { BasePaginationResponse } from '@/lib/axios'
import { defaultDropAnimation, DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'

interface TaskDialogSubtasksProps {
  taskId: string
  identifier: string
  milestoneIdentifier: string
  subtasks: BasePaginationResponse<Subtask> | null | undefined
}

export default function TaskDialogSubtasks({
  taskId,
  identifier,
  milestoneIdentifier,
  subtasks
}: TaskDialogSubtasksProps) {
  const sensors = useDndSensors()
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null)

  const {
    onDragStart,
    onDragOver,
    onDragEnd,
    activeParentSubtask,
    activeChildSubtask,
    groupedSubtasks,
    parentSubtasksIds
  } = useSubtaskDnd({ taskId, subtasks, identifier, milestoneIdentifier })

  return (
    <DndContext
      collisionDetection={customCollisionDetection}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <SortableContext items={parentSubtasksIds} strategy={verticalListSortingStrategy}>
        <div className='mt-10 space-y-8 pb-6'>
          {groupedSubtasks?.map((subtask) => (
            <SortableParentSubtaskCard
              key={subtask.id}
              subtask={subtask}
              projectIdentifier={identifier}
              parentMilestoneIdentifier={milestoneIdentifier}
              taskId={taskId}
              editingSubtaskId={editingSubtaskId}
              setEditingSubtaskId={setEditingSubtaskId}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={defaultDropAnimation} modifiers={[snapCenterToCursor]}>
        {activeParentSubtask && (
          <SortableParentSubtaskCard
            isOverlay
            subtask={activeParentSubtask}
            projectIdentifier={identifier}
            parentMilestoneIdentifier={milestoneIdentifier}
            taskId={taskId}
            editingSubtaskId={editingSubtaskId}
            setEditingSubtaskId={setEditingSubtaskId}
          />
        )}
        {activeChildSubtask && (
          <SortableSubtaskCard
            isOverlay
            subtask={activeChildSubtask}
            taskId={taskId}
            projectIdentifier={identifier}
            parentMilestoneIdentifier={milestoneIdentifier}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
