import AvatarWithTooltip from '@/components/avatar-with-tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { useDateFormat } from '@/lib/date'
import { cn } from '@/shared/utils'
import { CircleUserIcon, ClockIcon, PanelBottomOpenIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMyProjectPermissions } from '../../roles/hooks/use-get-my-project-permissions'
import { useConvertSubtaskToTask } from '../hooks/use-convert-subtask-to-task'
import { useDeleteSubtask } from '../hooks/use-delete-subtask'
import { useUpdateSubtask } from '../hooks/use-update-subtask'
import { useUpdateSubtaskStatus } from '../hooks/use-update-subtask-status'
import type { Subtask } from '../shared-types'
import {
  updateSubtaskSchema,
  updateSubtaskStatusSchema,
  type UpdateSubtaskFormValues,
  type UpdateSubtaskStatusFormValues
} from '../validations'
import SubtaskAssigneePopover from './subtask-assignee-popover'
import SubtaskDeadlinePopover from './subtask-deadline-popover'

interface SubtaskCardProps {
  subtask: Subtask
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
}

export default function SubtaskCard({
  subtask,
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier
}: SubtaskCardProps) {
  const { t } = useTranslation()
  const { formatDateTime } = useDateFormat()

  const { updateSubtask } = useUpdateSubtask({ taskId })
  const { updateSubtaskStatus } = useUpdateSubtaskStatus({ taskId, projectIdentifier, parentMilestoneIdentifier })
  const { deleteSubtask } = useDeleteSubtask({ taskId, projectIdentifier, parentMilestoneIdentifier })
  const { convertSubtaskToTask, isConvertingSubtaskToTask } = useConvertSubtaskToTask({
    taskId,
    projectIdentifier,
    milestoneIdentifier: parentMilestoneIdentifier
  })

  const [isHovered, setIsHovered] = useState(false)
  const [isDeadlinePopoverOpen, setIsDeadlinePopoverOpen] = useState(false)
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false)
  const [activeAssigneeIndex, setActiveAssigneeIndex] = useState<number | null>(null)
  const [currentTime] = useState(() => Date.now())

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canWrite = check('TASKS', 'canWrite')
  const canDelete = check('TASKS', 'canDelete')
  const canUpdate = check('TASKS', 'canUpdate')

  const parsedDeadline = subtask.deadline ? new Date(subtask.deadline) : null
  const hasAssignee = (subtask.assignees?.length ?? 0) > 0
  const hasValidDeadline = !!(parsedDeadline && !Number.isNaN(parsedDeadline.getTime()))
  const shouldShowActions = isHovered || isDeadlinePopoverOpen || isAssigneePopoverOpen
  const canManageAssignees = canUpdate || canDelete
  const showReadOnlyDeadline = !canUpdate && hasValidDeadline
  const showEditableDeadline = canUpdate && (hasValidDeadline || shouldShowActions)
  const showReadOnlyAssignees = hasAssignee && !canManageAssignees
  const showAssigneePopover = hasAssignee && canManageAssignees
  const showAddAssigneeButton = !hasAssignee && canUpdate && shouldShowActions
  const isExpired = !!(
    hasValidDeadline &&
    parsedDeadline &&
    parsedDeadline.getTime() < currentTime &&
    !subtask.isCompleted
  )

  const { isEditing, inputProps, triggerProps } = useInlineEdit({
    initialValue: subtask.name,
    clickType: 'single',
    onSave: (newName) => {
      const payload: UpdateSubtaskFormValues = {
        id: subtask.id,
        name: newName,
        index: subtask.index,
        parentId: subtask.parentId,
        deadline: subtask.deadline
      }
      const validated = updateSubtaskSchema(t).safeParse(payload)

      if (validated.success) {
        updateSubtask({ body: validated.data })
      }
    }
  })

  const handleCheckboxChange = (checked: boolean) => {
    const payload: UpdateSubtaskStatusFormValues = {
      id: subtask.id,
      isCompleted: checked
    }
    const validated = updateSubtaskStatusSchema(t).safeParse(payload)

    if (validated.success) {
      updateSubtaskStatus({ body: validated.data })
    }
  }

  const handleDelete = () => {
    deleteSubtask({ id: subtask.id })
  }

  const handleUpdateDeadline = (deadline: string | null) => {
    const payload: UpdateSubtaskFormValues = {
      id: subtask.id,
      name: subtask.name,
      index: subtask.index,
      parentId: subtask.parentId,
      deadline
    }
    const validated = updateSubtaskSchema(t).safeParse(payload)

    if (validated.success) {
      updateSubtask({ body: validated.data })
    }
  }

  if (isEditing) {
    return (
      <div className='flex items-center gap-2 w-full min-w-0'>
        <Checkbox checked={subtask.isCompleted} disabled className='shrink-0' />
        <Input type='text' className='h-7 text-sm px-2 flex-1 min-w-0' {...inputProps} />
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2 max-w-full'>
      <Checkbox
        checked={subtask.isCompleted}
        onCheckedChange={handleCheckboxChange}
        disabled={!canUpdate}
        className='shrink-0'
      />
      <div
        className='flex items-center gap-3 flex-1 min-w-0 hover:bg-muted rounded-sm px-2 py-1 group/subtask-item'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <p
          className={cn('text-sm truncate flex-1 min-w-0', canUpdate ? 'cursor-text' : 'cursor-default')}
          {...(canUpdate ? triggerProps : {})}
        >
          {subtask.name}
        </p>

        <div className='flex items-center gap-2 shrink-0 ml-auto'>
          {showReadOnlyDeadline ? (
            <button
              type='button'
              className={cn(
                'mr-1 border rounded-sm text-xs text-foreground/70 transition-colors font-medium px-1.5 py-0.5 whitespace-nowrap',
                isExpired ? 'text-destructive bg-destructive/10 rounded-sm' : ''
              )}
            >
              {formatDateTime(parsedDeadline, 'dateTimeShort')}
            </button>
          ) : null}

          {showEditableDeadline ? (
            <SubtaskDeadlinePopover
              deadline={subtask.deadline}
              open={isDeadlinePopoverOpen}
              onSubmit={handleUpdateDeadline}
              onOpenChange={setIsDeadlinePopoverOpen}
              triggerTooltip={!hasValidDeadline ? t('task.subtask.tooltip.setDeadline') : undefined}
            >
              {hasValidDeadline ? (
                <button
                  type='button'
                  className={cn(
                    'mr-1 border rounded-sm text-xs text-foreground/70 hover:text-foreground cursor-pointer transition-colors font-medium px-1.5 py-0.5 whitespace-nowrap',
                    isExpired ? 'text-destructive hover:text-destructive bg-destructive/10 rounded-sm' : ''
                  )}
                >
                  {formatDateTime(parsedDeadline, 'dateTimeShort')}
                </button>
              ) : (
                <button
                  type='button'
                  aria-label={t('task.subtask.tooltip.setDeadline')}
                  className={cn(
                    'flex border hover:bg-primary/10 items-center rounded-full p-0.5 text-foreground/70 hover:text-primary cursor-pointer shrink-0',
                    isDeadlinePopoverOpen ? 'text-primary' : ''
                  )}
                >
                  <ClockIcon className='size-3.5' />
                </button>
              )}
            </SubtaskDeadlinePopover>
          ) : null}

          {showReadOnlyAssignees ? (
            <div className='flex items-center shrink-0 *:ring-2 *:ring-primary *:ring-offset-2 mr-1'>
              {subtask.assignees.slice(0, 3).map((member, index) => (
                <AvatarWithTooltip
                  key={member.userId}
                  avatar={member.avatar}
                  fullName={`${member.firstName} ${member.lastName}`}
                  className='size-4'
                  email={member.email}
                  isActive={activeAssigneeIndex === index}
                  onMouseEnter={() => setActiveAssigneeIndex(index)}
                  onMouseLeave={() => setActiveAssigneeIndex(null)}
                />
              ))}

              {subtask.assignees.length > 3 ? (
                <Avatar className='z-10 text-sm font-medium text-muted-foreground size-4'>
                  <AvatarFallback>
                    <p className='text-xs font-medium'>+{subtask.assignees.length - 3}</p>
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </div>
          ) : showAssigneePopover ? (
            <SubtaskAssigneePopover
              taskId={taskId}
              subtaskId={subtask.id}
              projectIdentifier={projectIdentifier}
              assignedUserIds={subtask.assignees.map((x) => x.userId)}
              onOpenChange={setIsAssigneePopoverOpen}
            >
              <div className='flex items-center cursor-pointer shrink-0 *:ring-2 *:ring-primary *:ring-offset-2 mr-1'>
                {subtask.assignees.slice(0, 3).map((member, index) => (
                  <AvatarWithTooltip
                    key={member.userId}
                    avatar={member.avatar}
                    fullName={`${member.firstName} ${member.lastName}`}
                    className='size-4'
                    email={member.email}
                    isActive={activeAssigneeIndex === index}
                    onMouseEnter={() => setActiveAssigneeIndex(index)}
                    onMouseLeave={() => setActiveAssigneeIndex(null)}
                  />
                ))}

                {subtask.assignees.length > 3 ? (
                  <Avatar className='z-10 text-sm font-medium text-muted-foreground size-4'>
                    <AvatarFallback>
                      <p className='text-xs font-medium'>+{subtask.assignees.length - 3}</p>
                    </AvatarFallback>
                  </Avatar>
                ) : null}
              </div>
            </SubtaskAssigneePopover>
          ) : showAddAssigneeButton ? (
            <SubtaskAssigneePopover
              taskId={taskId}
              subtaskId={subtask.id}
              projectIdentifier={projectIdentifier}
              assignedUserIds={subtask.assignees.map((x) => x.userId)}
              onOpenChange={setIsAssigneePopoverOpen}
              triggerTooltip={t('task.subtask.tooltip.assignMember')}
            >
              <button
                type='button'
                aria-label={t('task.subtask.tooltip.assignMember')}
                className='flex items-center rounded-full p-0.5 text-foreground/70 border hover:bg-primary/10 hover:text-primary cursor-pointer shrink-0'
              >
                <CircleUserIcon className='size-3.5' />
              </button>
            </SubtaskAssigneePopover>
          ) : null}

          {canWrite && shouldShowActions ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => convertSubtaskToTask({ subtaskId: subtask.id })}
                  disabled={isConvertingSubtaskToTask}
                  type='button'
                  className='flex items-center rounded-full p-0.5 text-foreground/70 border hover:bg-primary/10 hover:text-primary cursor-pointer shrink-0'
                >
                  {isConvertingSubtaskToTask ? (
                    <Spinner className='size-3.5' />
                  ) : (
                    <PanelBottomOpenIcon className='size-3.5' />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('task.subtask.tooltip.convertToTask')}</TooltipContent>
            </Tooltip>
          ) : null}

          {canDelete && shouldShowActions ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className='flex items-center rounded-full p-0.5 text-foreground/70 border hover:bg-destructive/10 hover:text-destructive cursor-pointer shrink-0'
                  onClick={handleDelete}
                >
                  <XIcon className='size-3.5' />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('task.subtask.tooltip.delete')}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </div>
  )
}
