import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUpdateMilestone } from '@/features/milestones/hooks/use-update-milestone'
import { updateMilestoneSchema } from '@/features/milestones/validations'
import AddTaskButton from '@/features/tasks/components/add-task-button'
import TaskCard from '@/features/tasks/components/task-card'
import { cn } from '@/shared/utils'
import type { Milestone, MilestoneColumnDragData } from '@/types/milestone.type'
import type { Task } from '@/types/task.type'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cva } from 'class-variance-authority'
import { MoreHorizontalIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import MilestoneColumnDropdown from './milestone-column-dropdown'

interface SortableMilestoneColumnProps {
  column: Milestone
  tasks: Task[]
  isOverlay?: boolean
  queryKey: unknown[]
}

export default function SortableMilestoneColumn({ column, tasks, isOverlay, queryKey }: SortableMilestoneColumnProps) {
  const { t } = useTranslation()
  const { projectId, milestoneId } = useParams<{ projectId: string; milestoneId: string }>()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(column.name)
  const [openDropdown, setOpenDropdown] = useState(false)

  const { updateMilestone } = useUpdateMilestone({ queryKey })

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

  const handleClick = () => {
    setIsEditing(true)
    setEditValue(column.name)
  }

  const handleEditComplete = () => {
    const trimmedValue = editValue.trim()

    if (trimmedValue && trimmedValue !== column.name) {
      const validated = updateMilestoneSchema(t).safeParse({
        milestoneId: column.id,
        parentId: milestoneId,
        milestoneName: trimmedValue,
        position: column.position
      })

      if (validated.success) {
        updateMilestone({ body: validated.data })
      }
    }

    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditComplete()
    } else if (e.key === 'Escape') {
      setEditValue(column.name)
      setIsEditing(false)
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(isEditing ? {} : { ...attributes, ...listeners })}
      className={variants({
        dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
        className: 'gap-0 p-0 w-64 rounded-lg max-h-[calc(100vh-9rem)] overflow-hidden bg-muted cursor-pointer'
      })}
    >
      <div className='flex items-center justify-between gap-2 shrink-0 pl-3 pr-2 pt-2'>
        {isEditing ? (
          <Input
            type='text'
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditComplete}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            className='h-8 text-sm font-semibold'
            autoFocus
          />
        ) : (
          <p className='font-semibold text-sm cursor-text' onClick={handleClick}>
            {column.name}
          </p>
        )}

        <MilestoneColumnDropdown
          columnId={column.id}
          columnName={column.name}
          open={openDropdown}
          setOpen={setOpenDropdown}
        >
          <Button variant='ghost' size='icon-sm' className={cn(openDropdown ? 'bg-primary/10 text-primary' : '')}>
            <MoreHorizontalIcon />
          </Button>
        </MilestoneColumnDropdown>
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
