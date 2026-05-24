import RichTextEditor from '@/components/rich-text-editor'
import SanitizedHtml from '@/components/sanitized-html'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useDateFormat } from '@/lib/date'
import { cn, getAvatarFallback } from '@/shared/utils'
import { XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useGetMyProjectPermissions } from '../../../roles/hooks/use-get-my-project-permissions'
import { useDeleteTaskComment } from '../hooks/use-delete-task-comment'
import { useUpdateTaskComment } from '../hooks/use-update-task-comment'
import type { Comment } from '../types'
import type { UpdateTaskCommentFormValues } from '../validations'

interface CommentCardProps {
  comment: Comment
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
}

const taskLogContent: Record<string, string> = {
  FileAddedToTaskActivity: 'activities.FileAddedToTaskActivity',
  FileAddedToTaskCommentActivity: 'activities.FileAddedToTaskCommentActivity',
  FileUpdatedInTaskActivity: 'activities.FileUpdatedInTaskActivity',
  FileRemovedInTaskActivity: 'activities.FileRemovedInTaskActivity',
  TaskUpdatedActivity: 'activities.TaskUpdatedActivity',
  TaskCreatedActivity: 'activities.TaskCreatedActivity',
  TaskMovedInTaskActivity: 'activities.TaskMovedInTaskActivity',
  TaskMarkedInTaskActivity: 'activities.TaskMarkedInTaskActivity',
  TaskUnMarkedInTaskActivity: 'activities.TaskUnMarkedInTaskActivity',
  UserAddedToTaskActivity: 'activities.UserAddedToTaskActivity',
  UserRemovedInTaskActivity: 'activities.UserRemovedInTaskActivity',
  SubTaskAddedToTaskActivity: 'activities.SubTaskAddedToTaskActivity',
  SubtaskUpdatedInTaskActivity: 'activities.SubtaskUpdatedInTaskActivity',
  SubtaskDeletedInTaskActivity: 'activities.SubtaskDeletedInTaskActivity',
  LabelAddedToTaskActivity: 'activities.LabelAddedToTaskActivity',
  LabelDeletedToTaskActivity: 'activities.LabelDeletedToTaskActivity'
}

