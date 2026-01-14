import { Card } from '@/components/ui/card'
import type { ParentSubtaskDragData, SubtaskWithChildren } from '@/types/subtask.type'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ParentSubtaskCard from './parent-subtask-card'

interface SortableParentSubtaskCardProps {
  subtask: SubtaskWithChildren
  taskId: string
  projectId: string
  parentMilestoneId: string
  editingSubtaskId: string | null
  setEditingSubtaskId: (value: string | null) => void
  isOverlay?: boolean
}

export default function SortableParentSubtaskCard({
  subtask,
  taskId,
  projectId,
  parentMilestoneId,
  editingSubtaskId,
  setEditingSubtaskId,
  isOverlay = false
}: SortableParentSubtaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: subtask.id,
    data: {
      type: 'ParentSubtask',
      subtask
    } satisfies ParentSubtaskDragData,
    attributes: {
      roleDescription: 'ParentSubtask'
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  if (isOverlay) {
    return (
      <Card className='border-2 border-primary p-2 rounded-lg'>
        <ParentSubtaskCard
          subtask={subtask}
          taskId={taskId}
          projectId={projectId}
          parentMilestoneId={parentMilestoneId}
          editingSubtaskId={editingSubtaskId}
          setEditingSubtaskId={setEditingSubtaskId}
        />
      </Card>
    )
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ParentSubtaskCard
        subtask={subtask}
        taskId={taskId}
        projectId={projectId}
        parentMilestoneId={parentMilestoneId}
        editingSubtaskId={editingSubtaskId}
        setEditingSubtaskId={setEditingSubtaskId}
      />
    </div>
  )
}
