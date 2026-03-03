import type { TaskCardDragData, TaskPreview } from '@/types/task.type'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './task-card'

interface SortableTaskCardProps {
  task: TaskPreview
  isOverlay?: boolean
}

export default function SortableTaskCard({ task, isOverlay }: SortableTaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'TaskCard',
      task
    } satisfies TaskCardDragData,
    attributes: {
      roleDescription: 'Task'
    }
  })

  const style = {
    transition,
    transform: CSS.Translate.toString(transform)
  }

  return (
    <TaskCard
      ref={setNodeRef}
      task={task}
      style={style}
      dragging={isOverlay ? 'overlay' : isDragging ? 'over' : undefined}
      {...attributes}
      {...listeners}
    />
  )
}
