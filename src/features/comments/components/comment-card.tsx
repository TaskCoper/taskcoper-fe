import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { DATE_LOCALES } from '@/shared/constants'
import { getAvatarFallback } from '@/shared/utils'
import type { Comment } from '@/types/comment.type'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

interface CommentCardProps {
  comment: Comment
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

export default function CommentCard({ comment }: CommentCardProps) {
  const { t, i18n } = useTranslation()

  const currentLocale = DATE_LOCALES[i18n.language] || enUS

  if (comment.isTaskLog) {
    return (
      <div className='flex items-start gap-2'>
        <Avatar>
          <AvatarImage src={comment.avatar || ''} />
          <AvatarFallback>{getAvatarFallback(`${comment.firstName} ${comment.lastName}`)}</AvatarFallback>
        </Avatar>

        <div className='w-full'>
          <p className='text-sm text-foreground/70'>
            <span className='font-semibold text-foreground'>
              {comment.firstName} {comment.lastName}
            </span>{' '}
            {t(taskLogContent[comment.content])}
          </p>
          <p className='text-xs font-normal underline text-primary'>
            {formatDistanceToNow(comment.createdAt, { locale: currentLocale, addSuffix: true })}
          </p>
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
          <p className='text-sm font-semibold'>
            {comment.firstName} {comment.lastName}
          </p>
          <p className='text-xs font-normal underline text-primary'>
            {formatDistanceToNow(comment.createdAt, { locale: currentLocale, addSuffix: true })}
          </p>
        </div>
        <Card className='px-3 py-2 shadow-xs rounded-lg w-full'>
          <p className='text-sm'>{comment.content}</p>
        </Card>
      </div>
    </div>
  )
}
