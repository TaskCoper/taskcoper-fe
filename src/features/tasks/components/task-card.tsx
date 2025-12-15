import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/shared/utils'
import type { TaskCardDragData, TaskCardVM } from '@/types/task.type'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cva } from 'class-variance-authority'
import { SquarePenIcon } from 'lucide-react'

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

  const isCompleted = false

  const style = {
    transition,
    transform: CSS.Translate.toString(transform)
  }

  const variants = cva('', {
    variants: {
      dragging: {
        over: 'opacity-50',
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
        className: 'gap-2 p-3 rounded-md cursor-pointer hover:ring-2 hover:ring-primary relative group'
      })}
    >
      <SquarePenIcon className='size-3.5 absolute right-2 top-2 hidden group-hover:block' />
      <div className='flex items-start gap-2'>
        <Checkbox
          className={cn(
            'rounded-full border-foreground mt-0.5',
            isCompleted
              ? 'data-[state=checked]:bg-lime-600 data-[state=checked]:border-lime-600'
              : 'hidden group-hover:block'
          )}
          checked={isCompleted}
          onCheckedChange={() => {}}
          onClick={(e) => e.stopPropagation()}
        />
        <p className={cn('text-sm w-[85%]', isCompleted ? 'text-muted-foreground' : '')}>{task.content}</p>
      </div>
    </Card>
  )
}