export default function CommentCard({
  comment,
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier
}: CommentCardProps) {
  const { t } = useTranslation()
  const { formatRelative } = useDateFormat()
  const { me: user } = useGetMe()
  const [isEditComment, setIsEditComment] = useState(false)
  const [isDeleteComment, setIsDeleteComment] = useState(false)

  const { check } = useGetMyProjectPermissions({ projectIdentifier })
  const canDelete = check('TASKS', 'canDelete')
  const canUpdate = check('TASKS', 'canUpdate')

  const { methods, updateTaskComment, isUpdatingTaskComment } = useUpdateTaskComment()
  const { deleteTaskComment, isDeletingTaskComment } = useDeleteTaskComment({
    projectIdentifier,
    parentMilestoneIdentifier
  })

  const { control, reset, handleSubmit } = methods

  const onSubmit: SubmitHandler<UpdateTaskCommentFormValues> = (body) => {
    setIsEditComment(false)
    updateTaskComment({ body })
  }

  const onClose = () => {
    setIsDeleteComment(false)
  }

  useEffect(() => {
    if (isEditComment) {
      reset({
        content: comment.content,
        commentId: comment.commentId,
        taskId,
        mentionUsers: comment.mentionedUsers.map((user) => ({ userId: user.userId, mentionId: user.id }))
      })
    }
  }, [isEditComment, reset, comment, taskId])

  if (comment.isTaskLog) {
    return (
      <div className='flex items-start gap-2'>
        <Avatar>
          <AvatarImage src={comment.avatar || ''} />
          <AvatarFallback>{getAvatarFallback(`${comment.firstName} ${comment.lastName}`)}</AvatarFallback>
        </Avatar>

        <div className='w-full'>
          <p className='text-sm text-foreground/70 truncate'>
            <span className='font-semibold text-foreground'>
              {comment.firstName} {comment.lastName}
            </span>{' '}
            {t(taskLogContent[comment.content])}
          </p>
          <p className='text-xs font-normal underline text-primary truncate'>{formatRelative(comment.createdAt)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex items-start gap-2'>
      <Avatar>
        <AvatarImage src={comment.avatar || ''} />
        <AvatarFallback>{getAvatarFallback(`${comment.firstName} ${comment.lastName}`)}</AvatarFallback>
      </Avatar>

      <div className='space-y-1 w-full'>
        <div className='flex items-baseline gap-2'>
          <p className='text-sm font-semibold truncate'>
            {comment.firstName} {comment.lastName}
          </p>
          <p className='text-xs font-normal underline text-primary truncate'>{formatRelative(comment.createdAt)}</p>
        </div>

        {isEditComment ? (
          <div className='space-y-2'>
            <Controller
              name='content'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <RichTextEditor
                    isInitialFocus={true}
                    content={field.value ?? ''}
                    onChange={field.onChange}
                    onMentionIdsChange={(ids) => {
                      const mentionIdQueues = comment.mentionedUsers.reduce<Record<string, string[]>>((acc, user) => {
                        if (!acc[user.userId]) acc[user.userId] = []
                        acc[user.userId].push(user.id)
                        return acc
                      }, {})

                      methods.setValue(
                        'mentionUsers',
                        ids.map((userId) => ({
                          userId,
                          mentionId: mentionIdQueues[userId]?.shift() ?? null
                        })),
                        { shouldDirty: true }
                      )
                    }}
                    compact
                    projectIdentifier={projectIdentifier}
                    mentionedUsers={comment.mentionedUsers}
                  />
                </Field>
              )}
            />

            <div className='flex items-center gap-2'>
              <Button
                onClick={() => {
                  setIsEditComment(false)
                  handleSubmit(onSubmit)()
                }}
                disabled={isUpdatingTaskComment || !methods.formState.isDirty}
              >
                {methods.formState.isSubmitting ? <Spinner /> : null}
                {t('common.button.save')}
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditComment(false)
                  reset()
                }}
                disabled={isUpdatingTaskComment}
              >
                {t('common.button.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <Card className='px-3 py-2 shadow-xs rounded-lg w-full'>
            <SanitizedHtml html={comment.content} mentionedUsers={comment.mentionedUsers} />
          </Card>
        )}

        {comment.userId === user?.id && !isEditComment ? (
          <div className='flex items-center gap-2'>
            {canUpdate ? (
              <p
                className='text-xs text-muted-foreground cursor-pointer underline'
                role='button'
                onClick={() => setIsEditComment(true)}
              >
                {t('common.button.edit')}
              </p>
            ) : null}

            {canDelete ? (
              <Popover open={isDeleteComment} onOpenChange={setIsDeleteComment}>
                <PopoverTrigger>
                  <p
                    className={cn(
                      'text-xs text-muted-foreground cursor-pointer underline',
                      isDeleteComment && 'text-destructive'
                    )}
                    role='button'
                  >
                    {t('common.button.delete')}
                  </p>
                </PopoverTrigger>

                <PopoverContent className='p-0' side='bottom' align='start' sideOffset={8} onInteractOutside={onClose}>
                  <div className='p-3 space-y-2'>
                    <div className='flex items-center justify-center relative mt-1'>
                      <p className='text-sm font-bold whitespace-nowrap'>{t('task.comment.deleteComment.title')}</p>
                      <Button variant='ghost' size='icon-sm' onClick={onClose} className='absolute right-0'>
                        <XIcon />
                      </Button>
                    </div>

                    <p className='text-sm text-muted-foreground'>{t('task.comment.deleteComment.description')}</p>

                    <Button
                      variant='destructive'
                      className='w-full'
                      disabled={isDeletingTaskComment}
                      onClick={() => {
                        deleteTaskComment({ commentId: comment.commentId, taskId })
                        onClose()
                      }}
                    >
                      {t('task.comment.deleteComment.confirmText')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
