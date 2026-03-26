import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/shared/utils'
import { MeetingStatus } from '@/types/meeting.type'
import { CalendarClockIcon, ChevronLeftIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCancelMeeting } from '../hooks/use-cancel-meeting'

interface MeetingDetailMenuProps {
  meetingId: string
  status: MeetingStatus
  children: React.ReactNode
  onReschedule: () => void
  onCancelSuccess?: () => void
}

export default function MeetingDetailMenu({
  meetingId,
  status,
  children,
  onReschedule,
  onCancelSuccess
}: MeetingDetailMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [reason, setReason] = useState('')

  const { cancelMeeting, isCancellingMeeting } = useCancelMeeting()

  const handleCancelMeeting = () => {
    if (!reason.trim()) return

    cancelMeeting(
      { meetingId, reason },
      {
        onSuccess: () => {
          onClose()
          onCancelSuccess?.()
        }
      }
    )
  }

  const onClose = () => {
    setOpen(false)
    setTimeout(() => {
      setIsCancelling(false)
      setReason('')
    }, 300)
  }

  const canReschedule = status === MeetingStatus.BOOKED
  const canCancel = status === MeetingStatus.BOOKED

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn('p-0', isCancelling ? 'w-80' : 'w-52')}
        side='bottom'
        align='end'
        sideOffset={8}
        onInteractOutside={onClose}
      >
        {isCancelling ? (
          <div className='p-3 space-y-3'>
            <div className='flex items-center justify-center relative mt-1'>
              <Button variant='ghost' size='icon-sm' onClick={() => setIsCancelling(false)} className='absolute left-0'>
                <ChevronLeftIcon className='size-4' />
              </Button>
              <p className='text-sm font-bold whitespace-nowrap'>{t('meeting.detail.cancelTitle')}</p>
              <Button variant='ghost' size='icon-sm' onClick={onClose} className='absolute right-0'>
                <XIcon className='size-4' />
              </Button>
            </div>

            <p className='text-xs text-muted-foreground'>{t('meeting.detail.cancelDescription')}</p>

            <div className='space-y-1.5'>
              <p className='text-xs font-medium'>{t('meeting.detail.cancelReasonLabel')}</p>
              <Textarea
                placeholder={t('meeting.detail.cancelReasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className='min-h-[80px] text-xs'
              />
            </div>

            <Button
              className='w-full'
              variant='destructive'
              size='sm'
              disabled={!reason.trim() || isCancellingMeeting}
              onClick={handleCancelMeeting}
            >
              {isCancellingMeeting ? t('common.ui.loading') : t('meeting.detail.confirmCancel')}
            </Button>
          </div>
        ) : (
          <div className='py-2'>
            <Button
              size='sm'
              className='w-full justify-start gap-2 rounded-none'
              variant='ghost'
              disabled={!canReschedule}
              onClick={() => {
                onClose()
                onReschedule()
              }}
            >
              <CalendarClockIcon className='size-4' />
              <p>{t('meeting.detail.reschedule')}</p>
            </Button>

            <Button
              size='sm'
              className='w-full justify-start gap-2 rounded-none'
              variant='ghost'
              disabled={!canCancel}
              onClick={() => setIsCancelling(true)}
            >
              <Trash2Icon className='size-4 text-destructive' />
              <p className='text-destructive'>{t('meeting.detail.cancel')}</p>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
