import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import TaskCard from '@/features/tasks/components/task-card'
import type { MilestoneColumnDragData, MilestoneColumnVM } from '@/types/milestone.type'
import type { TaskCardVM } from '@/types/task.type'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cva } from 'class-variance-authority'
import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

interface MilestoneColumnProps {
  column: MilestoneColumnVM
  tasks: TaskCardVM[]
  isOverlay?: boolean
}

export default function MilestoneColumn({ column, tasks, isOverlay }: MilestoneColumnProps) {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()

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
      roleDescription: `Column: ${column.title}`
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
        className: 'gap-0 p-0 w-64 rounded-lg max-h-[calc(100vh-5.75rem)] overflow-hidden bg-muted'
      })}
    >
      <div className='px-3 pt-3 shrink-0'>
        <p className='font-medium text-sm'>{column.title}</p>
      </div>

      <div className='overflow-auto scrollbar-thumb-muted scrollbar-track-transparent scrollbar-corner-slate-50 flex-1'>
        <div className='flex flex-col gap-2 p-2'>
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <Link to={`/projects/${projectId}/tasks/${task.id}`} key={task.id}>
                <TaskCard task={task} />
              </Link>
            ))}
          </SortableContext>
        </div>
      </div>

      <div className='px-2 pb-2'>
        <Button className='w-full justify-start hover:bg-muted-foreground/10' variant='ghost'>
          <PlusIcon />
          {t('project.tasks.addTask')}
        </Button>
      </div>
    </Card>
  )
}
