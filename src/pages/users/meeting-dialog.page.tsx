import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetMeeting } from '@/features/meetings/hooks/use-get-meeting'
import { getMeetingStatusTheme } from '@/features/meetings/utils'
import { cn, getAvatarFallback } from '@/shared/utils'
import { MeetingStatus, MeetingStatusLabel } from '@/types/meeting.type'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { format } from 'date-fns'
import {
  ArrowDown01Icon,
  CalendarIcon,
  CheckCircle2Icon,
  FolderOpenIcon,
  HistoryIcon,
  InfoIcon,
  PackageIcon,
  TextAlignStartIcon,
  VideoIcon,
  XCircleIcon
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

const getTimezoneString = () => {
  const date = new Date()
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const gmt = `(GMT${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')})`

  const timeZoneName =
    new Intl.DateTimeFormat('vi-VN', { timeZoneName: 'long' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value || ''

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const city = tz.split('/').pop()?.replace(/_/g, ' ') || tz
  const location = city === 'Ho Chi Minh' ? 'TP Hồ Chí Minh' : city

  return `${gmt} ${timeZoneName} - ${location}`
}

const getStatusIcon = (status: MeetingStatus) => {
  switch (status) {
    case MeetingStatus.COMPLETED:
      return <CheckCircle2Icon className='size-3.5' />
    case MeetingStatus.BOOKED:
      return <CalendarIcon className='size-3.5' />
    case MeetingStatus.RESCHEDULE:
      return <HistoryIcon className='size-3.5' />
    case MeetingStatus.CANCELLED:
    case MeetingStatus.SUSPENDED:
      return <XCircleIcon className='size-3.5' />
    default:
      return <InfoIcon className='size-3.5' />
  }
}

export default function MeetingDialogPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)
  const { me } = useGetMe()
  const { meetingId } = useParams()
  const { meeting, isLoadingMeeting } = useGetMeeting({ meetingId })
  const { t } = useTranslation()

  if (isLoadingMeeting) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='min-w-6xl p-0 border-none overflow-hidden' position='top-center'>
          <DialogHeader className='space-y-1 p-6 bg-muted'>
            <Skeleton className='h-8 w-1/3' />
            <div className='flex items-center gap-2 mt-2'>
              <Skeleton className='h-9 w-32' />
              <Skeleton className='h-9 w-24' />
              <Skeleton className='h-9 w-24' />
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      navigate(-1)
    }, 300)
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
        className='min-w-6xl p-0 border-none overflow-hidden gap-0'
        position='top-center'
        showCloseButton={false}
      >
        <DialogHeader
          className={cn(
            'px-6 py-4 transition-colors space-y-1',
            getMeetingStatusTheme(meeting?.status).block.includes('bg-')
              ? getMeetingStatusTheme(meeting?.status).block
              : 'bg-primary text-white'
          )}
        >
          <VisuallyHidden>
            <DialogDescription>
              {meeting?.projectId && meeting?.project ? `[${meeting.project.name}] - ` : null}
              {t('meeting.detail.meetingWith')} {meeting?.mentor.firstName} {meeting?.mentor.lastName}
            </DialogDescription>
          </VisuallyHidden>

          <DialogTitle className='text-xl'>
            {meeting?.projectId && meeting?.project ? (
              <>
                <Link to={`/projects/${meeting.projectId}`} className='hover:text-white/80 transition-colors'>
                  [{meeting.project.name}]
                </Link>
                <span className='mx-1'> - </span>
              </>
            ) : null}

            {meeting?.packageBookingId ? (
              <span>
                {t('meeting.detail.session', { sequence: meeting.packageSequence })} -{' '}
                <Link
                  to={`/purchases/packages/${meeting.packageBookingId}`}
                  className='hover:text-white/80 transition-colors underline-offset-4'
                >
                  {meeting.packageName}
                </Link>
              </span>
            ) : (
              <span>
                {t('meeting.detail.meetingWith')}{' '}
                <Link
                  to={`/users/${meeting?.mentorUserId}`}
                  className='hover:text-white/80 transition-colors underline-offset-4'
                >
                  {meeting?.mentor.firstName} {meeting?.mentor.lastName}
                </Link>
              </span>
            )}
          </DialogTitle>

          <div className='flex items-center gap-2'>
            <p className='px-3 py-2 bg-white/20 rounded-md text-sm text-white font-medium backdrop-blur-sm'>
              {meeting?.startTimeUtc ? format(new Date(meeting.startTimeUtc), t('meeting.detail.dateFormat')) : '-'}
            </p>
            <p className='px-3 py-2 bg-white/20 rounded-md text-sm text-white font-medium backdrop-blur-sm'>
              {meeting?.startTimeUtc ? format(new Date(meeting.startTimeUtc), 'h:mm a') : '-'}
            </p>
            <p className='text-sm text-white/80 font-medium px-1'>{t('meeting.detail.to')}</p>
            <p className='px-3 py-2 bg-white/20 rounded-md text-sm text-white font-medium backdrop-blur-sm'>
              {meeting?.endTimeUtc ? format(new Date(meeting.endTimeUtc), 'h:mm a') : '-'}
            </p>
            <p className='text-sm text-white/80 ml-2'>{getTimezoneString()}</p>
          </div>
        </DialogHeader>

        <div className='p-6 grid grid-cols-12 gap-8'>
          <div className='col-span-8 space-y-6'>
            <div className='flex items-center gap-4'>
              <VideoIcon className='size-4' />
              <div className='-space-y-1'>
                <Link
                  to={meeting?.meetingLink || ''}
                  target='_blank'
                  className='hover:underline text-primary hover:text-primary'
                >
                  <p className='text-sm font-medium'>{t('meeting.detail.joinViaGoogleMeet')}</p>
                </Link>
                {meeting?.meetingLink ? (
                  <p className='text-xs text-foreground/80'>
                    {meeting.meetingLink.replace('https://', '')} {t('meeting.detail.maxGuests')}
                  </p>
                ) : (
                  <p className='text-xs'>{t('meeting.detail.noLinkYet')}</p>
                )}
              </div>
            </div>

            <div className='flex items-start gap-4'>
              <TextAlignStartIcon className='size-4 mt-1.5' />
              <div className='bg-muted w-full h-32 p-3 rounded-md'>
                {meeting?.note ? (
                  <p className='text-sm text-muted-foreground'>{meeting.note}</p>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    {t('meeting.detail.noteWillBeHere', {
                      firstName: meeting?.mentor?.firstName,
                      lastName: meeting?.mentor?.lastName
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='col-span-4 space-y-6'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-sm font-medium'>{t('meeting.detail.status')}</p>
              {meeting?.status ? (
                <Badge
                  variant='outline'
                  className={cn(
                    'px-2 py-0.5 border rounded-md flex items-center gap-1.5 font-medium',
                    getMeetingStatusTheme(meeting.status).badge
                  )}
                >
                  {getStatusIcon(meeting.status)}
                  {t(MeetingStatusLabel[meeting.status])}
                </Badge>
              ) : (
                <p className='text-xs font-semibold truncate'>-</p>
              )}
            </div>

            <div className='space-y-2.5'>
              <div>
                <p className='text-sm font-medium'>{t('meeting.detail.information')}</p>
              </div>

              <div className='space-y-2'>
                {meeting?.projectId && meeting.project ? (
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <FolderOpenIcon className='size-4' />
                      <p className='text-xs font-medium'>{t('meeting.detail.belongsToProject')}</p>
                    </div>

                    <Link
                      to={`/projects/${meeting?.projectId}/info`}
                      className='hover:text-primary hover:underline w-[60%] text-right'
                    >
                      <p className='text-xs font-semibold truncate'>{meeting?.project?.name}</p>
                    </Link>
                  </div>
                ) : null}

                {meeting?.packageBookingId ? (
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <PackageIcon className='size-4' />
                      <p className='text-xs font-medium'>{t('meeting.detail.belongsToPackage')}</p>
                    </div>

                    <Link
                      to={`/purchases/packages/${meeting?.packageBookingId}`}
                      className='hover:text-primary hover:underline w-[60%] text-right'
                    >
                      <p className='text-xs font-semibold truncate'>{meeting?.packageName}</p>
                    </Link>
                  </div>
                ) : null}

                {meeting?.packageBookingId ? (
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <ArrowDown01Icon className='size-4' />
                      <p className='text-xs font-medium'>{t('meeting.detail.sessionSequence')}</p>
                    </div>

                    <Link
                      to={`/purchases/packages/${meeting?.packageBookingId}`}
                      className='hover:text-primary hover:underline w-[60%] text-right'
                    >
                      <p className='text-xs font-semibold truncate'>
                        {t('meeting.detail.session', { sequence: meeting?.packageSequence })}
                      </p>
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>

            <div className='space-y-2.5'>
              <p className='text-sm font-medium'>{t('meeting.detail.mentor')}</p>

              <Link to={`/users/${meeting?.mentorUserId}`} className='flex items-center gap-2'>
                <Avatar className='ring-2 ring-primary ring-offset-2'>
                  <AvatarImage className='hover:brightness-90' src={meeting?.mentor.avatarUrl ?? undefined} />
                  <AvatarFallback>
                    {getAvatarFallback(`${meeting?.mentor.firstName} ${meeting?.mentor.lastName}`)}
                  </AvatarFallback>
                </Avatar>

                <div className='-space-y-0.5'>
                  <p className='text-sm font-medium'>
                    {meeting?.mentor.firstName} {meeting?.mentor.lastName}
                  </p>
                  <p className='text-xs text-muted-foreground'>{meeting?.mentor.email}</p>
                </div>
              </Link>
            </div>

            <div className='space-y-2.5'>
              <p className='text-sm font-medium'>{t('meeting.detail.participants')}</p>

              {meeting?.projectId && meeting.project ? (
                meeting.project.members.map((member) => (
                  <Link to={`/users/${member.userId}`} className='flex items-center gap-2' key={member.userId}>
                    <Avatar>
                      <AvatarImage src={member.avatarUrl ?? undefined} className='hover:brightness-90' />
                      <AvatarFallback>{getAvatarFallback(`${member.firstName} ${member.lastName}`)}</AvatarFallback>
                    </Avatar>

                    <div className='-space-y-0.5'>
                      <p className='text-sm font-medium'>
                        {member.firstName} {member.lastName}
                      </p>
                      <p className='text-xs text-muted-foreground'>{member.email}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <Link to={`/users/${me?.id}`} className='flex items-center gap-2'>
                  <Avatar>
                    <AvatarImage src={me?.avatar ?? undefined} className='hover:brightness-90' />
                    <AvatarFallback>{getAvatarFallback(`${me?.firstName} ${me?.lastName}`)}</AvatarFallback>
                  </Avatar>

                  <div className='-space-y-0.5'>
                    <p className='text-sm font-medium'>
                      {me?.firstName} {me?.lastName}
                    </p>
                    <p className='text-xs text-muted-foreground'>{me?.email}</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
