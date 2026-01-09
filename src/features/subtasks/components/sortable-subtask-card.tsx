import { Card } from '@/components/ui/card'
import type { ChildSubtaskDragData, Subtask } from '@/types/subtask.type'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SubtaskCard from './subtask-card'

interface SortableSubtaskCardProps {
  subtask: Subtask
  taskId: string
  projectId: string
  parentMilestoneId: string
  isOverlay?: boolean
}

export default function SortableSubtaskCard({
  subtask,
  taskId,
  projectId,
  parentMilestoneId,
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
      <Card className='border-2 border-primary px-2 py-1 rounded-md'>
        <SubtaskCard subtask={subtask} taskId={taskId} projectId={projectId} parentMilestoneId={parentMilestoneId} />
      </Card>
    )
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SubtaskCard subtask={subtask} taskId={taskId} projectId={projectId} parentMilestoneId={parentMilestoneId} />
    </div>
  )
}
