import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { NotificationMarkedType } from '@/features/notifications/types'
import { ChevronDown, MessageCircleQuestionMarkIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGetMyNotifications } from '../hooks/use-get-my-notifications'
import { useGetUnreadCount } from '../hooks/use-get-unread-count'
import { useReadNotification } from '../hooks/use-read-notification'
import NotificationItem from './notification-item'

interface NotificationsPopoverProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NotificationsPopover({ children, open, onOpenChange }: NotificationsPopoverProps) {
  const { t } = useTranslation()

  const { unreadCount } = useGetUnreadCount()
  const { notifications, totalCount, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetMyNotifications({ enabled: open })
  const { readNotification, isReadingNotification } = useReadNotification()

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        sideOffset={8}
        align='end'
        side='bottom'
        className='w-100 p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
      >
        <div className='px-3 py-2 flex items-center justify-between'>
          <p className='text-lg font-semibold'>{t('notification.popover.title')}</p>
          <Button
            variant='link'
            size='sm'
            onClick={() => {
              if (unreadCount > 0) {
                readNotification({ markedType: NotificationMarkedType.All })
              }
            }}
            disabled={isReadingNotification || totalCount === 0}
          >
            <p className='text-xs'>
              {t('notification.popover.markAllAsRead')}
              {unreadCount > 0 && ` (${unreadCount})`}
            </p>
          </Button>
        </div>

        <Separator />

        <div className='max-h-100 overflow-y-auto flex flex-col'>
          {isLoading ? (
            <div className='flex flex-col gap-2 p-3'>
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
            </div>
          ) : totalCount === 0 ? (
            <div className='flex flex-col gap-2 items-center justify-center py-12 text-center'>
              <MessageCircleQuestionMarkIcon className='size-10 text-muted-foreground/50' />
              <p className='text-sm text-muted-foreground'>{t('notification.popover.description')}</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}

              {hasNextPage && (
                <div className='p-1 border-t bg-muted/20'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full'
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Spinner />
                        <p className='text-xs'>{t('common.ui.loading')}</p>
                      </>
                    ) : (
                      <>
                        <ChevronDown />
                        <p className='text-xs'>{t('common.ui.viewMore')}</p>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
