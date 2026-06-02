import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import LabelPopover from '@/features/projects/labels/components/label-popover'
import { useGetMyProjectPermissions } from '@/features/projects/roles/hooks/use-get-my-project-permissions'
import SubtaskPopover from '@/features/projects/subtasks/components/subtask-popover'
import AttachmentPopover from '@/features/projects/tasks/attachments/components/attachment-popover'
import AttachmentsSection from '@/features/projects/tasks/attachments/components/attachments-section'
import { useGetTaskAttachments } from '@/features/projects/tasks/attachments/hooks/use-get-task-attachments'
import { useGetTaskComments } from '@/features/projects/tasks/comments/hooks/use-get-task-comments'
import DatePopover from '@/features/projects/tasks/core/components/date-popover'
import PriorityPopover from '@/features/projects/tasks/core/components/priority-popover'
import TaskDialogComments from '@/features/projects/tasks/core/components/task-dialog-comments'
import TaskDialogDescription from '@/features/projects/tasks/core/components/task-dialog-description'
import TaskDialogHeader from '@/features/projects/tasks/core/components/task-dialog-header'
import TaskDialogSubtasks from '@/features/projects/tasks/core/components/task-dialog-subtasks'
import TaskPointsPopover from '@/features/projects/tasks/core/components/task-points-popover'
import { getTaskPriorityIcon } from '@/features/projects/tasks/core/constants'
import { useGetTask } from '@/features/projects/tasks/core/hooks/use-get-task'
import { useUpdateTask } from '@/features/projects/tasks/core/hooks/use-update-task'
import { TaskPriorityLabel } from '@/features/projects/tasks/core/types'
import { updateTaskSchema, type UpdateTaskFormValues } from '@/features/projects/tasks/core/validations'
import AssigneePopover from '@/features/projects/tasks/members/components/assignee-popover'
import { useGetTaskMembers } from '@/features/projects/tasks/members/hooks/use-get-task-members'
import { useGetTaskSubtasks } from '@/features/projects/tasks/subtasks/hooks/use-get-subtasks'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { useDateFormat } from '@/lib/date'
import { cn, getAvatarFallback, getColorTextClass } from '@/shared/utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  ChevronDownIcon,
  ChevronsUpIcon,
  ClockIcon,
  PaperclipIcon,
  PlusIcon,
  SquareCheckBigIcon,
  TagIcon,
  UserRoundPlusIcon
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router'

const TASK_DIALOG_INSET_SHADOW_COLOR = 'rgba(0,0,0,0.6)'
const TASK_DIALOG_SHADOW_STYLE = {
  '--task-dialog-inset-shadow-color': TASK_DIALOG_INSET_SHADOW_COLOR
} as CSSProperties
const TASK_DIALOG_MUTED_BUTTON_CLASSES = 'hover:bg-muted-foreground/15'

