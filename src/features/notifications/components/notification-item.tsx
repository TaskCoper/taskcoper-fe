import { Button } from '@/components/ui/button'
import { useDateFormat } from '@/lib/date'
import { cn } from '@/shared/utils'
import { useTranslation } from 'react-i18next'
import { useRespondToInvitation } from '../../projects/members/hooks/use-respond-to-invitation'
import { useReadNotification } from '../hooks/use-read-notification'
import { NotificationMarkedType, NotificationTypeLabel, type Notification } from '../types'

interface NotificationItemProps {
  notification: Notification
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const { t } = useTranslation()
  const { formatRelative } = useDateFormat()
  const { respondToInvitation, isRespondingToInvitation } = useRespondToInvitation()
  const { readNotification, isReadingNotification } = useReadNotification()

  const payload = JSON.parse(notification.payloadJson) as {
    Action: {
      agree: string
      reject: string
    }
    ProjectId: string
    ProjectManagementId: string
    Type: string
  }

  const onRespond = (isAccepted: boolean) => {
    respondToInvitation({
      projectId: payload.ProjectId,
      notificationId: notification.id,
      isAccepted
    })
  }

  return (
    <div
      role='button'
      onClick={() => {
        if (!notification.isRead) {
          readNotification({ notificationId: notification.id, markedType: NotificationMarkedType.Single })
        }
      }}
      className={cn(
        'space-y-1 relative p-3 hover:bg-blue-50/50 cursor-pointer last:rounded-b-md',
        isReadingNotification && 'opacity-50 pointer-events-none'
      )}
    >
      {!notification.isRead && <div className='absolute top-3 right-3 size-2 rounded-full bg-primary' />}

      <div>
        <div>
          <p className='text-sm font-medium truncate w-[95%]'>{notification.title}</p>
          <p className='text-xs text-muted-foreground truncate'>{notification.message}</p>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <p className='text-xs text-muted-foreground/80'>{t(NotificationTypeLabel[notification.notificationType])}</p>
        <div className='size-1 bg-muted-foreground/50 rounded-full' />
        <p className='text-xs text-muted-foreground/80'>{formatRelative(notification.createdAt)}</p>
      </div>

      {!notification.isInteract && payload ? (
        <div className='flex items-center gap-2 mt-2'>
          <Button
            variant='secondary'
            size='sm'
            className='h-7'
            onClick={() => onRespond(false)}
            disabled={isRespondingToInvitation}
          >
            {t('common.button.decline')}
          </Button>

          <Button size='sm' className='h-7' onClick={() => onRespond(true)} disabled={isRespondingToInvitation}>
            {t('common.button.accept')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
