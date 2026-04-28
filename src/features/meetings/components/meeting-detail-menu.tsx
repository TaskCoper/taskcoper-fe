import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/shared/utils'
import { MeetingStatus } from '@/types/meeting.type'
import { differenceInHours } from 'date-fns'
import { CalendarClockIcon, ChevronLeftIcon, InfoIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCancelMeeting } from '../hooks/use-cancel-meeting'
import { useParams } from 'react-router'
import { useGetMyProjectPermissions } from '@/features/projects/hooks/use-get-my-project-permissions'

interface MeetingDetailMenuProps {
  meetingId: string
  mentorId: string
  packageId?: string
  status: MeetingStatus
  startTimeUtc?: string
  children: React.ReactNode
  onReschedule: () => void
  onCancelSuccess?: () => void
}

const MIN_HOURS_TO_CANCEL = 32

export default function MeetingDetailMenu({
  meetingId,
  status,
  mentorId,
  packageId,
  startTimeUtc,
  children,
  onReschedule,
  onCancelSuccess
}: MeetingDetailMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [reason, setReason] = useState('')

  const { cancelMeeting, isCancellingMeeting } = useCancelMeeting({ mentorId, packageId })
  const { identifier } = useParams<{ identifier: string }>()

  const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })

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

  const isWithinHours = startTimeUtc
    ? differenceInHours(new Date(startTimeUtc), new Date()) < MIN_HOURS_TO_CANCEL
    : false

  const canReschedule =
    status === MeetingStatus.BOOKED && !isWithinHours && check('CALENDAR', 'canUpdate', 'canRescheduleMeeting')
  const canCancel =
    status === MeetingStatus.BOOKED && !isWithinHours && check('CALENDAR', 'canDelete', 'canCancelMeeting')

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
                <ChevronLeftIcon />
              </Button>
              <p className='text-sm font-bold whitespace-nowrap'>{t('meeting.detail.cancelTitle')}</p>
              <Button variant='ghost' size='icon-sm' onClick={onClose} className='absolute right-0'>
                <XIcon />
              </Button>
            </div>

            <p className='text-xs text-muted-foreground'>{t('meeting.detail.cancelDescription')}</p>

            <div className='space-y-1'>
              <p className='text-xs font-medium'>{t('meeting.detail.cancelReasonLabel')}</p>
              <Textarea
                placeholder={t('meeting.detail.cancelReasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className='min-h-20 text-xs resize-none'
              />
            </div>

            <Button
              className='w-full'
              variant='destructive'
              disabled={!reason.trim() || isCancellingMeeting}
              onClick={handleCancelMeeting}
            >
              {isCancellingMeeting ? t('common.ui.loading') : t('meeting.detail.confirmCancel')}
            </Button>
          </div>
        ) : (
          <div className='py-2'>
            <div className='relative group'>
              <Button
                size='sm'
                className='w-full justify-start gap-2'
                variant='ghost'
                disabled={!canReschedule}
                onClick={() => {
                  onClose()
                  onReschedule()
                }}
              >
                <CalendarClockIcon />
                <p>{t('meeting.detail.reschedule')}</p>
              </Button>
              {isWithinHours && status === MeetingStatus.BOOKED && (
                <div className='absolute right-2 top-1/2 -translate-y-1/2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className='size-4 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent side='left' align='center'>
                      {t('meeting.detail.disabledActionTooltip')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <div className='relative group'>
              <Button
                size='sm'
                className='w-full justify-start gap-2'
                variant='ghost'
                disabled={!canCancel}
                onClick={() => setIsCancelling(true)}
              >
                <Trash2Icon className='text-destructive' />
                <p className='text-destructive'>{t('meeting.detail.cancel')}</p>
              </Button>
              {isWithinHours && status === MeetingStatus.BOOKED && (
                <div className='absolute right-2 top-1/2 -translate-y-1/2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className='size-4 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent side='left' align='center'>
                      {t('meeting.detail.disabledActionTooltip')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