export default function TaskDialogPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { me: user } = useGetMe()
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const { identifier, milestoneIdentifier, taskIdentifier } = useParams<{
    identifier: string
    milestoneIdentifier: string
    taskIdentifier: string
  }>()

  const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const canMoveTask = check('TASKS', 'canUpdate', 'canMoveTask')
  const canToggleTaskStatus = check('TASKS', 'canUpdate', 'canToggleTaskStatus')
  const canWrite = check('TASKS', 'canWrite')
  const canUpdate = check('TASKS', 'canUpdate')

  const [open, setOpen] = useState(true)
  const [currentTime] = useState(() => Date.now())
  const [isActionLabelPopoverOpen, setIsActionLabelPopoverOpen] = useState(false)
  const [isFieldsLabelPopoverOpen, setIsFieldsLabelPopoverOpen] = useState(false)
  const [isActionAssigneePopoverOpen, setIsActionAssigneePopoverOpen] = useState(false)
  const [isFieldsAssigneePopoverOpen, setIsFieldsAssigneePopoverOpen] = useState(false)

  const { task, isLoadingTask } = useGetTask({ taskIdentifier })
  const { comments, isLoadingComments } = useGetTaskComments({ taskId: task?.taskId })
  const { subtasks, isLoadingSubtasks } = useGetTaskSubtasks({ taskId: task?.taskId })
  const { taskMembers, isLoadingTaskMembers } = useGetTaskMembers({ taskId: task?.taskId })
  const { attachments, isLoadingAttachments } = useGetTaskAttachments({ taskId: task?.taskId })

  const isLoading =
    isLoadingTask || isLoadingComments || isLoadingSubtasks || isLoadingTaskMembers || isLoadingAttachments
  const isTaskExpired = !!(
    task?.taskEndDate &&
    !Number.isNaN(new Date(task.taskEndDate).getTime()) &&
    new Date(task.taskEndDate).getTime() < currentTime
  )

  const isWatchingTask =
    taskMembers?.value.items.find((member) => !member.isMemberInTask && member.userId === user?.id) !== undefined
  const assignedTaskMembers = taskMembers?.value.items.filter((x) => x.isMemberInTask) ?? []

  const {
    methods: updateTaskMethods,
    updateTask,
    isUpdatingTask
  } = useUpdateTask({ taskId: task?.taskId, taskIdentifier, identifier, milestoneIdentifier })
  const { reset: resetTask, handleSubmit: handleSubmitTask } = updateTaskMethods

  const {
    isEditing: isEditingName,
    inputProps: nameInputProps,
    triggerProps: nameTriggerProps
  } = useInlineEdit({
    initialValue: task?.taskName ?? '',
    clickType: 'single',
    onSave: (newName) => {
      if (!task) return

      const payload: UpdateTaskFormValues = {
        id: task.taskId,
        name: newName,
        priority: task.priority,
        isCompleted: task.isCompleted,
        description: task.taskDescription,
        position: task.taskPosition,
        startDate: task.taskStartDate,
        endDate: task.taskEndDate,
        targetMilestoneId: task.milestoneId,
        announceBeforeMinutes: task.announceBeforeMinutes,
        estimatedPoints: task.estimatedPoints,
        backgroundImage: task.backgroundImage,
        mentionUsers: task.mentionedUsers.map((user) => ({ userId: user.userId, mentionId: user.id }))
      }
      const validated = updateTaskSchema(t).safeParse(payload)

      if (validated.success) {
        updateTask({ body: validated.data })
      }
    }
  })

  const goBack = () => {
    if (location.pathname.includes('/storage/')) {
      navigate(`/projects/${identifier}/storage${location.search}`)
    } else {
      navigate(`/projects/${identifier}/milestones/${milestoneIdentifier}${location.search}`)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      goBack()
    }, 300)
  }

  useEffect(() => {
    if (open && task) {
      resetTask({
        id: task.taskId,
        description: task.taskDescription,
        name: task.taskName,
        position: task.taskPosition,
        startDate: task.taskStartDate,
        endDate: task.taskEndDate,
        isCompleted: task.isCompleted,
        targetMilestoneId: task.milestoneId,
        announceBeforeMinutes: task.announceBeforeMinutes,
        estimatedPoints: task.estimatedPoints,
        backgroundImage: task.backgroundImage,
        priority: task.priority,
        mentionUsers: task.mentionedUsers.map((user) => ({ userId: user.userId, mentionId: user.id }))
      })
    }
  }, [open, task, resetTask])

  const onSubmitUpdateTask: SubmitHandler<UpdateTaskFormValues> = (body) => {
    updateTask({ body })
  }

  const handleRemoveDate = () => {
    updateTask({
      body: { ...updateTaskMethods.getValues(), startDate: null, endDate: null, announceBeforeMinutes: null }
    })
  }

  const handleRemovePriority = () => {
    updateTask({
      body: { ...updateTaskMethods.getValues(), priority: null }
    })
  }

  if (isLoading) {
    return (
      <Dialog open={true}>
        <DialogContent
          showCloseButton={false}
          position='top-center'
          className='min-w-[95%] xl:min-w-6xl gap-4 rounded-3xl'
          onInteractOutside={handleClose}
        >
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>{t('task.detail.title')}</DialogTitle>
              <DialogDescription>{t('task.detail.description')}</DialogDescription>
            </DialogHeader>
          </VisuallyHidden>

          <Skeleton className='h-8 w-full' />
          <div className='grid grid-cols-12 gap-4'>
            <div className='col-span-7 space-y-4'>
              <Skeleton className='h-28 w-full' />
              <Skeleton className='h-10 w-5/6' />
              <Skeleton className='h-8 w-3/4' />
            </div>
            <div className='col-span-5 space-y-4'>
              <Skeleton className='h-16 w-full' />
              <div className='space-y-2'>
                <Skeleton className='h-6 w-full' />
                <Skeleton className='h-6 w-full' />
                <Skeleton className='h-6 w-full' />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
        setOpen(open)
      }}
    >
      <DialogContent
        showCloseButton={false}
        position='top-center'
        className='min-w-[95%] xl:min-w-6xl p-0 gap-0 flex flex-col rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.1),inset_0_0_4px_var(--task-dialog-inset-shadow-color)]'
        style={TASK_DIALOG_SHADOW_STYLE}
        onInteractOutside={handleClose}
      >
        <FormProvider {...updateTaskMethods}>
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>{t('task.detail.title')}</DialogTitle>
              <DialogDescription>{t('task.detail.description')}</DialogDescription>
            </DialogHeader>
          </VisuallyHidden>

          <TaskDialogHeader
            task={task}
            identifier={identifier}
            milestoneIdentifier={milestoneIdentifier}
            canMoveTask={canMoveTask}
            canUpdate={canUpdate}
            isWatchingTask={isWatchingTask}
            onSubmitUpdateTask={onSubmitUpdateTask}
            handleClose={handleClose}
            goBack={goBack}
          />

          <Separator />

          <div className='grid grid-cols-12 flex-1 overflow-hidden'>
            <div className='col-span-7 p-5 border-r border-border overflow-y-auto space-y-6'>
              <div className='space-y-4'>
                {/* Task name + popovers */}
                <div className='flex gap-1'>
                  <Checkbox
                    checked={task?.isCompleted}
                    disabled={!canToggleTaskStatus}
                    onCheckedChange={(checked) => {
                      const result = updateTaskSchema(t).safeParse({
                        ...updateTaskMethods.getValues(),
                        isCompleted: checked as boolean
                      })

                      if (result.success) {
                        updateTask({ body: result.data })
                      }
                    }}
                    className={cn(
                      'rounded-full border-foreground size-4.5',
                      isEditingName ? 'mt-4.5' : 'mt-2',
                      !canToggleTaskStatus ? 'cursor-not-allowed' : ''
                    )}
                  />
                  <div className='space-y-4'>
                    {isEditingName ? (
                      <Input className='text-3xl! font-bold w-full h-14' {...nameInputProps} />
                    ) : (
                      <p
                        className={cn(
                          'text-3xl font-bold cursor-text',
                          task?.isCompleted ? 'text-muted-foreground' : '',
                          canUpdate ? 'cursor-text' : 'cursor-default'
                        )}
                        {...(canUpdate ? nameTriggerProps : {})}
                      >
                        {task?.taskName}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className='flex items-center gap-2 flex-wrap'>
                      {!task?.priority ? (
                        <PriorityPopover
                          onSubmit={handleSubmitTask(onSubmitUpdateTask)}
                          onRemove={handleRemovePriority}
                          disabled={!canUpdate}
                        >
                          <Button variant='outline' size='sm'>
                            <ChevronsUpIcon />
                            {t('task.priority.title')}
                          </Button>
                        </PriorityPopover>
                      ) : null}

                      {(((task?.taskLabels.length ?? 0) === 0 && !isFieldsLabelPopoverOpen) ||
                        isActionLabelPopoverOpen) &&
                      identifier &&
                      task?.taskSlug &&
                      task?.taskId &&
                      milestoneIdentifier ? (
                        <LabelPopover
                          projectIdentifier={identifier}
                          taskSlug={task.taskSlug}
                          taskId={task.taskId}
                          parentMilestoneIdentifier={milestoneIdentifier}
                          taskLabels={task?.taskLabels ?? []}
                          disabled={!canUpdate}
                          onOpenChange={setIsActionLabelPopoverOpen}
                        >
                          <Button variant='outline' size='sm'>
                            <TagIcon />
                            {t('common.field.label')}
                          </Button>
                        </LabelPopover>
                      ) : null}

                      {!task?.taskStartDate && !task?.taskEndDate ? (
                        <DatePopover
                          onSubmit={handleSubmitTask(onSubmitUpdateTask)}
                          onRemove={handleRemoveDate}
                          disabled={!canUpdate}
                        >
                          <Button variant='outline' size='sm'>
                            <ClockIcon />
                            {t('common.field.date')}
                          </Button>
                        </DatePopover>
                      ) : null}

                      {identifier && task?.taskId && milestoneIdentifier ? (
                        <SubtaskPopover
                          projectIdentifier={identifier}
                          taskId={task.taskId}
                          parentMilestoneIdentifier={milestoneIdentifier}
                          disabled={!canWrite}
                        >
                          <Button variant='outline' size='sm'>
                            <SquareCheckBigIcon />
                            {t('task.subtask.subtask')}
                          </Button>
                        </SubtaskPopover>
                      ) : null}

                      {((assignedTaskMembers.length === 0 && !isFieldsAssigneePopoverOpen) ||
                        isActionAssigneePopoverOpen) &&
                      identifier &&
                      task?.taskId &&
                      milestoneIdentifier ? (
                        <AssigneePopover
                          projectIdentifier={identifier}
                          taskId={task.taskId}
                          parentMilestoneIdentifier={milestoneIdentifier}
                          disabled={!canWrite}
                          onOpenChange={setIsActionAssigneePopoverOpen}
                        >
                          <Button variant='outline' size='sm'>
                            <UserRoundPlusIcon />
                            {t('task.assignee.assignee')}
                          </Button>
                        </AssigneePopover>
                      ) : null}

                      {task?.taskId && identifier && milestoneIdentifier ? (
                        <AttachmentPopover
                          taskId={task.taskId}
                          projectIdentifier={identifier}
                          parentMilestoneIdentifier={milestoneIdentifier}
                          disabled={!canWrite}
                        >
                          <Button variant='outline' size='sm'>
                            <PaperclipIcon />
                            {t('task.attachment.attachment')}
                          </Button>
                        </AttachmentPopover>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex items-center flex-wrap gap-6 pl-6'>
                {/* Priority section */}
                {task?.priority ? (
                  <div className='space-y-1'>
                    <p className='text-sm font-semibold text-muted-foreground'>{t('task.priority.title')}</p>

                    <PriorityPopover
                      onSubmit={handleSubmitTask(onSubmitUpdateTask)}
                      onRemove={handleRemovePriority}
                      disabled={!canUpdate}
                    >
                      <Button variant='outline' size='sm' className={TASK_DIALOG_MUTED_BUTTON_CLASSES}>
                        <div className='flex items-center gap-2 min-w-10'>
                          {getTaskPriorityIcon()[task.priority]}
                          <p className='font-semibold'>{t(TaskPriorityLabel[task.priority])}</p>
                        </div>
                      </Button>
                    </PriorityPopover>
                  </div>
                ) : null}

                {/* Story points section */}
                <div className='space-y-1'>
                  <p className='text-sm font-semibold text-muted-foreground'>{t('task.detail.storyPoints')}</p>

                  <TaskPointsPopover onSubmit={handleSubmitTask(onSubmitUpdateTask)} disabled={!canUpdate}>
                    <Button variant='outline' size='sm' className={TASK_DIALOG_MUTED_BUTTON_CLASSES}>
                      {task?.estimatedPoints ? (
                        <p className='font-semibold min-w-10'>{task.estimatedPoints}</p>
                      ) : (
                        <p className='font-semibold text-muted-foreground min-w-10'>{t('task.detail.none')}</p>
                      )}
                    </Button>
                  </TaskPointsPopover>
                </div>

                {/* Labels section */}
                {((task?.taskLabels.length ?? 0) > 0 && !isActionLabelPopoverOpen) || isFieldsLabelPopoverOpen ? (
                  <div className='space-y-1 max-w-full'>
                    <p className='text-sm font-semibold text-muted-foreground'>{t('task.detail.labels')}</p>

                    <div className='flex flex-wrap items-center gap-1 text-foreground/60'>
                      {task?.taskLabels.map((label) => (
                        <div
                          key={label.id}
                          className={cn(
                            label.color || 'bg-gray-200',
                            'h-8 rounded-lg flex justify-center items-center min-w-14 px-3'
                          )}
                        >
                          {label.name ? (
                            <p className={cn('text-sm font-semibold truncate', getColorTextClass(label.color))}>
                              {label.name}
                            </p>
                          ) : null}
                        </div>
                      ))}

                      {identifier && task?.taskSlug && task?.taskId && milestoneIdentifier ? (
                        <LabelPopover
                          projectIdentifier={identifier}
                          taskSlug={task.taskSlug}
                          taskId={task.taskId}
                          parentMilestoneIdentifier={milestoneIdentifier}
                          taskLabels={task?.taskLabels ?? []}
                          disabled={!canUpdate}
                          onOpenChange={setIsFieldsLabelPopoverOpen}
                        >
                          <Button variant='outline' size='icon-sm'>
                            <PlusIcon />
                          </Button>
                        </LabelPopover>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Assigned members section */}
                {(assignedTaskMembers.length > 0 && !isActionAssigneePopoverOpen) || isFieldsAssigneePopoverOpen ? (
                  <div className='space-y-1'>
                    <p className='text-sm font-semibold text-muted-foreground'>{t('common.ui.members')}</p>

                    <div className='flex items-center gap-1'>
                      {assignedTaskMembers.map((member) => (
                        <Avatar key={member.userId} className='size-8'>
                          <AvatarImage src={member.avatar || ''} alt={`${member.firstName} ${member.lastName}`} />
                          <AvatarFallback>{getAvatarFallback(`${member.firstName} ${member.lastName}`)}</AvatarFallback>
                        </Avatar>
                      ))}

                      {identifier && task?.taskId && milestoneIdentifier ? (
                        <AssigneePopover
                          projectIdentifier={identifier}
                          taskId={task.taskId}
                          parentMilestoneIdentifier={milestoneIdentifier}
                          disabled={!canWrite}
                          onOpenChange={setIsFieldsAssigneePopoverOpen}
                        >
                          <Button className='rounded-full size-8' size='icon' variant='outline'>
                            <PlusIcon />
                          </Button>
                        </AssigneePopover>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Date section */}
                {task?.taskStartDate || task?.taskEndDate ? (
                  <div className='space-y-1'>
                    <p
                      className={cn('text-sm font-semibold text-muted-foreground', isTaskExpired && 'text-destructive')}
                    >
                      {isTaskExpired
                        ? t('task.detail.expired')
                        : task.taskStartDate && task.taskEndDate
                          ? t('common.ui.date')
                          : task.taskStartDate
                            ? t('task.detail.startDate')
                            : t('task.detail.dueDate')}
                    </p>

                    <DatePopover
                      onSubmit={handleSubmitTask(onSubmitUpdateTask)}
                      onRemove={handleRemoveDate}
                      disabled={!canUpdate}
                    >
                      <Button
                        variant='outline'
                        size='sm'
                        className={cn('gap-1.5', isTaskExpired ? 'text-destructive' : TASK_DIALOG_MUTED_BUTTON_CLASSES)}
                      >
                        {task?.taskStartDate ? (
                          <p className='font-semibold'>{formatDate(task.taskStartDate, 'dateTimeMedium')}</p>
                        ) : null}

                        {task?.taskStartDate && task?.taskEndDate ? <p className='font-semibold'>-</p> : null}

                        {task?.taskEndDate ? (
                          <p className='font-semibold'>{formatDate(task.taskEndDate, 'dateTimeMedium')}</p>
                        ) : null}
                        <ChevronDownIcon />
                      </Button>
                    </DatePopover>
                  </div>
                ) : null}
              </div>

              <TaskDialogDescription
                task={task}
                canUpdate={canUpdate}
                identifier={identifier}
                isUpdatingTask={isUpdatingTask}
                onSubmitUpdateTask={onSubmitUpdateTask}
              />

              {/* Attachments */}
              {(attachments?.value.totalCount ?? 0) > 0 && task?.taskId && identifier && milestoneIdentifier ? (
                <AttachmentsSection
                  taskId={task.taskId}
                  projectIdentifier={identifier}
                  parentMilestoneIdentifier={milestoneIdentifier}
                  attachments={attachments?.value.items ?? []}
                />
              ) : null}

              {/* Subtasks */}
              {task?.taskId && identifier && milestoneIdentifier ? (
                <TaskDialogSubtasks
                  taskId={task.taskId}
                  identifier={identifier}
                  milestoneIdentifier={milestoneIdentifier}
                  subtasks={subtasks}
                />
              ) : null}
            </div>

            <TaskDialogComments
              taskId={task?.taskId}
              identifier={identifier}
              milestoneIdentifier={milestoneIdentifier}
              canWrite={canWrite}
              comments={comments}
            />
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
