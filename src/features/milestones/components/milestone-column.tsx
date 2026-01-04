import { Card } from '@/components/ui/card'
import AddTaskButton from '@/features/tasks/components/add-task-button'
import TaskCard from '@/features/tasks/components/task-card'
import type { Milestone, MilestoneColumnDragData } from '@/types/milestone.type'
import type { Task } from '@/types/task.type'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cva } from 'class-variance-authority'
import { useMemo } from 'react'
import { useParams } from 'react-router'

interface MilestoneColumnProps {
  column: Milestone
  tasks: Task[]
  isOverlay?: boolean
}

export default function MilestoneColumn({ column, tasks, isOverlay }: MilestoneColumnProps) {
  const { projectId, milestoneId } = useParams<{ projectId: string; milestoneId: string }>()

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id)
  }, [tasks])

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'MilestoneColumn',
      column
    } satisfies MilestoneColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.name}`
    }
  })

  const style = {
    transition,
    transform: CSS.Translate.toString(transform)
  }

  const variants = cva('flex flex-col shrink-0 snap-center', {
    variants: {
      dragging: {
        default: 'border-2 border-transparent',
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
        className: 'gap-0 p-0 w-64 rounded-lg max-h-[calc(100vh-9rem)] overflow-hidden bg-muted cursor-pointer'
      })}
    >
      <div className='px-3 pt-3 shrink-0'>
        <p className='font-medium text-sm'>
          {column.name} <span className='font-mono text-xs text-green-600'>({column.position})</span>
        </p>
      </div>

      <div className='overflow-auto scrollbar-thumb-muted scrollbar-track-transparent scrollbar-corner-slate-50 flex-1'>
        <div className='flex flex-col gap-2 p-2'>
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard task={task} key={task.id} />
            ))}
          </SortableContext>
        </div>
      </div>

      {column.id && projectId && milestoneId ? (
        <div className='px-2 pb-2'>
          <AddTaskButton milestoneId={column.id as string} projectId={projectId} parentMilestoneId={milestoneId} />
        </div>
      ) : null}
    </Card>
  )
}
