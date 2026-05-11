import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { TaskPreview } from '../../../core/types'
import type { TaskCardDragData } from '../types'
import TaskCard from './task-card'

interface SortableTaskCardProps {
  task: TaskPreview
  isOverlay?: boolean
  canMoveTask?: boolean
}

export default function SortableTaskCard({ task, isOverlay, canMoveTask = true }: SortableTaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'TaskCard',
      task
    } satisfies TaskCardDragData,
    attributes: {
      roleDescription: 'Task'
    },
    disabled: !canMoveTask
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
      {...(canMoveTask ? { ...attributes, ...listeners } : {})}
    />
  )
}
