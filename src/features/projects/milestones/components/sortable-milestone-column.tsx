import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { cn } from '@/shared/utils'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cva } from 'class-variance-authority'
import { MoreHorizontalIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import type { TaskPreview } from '../../core/types'
import { useGetMyProjectPermissions } from '../../roles/hooks/use-get-my-project-permissions'
import AddTaskButton from '../../tasks/core/components/add-task-button'
import SortableTaskCard from '../../tasks/core/components/sortable-task-card'
import { useUpdateMilestone } from '../hooks/use-update-milestone'
import type { Milestone, MilestoneColumnDragData } from '../types'
import { updateMilestoneSchema, type UpdateMilestoneFormValues } from '../validations'
import MilestoneColumnMenu from './milestone-column-menu'

interface SortableMilestoneColumnProps {
  column: Milestone
  tasks: TaskPreview[]
  isOverlay?: boolean
  queryKey: readonly unknown[]
  canMoveMilestone?: boolean
  canMoveTask?: boolean
}

export default function SortableMilestoneColumn({
  column,
  tasks,
  isOverlay,
  queryKey,
  canMoveMilestone = true,
  canMoveTask = true
}: SortableMilestoneColumnProps) {
  const { t } = useTranslation()
  const { identifier, milestoneIdentifier } = useParams<{ identifier: string; milestoneIdentifier: string }>()
  const [openDropdown, setOpenDropdown] = useState(false)

  const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const canWrite = check('TASKS', 'canWrite')
  const canUpdate = check('TASKS', 'canUpdate')

  const { updateMilestone } = useUpdateMilestone({
    queryKey,
    parentMilestoneIdentifier: milestoneIdentifier
  })

  const { isEditing, inputProps, triggerProps } = useInlineEdit({
    initialValue: column.name,
    clickType: 'single',
    onSave: (newName) => {
      const payload: UpdateMilestoneFormValues = {
        milestoneId: column.id,
        parentMilestoneIdentifier: milestoneIdentifier ?? null,
        milestoneName: newName,
        position: column.position
      }
      const validated = updateMilestoneSchema(t).safeParse(payload)

      if (validated.success) {
        updateMilestone({ body: validated.data })
      }
    }
  })

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
    },
    disabled: !canMoveMilestone
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
      {...(isEditing || !canMoveMilestone ? {} : { ...attributes, ...listeners })}
      className={variants({
        dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
        className: 'gap-0 p-0 w-64 rounded-lg max-h-[calc(100vh-12.5rem)] overflow-hidden bg-muted cursor-pointer'
      })}
    >
      <div className='flex items-center justify-between gap-2 shrink-0 pl-3 pr-2 pt-2'>
        {isEditing ? (
          <Input type='text' className='h-8 text-sm font-semibold' {...inputProps} />
        ) : (
          <p
            className={cn('font-semibold text-sm', canUpdate ? 'cursor-text' : 'cursor-default')}
            {...(canUpdate ? triggerProps : {})}
          >
            {column.name}
          </p>
        )}

        <MilestoneColumnMenu
          columnId={column.id}
          columnName={column.name}
          open={openDropdown}
          setOpen={setOpenDropdown}
        >
          <Button variant='ghost' size='icon-sm' className={cn(openDropdown ? 'bg-primary/10 text-primary' : '')}>
            <MoreHorizontalIcon />
          </Button>
        </MilestoneColumnMenu>
      </div>

      <div className='overflow-auto scrollbar-thumb-muted scrollbar-track-transparent scrollbar-corner-slate-50 flex-1'>
        <div className='flex flex-col gap-2 p-2'>
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <SortableTaskCard task={task} key={task.id} canMoveTask={canMoveTask} />
            ))}
          </SortableContext>
        </div>
      </div>

      {column.id && identifier && milestoneIdentifier && canWrite ? (
        <div className='px-2 pb-2'>
          <AddTaskButton
            milestoneId={column.id as string}
            projectIdentifier={identifier}
            parentMilestoneIdentifier={milestoneIdentifier}
          />
        </div>
      ) : null}
    </Card>
  )
}
