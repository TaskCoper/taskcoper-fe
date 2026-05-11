import { Card } from '@/components/ui/card'
import type { ChildSubtaskDragData } from '@/features/projects/subtasks/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Subtask } from '../shared-types'
import SubtaskCard from './subtask-card'

interface SortableSubtaskCardProps {
  subtask: Subtask
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
  isOverlay?: boolean
}

export default function SortableSubtaskCard({
  subtask,
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier,
  isOverlay = false
}: SortableSubtaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: subtask.id,
    data: {
      type: 'ChildSubtask',
      subtask
    } satisfies ChildSubtaskDragData,
    attributes: {
      roleDescription: 'ChildSubtask'
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  if (isOverlay) {
    return (
      <Card className='border-2 border-primary p-2 rounded-md'>
        <SubtaskCard
          subtask={subtask}
          taskId={taskId}
          projectIdentifier={projectIdentifier}
          parentMilestoneIdentifier={parentMilestoneIdentifier}
        />
      </Card>
    )
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SubtaskCard
        subtask={subtask}
        taskId={taskId}
        projectIdentifier={projectIdentifier}
        parentMilestoneIdentifier={parentMilestoneIdentifier}
      />
    </div>
  )
}
