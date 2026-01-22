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
import CommentCard from '@/features/comments/components/comment-card'
import { useAddComment } from '@/features/comments/hooks/use-add-comment'
import { useGetComments } from '@/features/comments/hooks/use-get-comments'
import type { AddTaskCommentFormValues } from '@/features/comments/validations'
import LabelPopover from '@/features/labels/components/label-popover'
import SortableParentSubtaskCard from '@/features/subtasks/components/sortable-parent-subtask-card'
import SortableSubtaskCard from '@/features/subtasks/components/sortable-subtask-card'
import SubtaskPopover from '@/features/subtasks/components/subtask-popover'
import { useGetSubtasks } from '@/features/subtasks/hooks/use-get-subtasks'
import { useSubtaskDnd } from '@/features/subtasks/hooks/use-subtask-dnd'
import DatePopover from '@/features/tasks/components/date-popover'
import AttachmentsSection from '@/features/tasks/components/sections/attachments-section'
import TaskDetailMenu from '@/features/tasks/components/task-detail-menu'
import { useGetTask } from '@/features/tasks/hooks/use-get-task'
import { useUpdateTask } from '@/features/tasks/hooks/use-update-task'
import { updateTaskSchema, type UpdateTaskFormValues } from '@/features/tasks/validations'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { cn, getAvatarFallback, getColorTextClass } from '@/shared/utils'
import { defaultDropAnimation, DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  ChevronDownIcon,
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
import { useNavigate, useParams } from 'react-router'

export default function TaskDetailDialogPage() {
  const navigate = useNavigate()

  const { t } = useTranslation()
  const { projectId, milestoneId, taskId } = useParams<{ projectId: string; milestoneId: string; taskId: string }>()

  const [isEditDescription, setIsEditDescription] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isEditComment, setIsEditComment] = useState(false)
  const [open, setOpen] = useState(true)
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null)
  const [openTaskDetailMenu, setOpenTaskDetailMenu] = useState(false)

  const sensors = useDndSensors()

  const { task, isLoadingTask } = useGetTask({ taskId })
  const { comments, isLoadingComments } = useGetComments({ taskId })
  const { subtasks, isLoadingSubtasks } = useGetSubtasks({ taskId })
  const { taskMembers, isLoadingTaskMembers } = useGetTaskMembers({ taskId })
  const { attachments, isLoadingAttachments } = useGetAttachments({ taskId })

  const isLoading =
    isLoadingTask || isLoadingComments || isLoadingSubtasks || isLoadingTaskMembers || isLoadingAttachments

  const {
    methods: updateTaskMethods,
    updateTask,
    isUpdatingTask
  } = useUpdateTask({ taskId, projectId, parentMilestoneId: milestoneId })
  const { reset: resetTask, control: updateTaskControl, handleSubmit: handleSubmitTask } = updateTaskMethods

  const {
    methods: addCommentMethods,
    addComment,
    isAddingComment
  } = useAddComment({ taskId, projectId, parentMilestoneId: milestoneId })
  const { reset: resetComment, control: addCommentControl, handleSubmit: handleSubmitComment } = addCommentMethods

  const {
    onDragStart,
    onDragOver,
    onDragEnd,
    activeParentSubtask,
    activeChildSubtask,
    groupedSubtasks,
    parentSubtasksIds
  } = useSubtaskDnd({ taskId, subtasks, projectId, parentMilestoneId: milestoneId })

  const {
    isEditing: isEditingName,
    inputProps: nameInputProps,
    triggerProps: nameTriggerProps
  } = useInlineEdit({
    initialValue: task?.taskName ?? '',
    clickType: 'single',
    onSave: (newName) => {
      const validated = updateTaskSchema(t).safeParse({
        id: task?.taskId,
        name: newName,
        description: task?.taskDescription,
        position: task?.taskPosition,
        startDate: task?.taskStartDate,
        endDate: task?.taskEndDate,
        targetMilestoneId: task?.milestoneId,
        announceBeforeMinutes: task?.announceBeforeMinutes
      })

      if (validated.success) {
        updateTask({ body: validated.data })
      }
    }
  })

  const goBack = () => {
    navigate(`/projects/${projectId}/milestones/${milestoneId}`)
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
        announceBeforeMinutes: task.announceBeforeMinutes
      })
    }
  }, [open, task, resetTask])

  useEffect(() => {
    if (open && task) {
      resetComment({
        taskId: task.taskId,
        content: ''
      })
    }
  }, [open, task, resetComment])

  const onSubmitUpdateTask: SubmitHandler<UpdateTaskFormValues> = (body) => {
    updateTask({ body })
  }

  const handleRemoveDate = () => {
    updateTask({
      body: { ...updateTaskMethods.getValues(), startDate: null, endDate: null, announceBeforeMinutes: null }
    })
  }

  const onSubmitAddComment: SubmitHandler<AddTaskCommentFormValues> = (body) => {
    addComment({ body })
  }

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
              <DialogTitle>Task Detail</DialogTitle>
              <DialogDescription>Task Description</DialogDescription>
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
        className='min-w-6xl p-0 gap-0 flex flex-col'
        onInteractOutside={handleClose}
      >
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Task Detail</DialogTitle>
            <DialogDescription>Task Description</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        <div className='px-6 py-4 flex items-center justify-between gap-2'>
          <Button size='sm' variant='secondary'>
            {task?.milestoneName}
            <ChevronDownIcon />
          </Button>

          <div className='flex items-center gap-1'>
            <Button className='rounded-full' variant='ghost' size='icon-sm'>
              <EyeIcon />
            </Button>

            <Separator orientation='vertical' />

            <Button className='rounded-full' variant='ghost' size='icon-sm'>
              <ImageIcon />
            </Button>

            {taskId && task?.taskName && projectId && milestoneId ? (
              <TaskDetailMenu
                projectId={projectId}
                parentMilestoneId={milestoneId}
                taskId={taskId}
                taskName={task.taskName}
                onDeleteSuccess={goBack}
                open={openTaskDetailMenu}
                setOpen={setOpenTaskDetailMenu}
              >
                <Button
                  className={cn('rounded-full', openTaskDetailMenu ? 'bg-primary/10 text-primary' : '')}
                  variant='ghost'
                  size='icon-sm'
                >
                  <MoreHorizontalIcon />
                </Button>
              </TaskDetailMenu>
            ) : null}

            <Button className='rounded-full' variant='ghost' size='icon-sm' onClick={handleClose}>
              <XIcon />
            </Button>
          </div>
        </div>

        <Separator />

        <div className='grid grid-cols-12 flex-1 overflow-hidden'>
          <FormProvider {...updateTaskMethods}>
            <div className='col-span-7 p-6 border-r border-border overflow-y-auto space-y-6'>
              {/* Task name + popovers */}
              <div className='flex gap-3'>
                <Checkbox
                  checked={task?.isCompleted}
                  onCheckedChange={(checked) => {
                    const result = updateTaskSchema(t).safeParse({
                      ...updateTaskMethods.getValues(),
                      isCompleted: checked as boolean
                    })

                    if (result.success) {
                      updateTask({ body: result.data })
                    }
                  }}
                  className={cn('rounded-full border-foreground', isEditingName ? 'mt-5' : 'mt-2')}
                />
                <div className='space-y-4'>
                  {isEditingName ? (
                    <Input className='text-3xl! font-bold w-full h-14' {...nameInputProps} />
                  ) : (
                    <p
                      className={cn('text-3xl font-bold cursor-text', task?.isCompleted ? 'text-muted-foreground' : '')}
                      {...nameTriggerProps}
                    >
                      {task?.taskName}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className='flex items-center gap-2 flex-wrap'>
                    {projectId && taskId && milestoneId ? (
                      <LabelPopover
                        projectId={projectId}
                        taskId={taskId}
                        parentMilestoneId={milestoneId}
                        taskLabels={task?.taskLabels ?? []}
                      >
                        <Button variant='outline' size='sm'>
                          <TagIcon />
                          {t('common.field.label')}
                        </Button>
                      </LabelPopover>
                    ) : null}
                    <DatePopover onSubmit={handleSubmitTask(onSubmitUpdateTask)} onRemove={handleRemoveDate}>
                      <Button variant='outline' size='sm'>
                        <ClockIcon />
                        {t('common.field.date')}
                      </Button>
                    </DatePopover>
                    {projectId && taskId && milestoneId ? (
                      <SubtaskPopover projectId={projectId} taskId={taskId} parentMilestoneId={milestoneId}>
                        <Button variant='outline' size='sm'>
                          <SquareCheckBigIcon />
                          {t('task.subtask.subtask')}
                        </Button>
                      </SubtaskPopover>
                    ) : null}
                    {projectId && taskId && milestoneId ? (
                      <AssigneePopover projectId={projectId} taskId={taskId} parentMilestoneId={milestoneId}>
                        <Button variant='outline' size='sm'>
                          <UserRoundPlusIcon />
                          {t('task.assignee.assignee')}
                        </Button>
                      </AssigneePopover>
                    ) : null}
                    {taskId && projectId && milestoneId ? (
                      <AttachmentPopover taskId={taskId} projectId={projectId} parentMilestoneId={milestoneId}>
                        <Button variant='outline' size='sm'>
                          <PaperclipIcon />
                          {t('task.attachment.attachment')}
                        </Button>
                      </AttachmentPopover>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className='flex items-center flex-wrap gap-10 pl-6'>
                {/* Labels section */}
                {(task?.taskLabels.length ?? 0) > 0 ? (
                  <div className='space-y-1 max-w-full'>
                    <p className='text-sm font-semibold text-muted-foreground'>Nhãn</p>

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

                      {projectId && taskId && milestoneId ? (
                        <LabelPopover
                          projectId={projectId}
                          taskId={taskId}
                          parentMilestoneId={milestoneId}
                          taskLabels={task?.taskLabels ?? []}
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
                {(taskMembers?.value.totalCount ?? 0) > 0 ? (
                  <div className='space-y-1'>
                    <p className='text-sm font-semibold text-muted-foreground'>{t('common.ui.members')}</p>

                    <div className='flex items-center gap-1'>
                      {taskMembers?.value.items.map((member) => (
                        <Avatar key={member.userId} className='size-9'>
                          <AvatarImage src={member.avatar || ''} alt={`${member.firstName} ${member.lastName}`} />
                          <AvatarFallback>{getAvatarFallback(`${member.firstName} ${member.lastName}`)}</AvatarFallback>
                        </Avatar>
                      ))}

                      {projectId && taskId && milestoneId ? (
                        <AssigneePopover projectId={projectId} taskId={taskId} parentMilestoneId={milestoneId}>
                          <Button className='rounded-full size-9' size='icon' variant='secondary'>
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
                    <p className='text-sm font-semibold text-muted-foreground'>{t('common.ui.date')}</p>

                    <DatePopover onSubmit={handleSubmitTask(onSubmitUpdateTask)} onRemove={handleRemoveDate}>
                      <Button variant='secondary' size='sm'>
                        {task?.taskStartDate ? (
                          <p className='font-semibold'>
                            {format(new Date(task.taskStartDate), "HH:mm d 'thg' M, y", { locale: vi })}
                          </p>
                        ) : null}
                        {task?.taskEndDate ? <p className='font-semibold'>-</p> : null}
                        {task?.taskEndDate ? (
                          <p className='font-semibold'>
                            {format(new Date(task.taskEndDate), "HH:mm d 'thg' M, y", { locale: vi })}
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
                    {!isEditDescription && task?.taskDescription ? (
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
                          variant='outline'
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
                          role='button'
                          className={cn('overflow-hidden transition-all', !isDescriptionExpanded && 'max-h-96')}
                        >
                          <SanitizedHtml html={task.taskDescription} />
                        </div>
                        {/* Gradient overlay when collapsed - only covers the HTML area */}
                        {!isDescriptionExpanded && (
                          <div className='absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent pointer-events-none' />
                        )}
                      </div>

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
                    </div>
                  ) : (
                    <Textarea
                      placeholder={t('task.description.addDescription')}
                      className='resize-none w-full font-semibold'
                      readOnly
                      onClick={() => setIsEditDescription(true)}
                    />
                  )}
                </div>
              </div>

              {/* Attachments */}
              {(attachments?.value.totalCount ?? 0) > 0 && taskId && projectId && milestoneId ? (
                <AttachmentsSection
                  taskId={taskId}
                  projectId={projectId}
                  parentMilestoneId={milestoneId}
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
                      if (taskId && projectId && milestoneId) {
                        return (
                          <SortableParentSubtaskCard
                            key={subtask.id}
                            subtask={subtask}
                            projectId={projectId}
                            parentMilestoneId={milestoneId}
                            taskId={taskId}
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
                  {activeParentSubtask && taskId && projectId && milestoneId && (
                    <SortableParentSubtaskCard
                      isOverlay
                      subtask={activeParentSubtask}
                      projectId={projectId}
                      parentMilestoneId={milestoneId}
                      taskId={taskId}
                      editingSubtaskId={editingSubtaskId}
                      setEditingSubtaskId={setEditingSubtaskId}
                    />
                  )}
                  {activeChildSubtask && taskId && projectId && milestoneId && (
                    <SortableSubtaskCard
                      isOverlay
                      subtask={activeChildSubtask}
                      taskId={taskId}
                      projectId={projectId}
                      parentMilestoneId={milestoneId}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </FormProvider>

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
            ) : (
              <Input
                placeholder={t('task.comment.addComment')}
                className='font-semibold bg-background'
                readOnly
                onClick={() => setIsEditComment(true)}
              />
            )}

            {taskId && projectId && milestoneId ? (
              <div className='space-y-6 pb-6'>
                {comments?.value.items.map((comment) => (
                  <CommentCard
                    key={comment.commentId}
                    comment={comment}
                    taskId={taskId}
                    projectId={projectId}
                    parentMilestoneId={milestoneId}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
