import { Card } from '@/components/ui/card'
import type { TaskCardDragData, TaskCardVM } from '@/types/task.type'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cva } from 'class-variance-authority'

interface TaskCardProps {
  task: TaskCardVM
  isOverlay?: boolean
}

export default function TaskCard({ task, isOverlay }: TaskCardProps) {
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

  const variants = cva('', {
    variants: {
      dragging: {
        over: 'opacity-30',
        overlay: 'ring-2 ring-primary'
      }
    }
  })

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={variants({
        dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
        className: 'gap-2 p-3 rounded-md'
      })}
    >
      <div className='text-sm'>{task.content}</div>
    </Card>
  )
}
