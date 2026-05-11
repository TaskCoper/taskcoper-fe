import { Card } from '@/components/ui/card'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ParentSubtaskDragData, SubtaskWithChildren } from '../types'
import ParentSubtaskCard from './parent-subtask-card'

interface SortableParentSubtaskCardProps {
  subtask: SubtaskWithChildren
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
  editingSubtaskId: string | null
  setEditingSubtaskId: (value: string | null) => void
  isOverlay?: boolean
}

export default function SortableParentSubtaskCard({
  subtask,
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier,
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
          projectIdentifier={projectIdentifier}
          parentMilestoneIdentifier={parentMilestoneIdentifier}
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
        projectIdentifier={projectIdentifier}
        parentMilestoneIdentifier={parentMilestoneIdentifier}
        editingSubtaskId={editingSubtaskId}
        setEditingSubtaskId={setEditingSubtaskId}
      />
    </div>
  )
}
