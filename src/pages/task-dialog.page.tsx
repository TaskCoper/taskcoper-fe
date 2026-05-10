import { customCollisionDetection } from '@/components/dnd/collision-detection'
import { snapCenterToCursor } from '@/components/dnd/modifiers'
import { useDndSensors } from '@/components/dnd/use-dnd-sensors'
import RichTextEditor from '@/components/rich-text-editor'
import SanitizedHtml from '@/components/sanitized-html'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import AssigneePopover from '@/features/assignees/components/assignee-popover'
import { useGetTaskMembers } from '@/features/assignees/hooks/use-get-task-members'
import AttachmentPopover from '@/features/attachments/components/attachment-popover'
import { useGetAttachments } from '@/features/attachments/hooks/use-get-attachments'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import CommentCard from '@/features/comments/components/comment-card'
import { useAddComment } from '@/features/comments/hooks/use-add-comment'
import { useGetComments } from '@/features/comments/hooks/use-get-comments'
import type { AddTaskCommentFormValues } from '@/features/comments/validations'
import LabelPopover from '@/features/labels/components/label-popover'
import { useGetMyProjectPermissions } from '@/features/projects/roles/hooks/use-get-my-project-permissions'
import SortableParentSubtaskCard from '@/features/subtasks/components/sortable-parent-subtask-card'
import SortableSubtaskCard from '@/features/subtasks/components/sortable-subtask-card'
import SubtaskPopover from '@/features/subtasks/components/subtask-popover'
import { useGetSubtasks } from '@/features/subtasks/hooks/use-get-subtasks'
import { useSubtaskDnd } from '@/features/subtasks/hooks/use-subtask-dnd'
import BackgroundImagePopover from '@/features/tasks/components/background-image-popover'
import DatePopover from '@/features/tasks/components/date-popover'
import MoveTaskPopoverV2 from '@/features/tasks/components/move-task-popover-v2'
import PriorityPopover from '@/features/tasks/components/priority-popover'
import AttachmentsSection from '@/features/tasks/components/sections/attachments-section'
import TaskDetailMenu from '@/features/tasks/components/task-detail-menu'
import TaskPointsPopover from '@/features/tasks/components/task-points-popover'
import { getTaskPriorityIcon } from '@/features/tasks/constants'
import { useGetTask } from '@/features/tasks/hooks/use-get-task'
import { useToggleWatchTask } from '@/features/tasks/hooks/use-toggle-watch-task'
import { useUpdateTask } from '@/features/tasks/hooks/use-update-task'
import { updateTaskSchema, type UpdateTaskFormValues } from '@/features/tasks/validations'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { cn, getAvatarFallback, getColorTextClass } from '@/shared/utils'
import { TaskPriorityLabel } from '@/types/task.type'
import { defaultDropAnimation, DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { format } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import {
  ChevronDownIcon,
  ChevronsUpIcon,
  ChevronUpIcon,
  ClockIcon,
  EyeIcon,
  ImageIcon,
  MessageSquareText,
  MoreHorizontalIcon,
  PaperclipIcon,
  PlusIcon,
  SquareCheckBigIcon,
  TagIcon,
  TextAlignStartIcon,
  UserRoundPlusIcon,
  XIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router'

export default function TaskDialogPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { me: user } = useGetMe()
  const { t, i18n } = useTranslation()
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

  const dateLocale = i18n.language === 'vi-VN' ? vi : enUS

  const [isEditDescription, setIsEditDescription] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [showDescriptionToggle, setShowDescriptionToggle] = useState(false)
  const [descriptionElement, setDescriptionElement] = useState<HTMLDivElement | null>(null)
  const [isEditComment, setIsEditComment] = useState(false)
  const [open, setOpen] = useState(true)
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null)
  const [openTaskDetailMenu, setOpenTaskDetailMenu] = useState(false)
  const [openBackgroundImagePopover, setOpenBackgroundImagePopover] = useState(false)

  const sensors = useDndSensors()

  const { task, isLoadingTask } = useGetTask({ taskIdentifier })
  const { comments, isLoadingComments } = useGetComments({ taskId: task?.taskId })
  const { subtasks, isLoadingSubtasks } = useGetSubtasks({ taskId: task?.taskId })
  const { taskMembers, isLoadingTaskMembers } = useGetTaskMembers({ taskId: task?.taskId })
  const { attachments, isLoadingAttachments } = useGetAttachments({ taskId: task?.taskId })

  const isLoading =
    isLoadingTask || isLoadingComments || isLoadingSubtasks || isLoadingTaskMembers || isLoadingAttachments

  const isWatchingTask =
    taskMembers?.value.items.find((member) => !member.isMemberInTask && member.userId === user?.id) !== undefined

  const {
    methods: updateTaskMethods,
    updateTask,
    isUpdatingTask
  } = useUpdateTask({ taskIdentifier, identifier, milestoneIdentifier })
  const { reset: resetTask, control: updateTaskControl, handleSubmit: handleSubmitTask } = updateTaskMethods

  const {
    methods: addCommentMethods,
    addComment,
    isAddingComment
  } = useAddComment({ taskId: task?.taskId, identifier, milestoneIdentifier })
  const { reset: resetComment, control: addCommentControl, handleSubmit: handleSubmitComment } = addCommentMethods

  const {
    onDragStart,
    onDragOver,
    onDragEnd,
    activeParentSubtask,
    activeChildSubtask,
    groupedSubtasks,
    parentSubtasksIds
  } = useSubtaskDnd({ taskId: task?.taskId, subtasks, identifier, milestoneIdentifier })

  const {
    isEditing: isEditingName,
    inputProps: nameInputProps,
    triggerProps: nameTriggerProps
  } = useInlineEdit({
    initialValue: task?.taskName ?? '',
    clickType: 'single',
    onSave: (newName) => {
      if (!task) return

      const values: UpdateTaskFormValues = {
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

      const validated = updateTaskSchema(t).safeParse(values)

      if (validated.success) {
        updateTask({ body: validated.data })
      }
    }
  })

  const { toggleWatchTask } = useToggleWatchTask({ projectIdentifier: identifier, milestoneIdentifier })

  const goBack = () => {
    // Check if we're in the storage route
    if (location.pathname.includes('/storage/')) {
      // Navigate back to storage page
      navigate(`/projects/${identifier}/storage${location.search}`)
    } else {
      // Navigate back to milestones page
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

  useEffect(() => {
    if (open && task) {
      resetComment({
        taskId: task.taskId,
        content: '',
        mentionUsers: []
      })
    }
  }, [open, task, resetComment])

  useEffect(() => {
    if (!descriptionElement) return

    const checkHeight = () => {
      if (descriptionElement) {
        setShowDescriptionToggle(descriptionElement.scrollHeight > 384)
      }
    }

    checkHeight()

    const observer = new ResizeObserver(checkHeight)

    observer.observe(descriptionElement)
    return () => observer.disconnect()
  }, [descriptionElement, task?.taskDescription, isEditDescription])

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

  const onSubmitAddComment: SubmitHandler<AddTaskCommentFormValues> = (body) => {
    addComment({ body })
  }

  // useEffect(() => {
  //   if (task) {
  //     document.title = `${task?.taskName} | TaskCoper`
  //   }
  // }, [task])

  if (isLoading) {
    return (
      <Dialog open={true}>
        <DialogContent
          showCloseButton={false}
          position='top-center'
          className='min-w-6xl p-6 gap-4'
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
        className='min-w-6xl p-0 gap-0 flex flex-col border-none'
        onInteractOutside={handleClose}
      >
        <FormProvider {...updateTaskMethods}>
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>{t('task.detail.title')}</DialogTitle>
              <DialogDescription>{t('task.detail.description')}</DialogDescription>
            </DialogHeader>
          </VisuallyHidden>

          {task?.backgroundImage ? (
            <div className='relative w-full h-44 shrink-0 group bg-gray-300/80'>
              <img
                src={task.backgroundImage}
                alt={t('task.detail.backgroundImage')}
                className='w-full h-full object-contain'
              />
            </div>
          ) : null}

          <div
            className={cn(
              'px-6 py-4 flex items-center justify-between gap-2 z-10',
              task?.backgroundImage ? 'absolute top-0 left-0 right-0' : ''
            )}
          >
            {/* {identifier && milestoneIdentifier && task?.taskId && task?.milestoneId && task?.taskSlug ? (
              <MoveTaskPopover
                taskIdentifier={task.taskSlug}
                projectIdentifier={identifier}
                milestoneIdentifier={milestoneIdentifier}
                milestoneId={task.milestoneId}
                taskId={task.taskId}
              >
                <Button size='sm' variant='secondary' className='bg-muted-foreground/20 hover:bg-muted-foreground/40'>
                  {task?.milestoneName}
                  <ChevronDownIcon />
                </Button>
              </MoveTaskPopover>
            ) : null} */}

            {identifier && milestoneIdentifier && task?.taskId && task?.milestoneId && task?.taskSlug && canMoveTask ? (
              <MoveTaskPopoverV2
                projectIdentifier={identifier}
                taskIdentifier={task.taskSlug}
                taskId={task.taskId}
                taskParentMilestoneSlug={task.parentMilestoneSlug}
                taskMilestoneId={task.milestoneId}
              >
                <Button size='sm' variant='secondary' className='bg-muted-foreground/20 hover:bg-muted-foreground/40'>
                  {task?.milestoneName}
                  <ChevronDownIcon />
                </Button>
              </MoveTaskPopoverV2>
            ) : (
              <Button size='sm' variant='secondary' className='bg-muted-foreground/20 hover:bg-muted-foreground/40'>
                {task?.milestoneName}
              </Button>
            )}

            <div className='flex items-center gap-1'>
              {isWatchingTask ? (
                <Button
                  className='rounded-full'
                  variant={task?.backgroundImage ? 'outline' : 'ghost'}
                  size='icon-sm'
                  onClick={() => {
                    if (!task?.taskId) return
                    toggleWatchTask({ taskId: task.taskId, isWatching: false })
                  }}
                >
                  <EyeIcon />
                </Button>
              ) : null}

              <BackgroundImagePopover
                onSubmit={handleSubmitTask(onSubmitUpdateTask)}
                open={openBackgroundImagePopover}
                setOpen={setOpenBackgroundImagePopover}
                disabled={!canUpdate}
              >
                <Button
                  className={cn('rounded-full', openBackgroundImagePopover ? 'bg-primary/10 text-primary' : '')}
                  variant={task?.backgroundImage ? 'outline' : 'ghost'}
                  size='icon-sm'
                >
                  <ImageIcon />
                </Button>
              </BackgroundImagePopover>

              {task?.taskId && task?.taskName && identifier && milestoneIdentifier && task.milestoneId ? (
                <TaskDetailMenu
                  projectIdentifier={identifier}
                  parentMilestoneIdentifier={milestoneIdentifier}
                  milestoneId={task.milestoneId}
                  taskId={task.taskId}
                  taskName={task.taskName}
                  onDeleteSuccess={goBack}
                  open={openTaskDetailMenu}
                  setOpen={setOpenTaskDetailMenu}
                  isWatchingTask={isWatchingTask}
                >
                  <Button
                    className={cn('rounded-full', openTaskDetailMenu ? 'bg-primary/10 text-primary' : '')}
                    variant={task?.backgroundImage ? 'outline' : 'ghost'}
                    size='icon-sm'
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </TaskDetailMenu>
              ) : null}

              <Button
                className='rounded-full'
                variant={task?.backgroundImage ? 'outline' : 'ghost'}
                size='icon-sm'
                onClick={handleClose}
              >
                <XIcon />
              </Button>
            </div>
          </div>

          <Separator />

          <div className='grid grid-cols-12 flex-1 overflow-hidden'>
            <div className='col-span-7 p-6 border-r border-border overflow-y-auto space-y-6'>
              {/* Task name + popovers */}
              <div className='flex gap-2'>
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
                    'rounded-full border-foreground',
                    isEditingName ? 'mt-5' : 'mt-2.5',
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

                    {(task?.taskLabels.length ?? 0) === 0 &&
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

                    {(taskMembers?.value.items.filter((x) => x.isMemberInTask) ?? []).length === 0 &&
                    identifier &&
                    task?.taskId &&
                    milestoneIdentifier ? (
                      <AssigneePopover
                        projectIdentifier={identifier}
                        taskId={task.taskId}
                        parentMilestoneIdentifier={milestoneIdentifier}
                        disabled={!canWrite}
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
                      <Button variant='secondary' size='sm' className='hover:bg-muted-foreground/15'>
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
                    <Button variant='secondary' size='sm' className='hover:bg-muted-foreground/15'>
                      {task?.estimatedPoints ? (
                        <p className='font-semibold min-w-10'>{task.estimatedPoints}</p>
                      ) : (
                        <p className='font-semibold text-muted-foreground min-w-10'>{t('task.detail.none')}</p>
                      )}
                    </Button>
                  </TaskPointsPopover>
                </div>

                {/* Labels section */}
                {(task?.taskLabels.length ?? 0) > 0 ? (
                  <div className='space-y-1 max-w-full'>
                    <p className='text-sm font-semibold text-muted-foreground'>{t('task.detail.labels')}</p>

                    <div className='flex flex-wrap items-center gap-1 text-foreground/60'>
                      {task?.taskLabels.map((label) => (
                        <div
                          key={label.id}
                          className={cn(
                            label.color || 'bg-gray-200',
                            'h-8 rounded-md flex justify-center items-center min-w-14 px-3'
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
                        >
                          <Button variant='secondary' size='icon-sm'>
                            <PlusIcon />
                          </Button>
                        </LabelPopover>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Assigned members section */}
                {(taskMembers?.value.items.filter((x) => x.isMemberInTask) ?? []).length > 0 ? (
                  <div className='space-y-1'>
                    <p className='text-sm font-semibold text-muted-foreground'>{t('common.ui.members')}</p>

                    <div className='flex items-center gap-1'>
                      {taskMembers?.value.items
                        .filter((x) => x.isMemberInTask)
                        .map((member) => (
                          <Avatar key={member.userId} className='size-8'>
                            <AvatarImage src={member.avatar || ''} alt={`${member.firstName} ${member.lastName}`} />
                            <AvatarFallback>
                              {getAvatarFallback(`${member.firstName} ${member.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                        ))}

                      {identifier && task?.taskId && milestoneIdentifier ? (
                        <AssigneePopover
                          projectIdentifier={identifier}
                          taskId={task.taskId}
                          parentMilestoneIdentifier={milestoneIdentifier}
                          disabled={!canWrite}
                        >
                          <Button className='rounded-full size-8' size='icon' variant='secondary'>
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
                    <p className='text-sm font-semibold text-muted-foreground'>
                      {task.taskStartDate && task.taskEndDate
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
                      <Button variant='secondary' size='sm'>
                        {task?.taskStartDate ? (
                          <p className='font-semibold'>
                            {format(new Date(task.taskStartDate), t('task.detail.dateFormat'), { locale: dateLocale })}
                          </p>
                        ) : null}
                        {task?.taskStartDate && task?.taskEndDate ? <p className='font-semibold'>-</p> : null}
                        {task?.taskEndDate ? (
                          <p className='font-semibold'>
                            {format(new Date(task.taskEndDate), t('task.detail.dateFormat'), { locale: dateLocale })}
                          </p>
                        ) : null}
                        <ChevronDownIcon />
                      </Button>
                    </DatePopover>
                  </div>
                ) : null}
              </div>

              <div className='flex gap-3'>
                <TextAlignStartIcon className='mt-0.5 size-4' />
                <div className='w-full space-y-4'>
                  <div className='flex items-start justify-between'>
                    <p className='font-semibold'>{t('common.field.description')}</p>
                    {!isEditDescription && task?.taskDescription && canUpdate ? (
                      <Button variant='secondary' size='sm' onClick={() => setIsEditDescription(true)}>
                        {t('common.button.edit')}
                      </Button>
                    ) : null}
                  </div>

                  {isEditDescription ? (
                    <>
                      <Controller
                        name='description'
                        control={updateTaskControl}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className='gap-1'>
                            <RichTextEditor
                              isInitialFocus={true}
                              content={field.value ?? ''}
                              onChange={field.onChange}
                              onMentionIdsChange={(ids) => {
                                const currentMentionUsers = task?.mentionedUsers ?? []
                                const mentionIdQueues = currentMentionUsers.reduce<Record<string, string[]>>(
                                  (acc, user) => {
                                    if (!acc[user.userId]) acc[user.userId] = []
                                    acc[user.userId].push(user.id)
                                    return acc
                                  },
                                  {}
                                )

                                updateTaskMethods.setValue(
                                  'mentionUsers',
                                  ids.map((userId) => ({
                                    userId,
                                    mentionId: mentionIdQueues[userId]?.shift() ?? null
                                  })),
                                  { shouldDirty: true }
                                )
                              }}
                              projectIdentifier={identifier}
                              mentionedUsers={task?.mentionedUsers}
                            />
                          </Field>
                        )}
                      />

                      <div className='flex items-center gap-2'>
                        <Button
                          onClick={() => {
                            setIsEditDescription(false)
                            handleSubmitTask(onSubmitUpdateTask)()
                          }}
                          disabled={isUpdatingTask}
                        >
                          {isUpdatingTask ? <Spinner /> : null}
                          {t('common.button.save')}
                        </Button>
                        <Button
                          variant='ghost'
                          onClick={() => {
                            setIsEditDescription(false)
                            resetTask()
                          }}
                          disabled={isUpdatingTask}
                        >
                          {t('common.button.cancel')}
                        </Button>
                      </div>
                    </>
                  ) : task?.taskDescription ? (
                    <div>
                      <div className='relative'>
                        <div
                          ref={setDescriptionElement}
                          role='button'
                          className={cn('overflow-hidden transition-all', !isDescriptionExpanded && 'max-h-96')}
                        >
                          <SanitizedHtml html={task.taskDescription} mentionedUsers={task.mentionedUsers} />
                        </div>
                        {/* Gradient overlay when collapsed - only covers the HTML area */}
                        {showDescriptionToggle && !isDescriptionExpanded && (
                          <div className='absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent pointer-events-none' />
                        )}
                      </div>

                      {showDescriptionToggle && (
                        <Button
                          variant='secondary'
                          className='w-full mt-1'
                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        >
                          {isDescriptionExpanded ? (
                            <>
                              <ChevronUpIcon className='size-4' />
                              {t('common.ui.viewLess')}
                            </>
                          ) : (
                            <>
                              <ChevronDownIcon className='size-4' />
                              {t('common.ui.viewMore')}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Textarea
                      placeholder={t('task.description.addDescription')}
                      className='resize-none w-full font-semibold'
                      readOnly
                      disabled={!canUpdate}
                      onClick={() => canUpdate && setIsEditDescription(true)}
                    />
                  )}
                </div>
              </div>

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
              <DndContext
                collisionDetection={customCollisionDetection}
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
              >
                <SortableContext items={parentSubtasksIds} strategy={verticalListSortingStrategy}>
                  <div className='mt-10 space-y-8 pb-6'>
                    {groupedSubtasks?.map((subtask) => {
                      if (task?.taskId && identifier && milestoneIdentifier) {
                        return (
                          <SortableParentSubtaskCard
                            key={subtask.id}
                            subtask={subtask}
                            projectIdentifier={identifier}
                            parentMilestoneIdentifier={milestoneIdentifier}
                            taskId={task.taskId}
                            editingSubtaskId={editingSubtaskId}
                            setEditingSubtaskId={setEditingSubtaskId}
                          />
                        )
                      }
                      return null
                    })}
                  </div>
                </SortableContext>

                <DragOverlay dropAnimation={defaultDropAnimation} modifiers={[snapCenterToCursor]}>
                  {activeParentSubtask && task?.taskId && identifier && milestoneIdentifier && (
                    <SortableParentSubtaskCard
                      isOverlay
                      subtask={activeParentSubtask}
                      projectIdentifier={identifier}
                      parentMilestoneIdentifier={milestoneIdentifier}
                      taskId={task.taskId}
                      editingSubtaskId={editingSubtaskId}
                      setEditingSubtaskId={setEditingSubtaskId}
                    />
                  )}
                  {activeChildSubtask && task?.taskId && identifier && milestoneIdentifier && (
                    <SortableSubtaskCard
                      isOverlay
                      subtask={activeChildSubtask}
                      taskId={task.taskId}
                      projectIdentifier={identifier}
                      parentMilestoneIdentifier={milestoneIdentifier}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            </div>

            <div className='col-span-5 p-6 bg-muted space-y-4 overflow-y-auto'>
              <div className='flex items-center gap-2'>
                <MessageSquareText className='size-4' />
                <p className='text-sm font-bold'>{t('task.comment.comment')}</p>
              </div>

              {isEditComment ? (
                <div className='space-y-2'>
                  <Controller
                    name='content'
                    control={addCommentControl}
                    render={({ field }) => (
                      <div className='[&_.prose]:min-h-32 [&_.prose]:max-h-56'>
                        <RichTextEditor
                          isInitialFocus={true}
                          compact={true}
                          content={field.value ?? ''}
                          onChange={field.onChange}
                          onMentionIdsChange={(ids) => {
                            addCommentMethods.setValue(
                              'mentionUsers',
                              ids.map((userId) => ({ userId, mentionId: null })),
                              { shouldDirty: true }
                            )
                          }}
                          projectIdentifier={identifier}
                        />
                      </div>
                    )}
                  />
                  <div className='flex items-center gap-2'>
                    <Button
                      onClick={() => {
                        handleSubmitComment(onSubmitAddComment)()
                        setIsEditComment(false)
                      }}
                      disabled={isAddingComment}
                    >
                      {isAddingComment ? <Spinner /> : null}
                      {t('common.button.save')}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setIsEditComment(false)
                        resetComment()
                      }}
                      disabled={isAddingComment}
                    >
                      {t('common.button.cancel')}
                    </Button>
                  </div>
                </div>
              ) : canWrite ? (
                <Input
                  placeholder={t('task.comment.addComment')}
                  className={cn('font-semibold bg-background', !canWrite && 'cursor-not-allowed')}
                  readOnly
                  onClick={() => setIsEditComment(true)}
                />
              ) : null}

              {task?.taskId && identifier && milestoneIdentifier ? (
                <div className='space-y-6 pb-6'>
                  {comments?.value.items.map((comment) => (
                    <CommentCard
                      key={comment.commentId}
                      comment={comment}
                      taskId={task.taskId}
                      projectIdentifier={identifier}
                      parentMilestoneIdentifier={milestoneIdentifier}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
