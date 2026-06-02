import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import CommentCard from '@/features/projects/tasks/comments/components/comment-card'
import { useAddTaskComment } from '@/features/projects/tasks/comments/hooks/use-add-task-comment'
import type { Comment } from '@/features/projects/tasks/comments/types'
import type { AddTaskCommentFormValues } from '@/features/projects/tasks/comments/validations'
import type { BasePaginationResponse } from '@/lib/axios'
import { cn } from '@/shared/utils'
import { MessageSquareText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface TaskDialogCommentsProps {
  taskId: string | undefined
  identifier: string | undefined
  milestoneIdentifier: string | undefined
  canWrite: boolean
  comments: BasePaginationResponse<Comment> | null | undefined
}

export default function TaskDialogComments({
  taskId,
  identifier,
  milestoneIdentifier,
  canWrite,
  comments
}: TaskDialogCommentsProps) {
  const { t } = useTranslation()
  const [isEditComment, setIsEditComment] = useState(false)

  const {
    methods: addCommentMethods,
    addTaskComment,
    isAddingTaskComment
  } = useAddTaskComment({ taskId, identifier, milestoneIdentifier })
  const { reset: resetComment, control: addCommentControl, handleSubmit: handleSubmitComment } = addCommentMethods

  useEffect(() => {
    if (taskId) {
      resetComment({
        taskId,
        content: '',
        mentionUsers: []
      })
    }
  }, [taskId, resetComment])

  const onSubmitAddComment: SubmitHandler<AddTaskCommentFormValues> = (body) => {
    addTaskComment({ body })
  }

  return (
    <div className='col-span-5 p-5 bg-muted space-y-4 overflow-y-auto shadow-[inset_-4px_0_4px_-4px_var(--task-dialog-inset-shadow-color),inset_0_-4px_4px_-4px_var(--task-dialog-inset-shadow-color)] rounded-br-3xl'>
      <div className='flex items-center gap-2'>
        <MessageSquareText className='size-4' />
        <p className='text-sm font-bold truncate'>{t('task.comment.comment')}</p>
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
              disabled={isAddingTaskComment}
            >
              {isAddingTaskComment ? <Spinner /> : null}
              {t('common.button.save')}
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                setIsEditComment(false)
                resetComment()
              }}
              disabled={isAddingTaskComment}
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

      {taskId && identifier && milestoneIdentifier ? (
        <div className='space-y-6 pb-6'>
          {comments?.value.items.map((comment) => (
            <CommentCard
              key={comment.commentId}
              comment={comment}
              taskId={taskId}
              projectIdentifier={identifier}
              parentMilestoneIdentifier={milestoneIdentifier}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
