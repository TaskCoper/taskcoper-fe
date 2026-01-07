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
import CommentCard from '@/features/comments/components/comment-card'
import { useAddComment } from '@/features/comments/hooks/use-add-comment'
import { useGetComments } from '@/features/comments/hooks/use-get-comments'
import type { AddTaskCommentFormValues } from '@/features/comments/validations'
import LabelPopover from '@/features/labels/components/label-popover'
import ParentSubtaskCard from '@/features/subtasks/components/parent-subtask-card'
import SubtaskPopover from '@/features/subtasks/components/subtask-popover'
import { useGetSubtasks } from '@/features/subtasks/hooks/use-get-subtasks'
import DatePopover from '@/features/tasks/components/date-popover'
import { useGetTask } from '@/features/tasks/hooks/use-get-task'
import { useUpdateTask } from '@/features/tasks/hooks/use-update-task'
import { updateTaskSchema, type UpdateTaskFormValues } from '@/features/tasks/validations'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { cn, getAvatarFallback } from '@/shared/utils'
import type { Subtask, SubtaskWithChildren } from '@/types/subtask.type'
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

const transformSubtasks = (subtasks: Subtask[]): SubtaskWithChildren[] => {
  const map = new Map()

  subtasks.forEach((s) => {
    if (!map.has(s.id) && s.parentId === null) {
      map.set(s.id, {
        ...s,
        children: []
      })
    }
  })

  subtasks.forEach((s) => {
    if (map.has(s.parentId)) {
      map.get(s.parentId)?.children.push(s)
    }
  })

  return Array.from(map.values())
}

export default function TaskDetailDialogPage() {
  const navigate = useNavigate()

  const { t } = useTranslation()
  const { projectId, milestoneId, taskId } = useParams<{ projectId: string; milestoneId: string; taskId: string }>()

  const [isEditDescription, setIsEditDescription] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [open, setOpen] = useState(true)
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null)

  const { task, isLoadingTask } = useGetTask({ taskId })
  const { comments, isLoadingComments } = useGetComments({ taskId })
  const { subtasks, isLoadingSubtasks } = useGetSubtasks({ taskId })
  const { taskMembers, isLoadingTaskMembers } = useGetTaskMembers({ taskId })

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

  const groupedSubtasks = transformSubtasks(subtasks?.value.items || [])

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      navigate(`/projects/${projectId}/milestones/${milestoneId}`)
    }, 500)
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
        targetMilestoneId: task.milestoneId,
        announceBeforeMinutes: task.announceBeforeMinutes
      })
    }
  }, [open, task, resetTask])

  useEffect(() => {
    if (open && task) {
      resetComment({
        taskId: task.taskId,
        content: '',
        commentResources: []
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

  if (isLoadingTask || isLoadingComments || isLoadingSubtasks || isLoadingTaskMembers) {
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

            <Button className='rounded-full' variant='ghost' size='icon-sm'>
              <MoreHorizontalIcon />
            </Button>

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
                <Checkbox className={cn('rounded-full border-foreground', isEditingName ? 'mt-5' : 'mt-2')} />
                <div className='space-y-4'>
                  {isEditingName ? (
                    <Input className='text-3xl! font-bold w-full h-14' {...nameInputProps} />
                  ) : (
                    <p className='text-3xl font-bold cursor-text' {...nameTriggerProps}>
                      {task?.taskName}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className='flex items-center gap-2 flex-wrap'>
                    <LabelPopover>
                      <Button variant='outline' size='sm'>
                        <TagIcon />
                        {t('common.field.label')}
                      </Button>
                    </LabelPopover>
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
                    <AttachmentPopover>
                      <Button variant='outline' size='sm'>
                        <PaperclipIcon />
                        {t('task.attachment.attachment')}
                      </Button>
                    </AttachmentPopover>
                  </div>
                </div>
              </div>

              <div className='flex items-center flex-wrap gap-10 px-6'>
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
                <TextAlignStartIcon className='mt-1 size-4' />
                <div className='w-full space-y-4'>
                  <p className='font-semibold'>{t('common.field.description')}</p>

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
                          onClick={() => setIsEditDescription(true)}
                          className={cn(
                            'cursor-pointer hover:bg-muted overflow-hidden transition-all',
                            !isDescriptionExpanded && 'max-h-96'
                          )}
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

              {/* Subtasks */}
              <div className='mt-10 space-y-8'>
                {groupedSubtasks?.map((subtask) => {
                  if (taskId && projectId && milestoneId) {
                    return (
                      <ParentSubtaskCard
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
            </div>
          </FormProvider>

          <div className='col-span-5 p-6 bg-muted space-y-4 overflow-y-auto'>
            <div className='flex items-center gap-2'>
              <MessageSquareText className='size-4' />
              <p className='text-sm font-bold'>{t('task.comment.comment')}</p>
            </div>

            <Controller
              name='content'
              control={addCommentControl}
              render={({ field }) => (
                <Input
                  placeholder={t('task.comment.addComment')}
                  className='font-semibold bg-background'
                  {...field}
                  readOnly={isAddingComment}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmitComment(onSubmitAddComment)()
                    }
                  }}
                />
              )}
            />

            <div className='space-y-6'>
              {comments?.value.items.map((comment) => (
                <CommentCard key={comment.commentId} comment={comment} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
