import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircleQuestionMarkIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGetMyNotifications } from '../hooks/use-get-my-notifications'
import NotificationItem from './notification-item'

interface NotificationsPopoverProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NotificationsPopover({ children, open, onOpenChange }: NotificationsPopoverProps) {
  const { t } = useTranslation()
  const { notifications, isLoadingNotifications } = useGetMyNotifications({})

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align='end' side='bottom' className='min-w-sm p-0 gap-0'>
        <div className='p-2 flex items-center justify-between gap-2'>
          <p className='text-lg font-semibold pl-1'>{t('notification.popover.title')}</p>

          {/* TODO: need api */}
          <Button variant='link' size='sm'>
            <p className='text-xs'>{t('notification.popover.markAllAsRead')}</p>
          </Button>
        </div>

        <Separator />

        {isLoadingNotifications ? (
          <div className='flex flex-col gap-2 items-center justify-center p-2'>
            <Skeleton className='size-10 w-full' />
            <Skeleton className='size-10 w-full' />
            <Skeleton className='size-10 w-full' />
          </div>
        ) : notifications.value.totalCount === 0 ? (
          <div className='flex flex-col gap-2 items-center justify-center h-60'>
            <MessageCircleQuestionMarkIcon className='size-10 text-muted-foreground' />
            <p className='text-sm text-muted-foreground'>{t('notification.popover.description')}</p>
          </div>
        ) : (
          notifications.value.items.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}
