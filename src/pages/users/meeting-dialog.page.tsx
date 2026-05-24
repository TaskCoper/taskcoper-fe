import RichTextEditor from '@/components/rich-text-editor'
import SanitizedHtml from '@/components/sanitized-html'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import MeetingDetailMenu from '@/features/meetings/components/meeting-detail-menu'
import { useCompleteMeeting } from '@/features/meetings/hooks/use-complete-meeting'
import { useGetMeeting } from '@/features/meetings/hooks/use-get-meeting'
import { useUpdateMeeting } from '@/features/meetings/hooks/use-update-meeting'
import { MeetingStatus, MeetingStatusLabel, type MeetingDetail } from '@/features/meetings/types'
import { getMeetingStatusTheme } from '@/features/meetings/utils'
import type { UpdateMeetingFormValues } from '@/features/meetings/validations'
import MentorScheduleDialog from '@/features/schedules/components/mentor-schedule-dialog'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { useDateFormat } from '@/lib/date'
import { cn, getAvatarFallback } from '@/shared/utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  ArrowDown01Icon,
  CalendarIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  CircleXIcon,
  FolderOpenIcon,
  InfoIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PencilIcon,
  TextAlignStartIcon,
  VideoIcon,
  XCircleIcon
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import type { SelectedTimeSlot } from './purchased-package.page'

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
    // case MeetingStatus.RESCHEDULE:
    //   return <HistoryIcon className='size-3.5' />
    case MeetingStatus.CANCELLED:
      // case MeetingStatus.SUSPENDED:
      return <XCircleIcon className='size-3.5' />
    default:
      return <InfoIcon className='size-3.5' />
  }
}

const normalizeMeetingLink = (value: string) => {
  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

interface MeetingNoteAndLinkProps {
  meeting: MeetingDetail
  canUpdateMeeting: boolean
}

function MeetingNoteAndLink({ meeting, canUpdateMeeting }: MeetingNoteAndLinkProps) {
  const { t } = useTranslation()
  const { updateMeeting } = useUpdateMeeting({
    packageId: meeting.packageBookingId ?? undefined,
    mentorId: meeting.mentorUserId,
    showSuccessToast: false
  })
  const [noteValue, setNoteValue] = useState(meeting.note ?? '')
  const [savedNote, setSavedNote] = useState(meeting.note ?? '')
  const [meetingLinkValue, setMeetingLinkValue] = useState(meeting.meetingLink ?? '')

  const submitMeetingUpdate = useCallback(
    (nextNote: string, nextLink: string) => {
      if (!canUpdateMeeting) return

      const normalizedNote = nextNote ?? ''
      const normalizedLink = normalizeMeetingLink(nextLink)
      const currentNote = meeting.note ?? ''
      const currentLink = meeting.meetingLink ?? null

      if (normalizedNote === currentNote && normalizedLink === currentLink) return

      const payload: UpdateMeetingFormValues = {
        meetingId: meeting.id,
        startTimeUtc: meeting.startTimeUtc,
        endTimeUtc: meeting.endTimeUtc,
        reason: meeting.reason ?? '',
        note: normalizedNote,
        meetingLink: normalizedLink
      }

      updateMeeting({ body: payload })
    },
    [canUpdateMeeting, meeting, updateMeeting]
  )

  const debouncedUpdateMeetingLink = useDebouncedCallback((nextLink: string) => {
    submitMeetingUpdate(savedNote, nextLink)
  }, 3000)

  const {
    isEditing: isEditingLink,
    inputProps: meetingLinkInputProps,
    triggerProps: meetingLinkTriggerProps
  } = useInlineEdit({
    initialValue: meetingLinkValue,
    allowEmpty: true,
    onSave: (nextValue) => {
      setMeetingLinkValue(nextValue)
      debouncedUpdateMeetingLink(nextValue)
    }
  })

  const handleNoteChange = (nextNote: string) => {
    setNoteValue(nextNote)
  }

  const isNoteDirty = noteValue !== savedNote

  const handleNoteSave = () => {
    if (!isNoteDirty) return
    submitMeetingUpdate(noteValue, meetingLinkValue)
    setSavedNote(noteValue)
  }

  const handleNoteCancel = () => {
    setNoteValue(savedNote)
  }

  return (
    <>
      <div className='flex items-center gap-4'>
        <VideoIcon className='size-4' />
        <div className='flex-1 -space-y-1'>
          <div className='flex items-center justify-between gap-2'>
            {meetingLinkValue ? (
              <Link to={meetingLinkValue} target='_blank' className='hover:underline text-primary hover:text-primary'>
                <p className='text-sm font-medium'>{t('meeting.detail.joinViaGoogleMeet')}</p>
              </Link>
            ) : (
              <p className='hover:underline text-primary hover:text-primary text-sm font-medium'>
                {t('meeting.detail.joinViaGoogleMeet')}
              </p>
            )}

            {canUpdateMeeting ? (
              <Button variant='ghost' size='icon-sm' className='size-7' type='button' {...meetingLinkTriggerProps}>
                <PencilIcon className='size-3.5' />
              </Button>
            ) : null}
          </div>

          {isEditingLink && canUpdateMeeting ? (
            <Input className='h-8 text-xs' type='text' {...meetingLinkInputProps} />
          ) : meetingLinkValue ? (
            <p className='text-xs text-foreground/80'>
              {meetingLinkValue.replace('https://', '')} {t('meeting.detail.maxGuests')}
            </p>
          ) : (
            <p className='text-xs'>{t('meeting.detail.noLinkYet')}</p>
          )}
        </div>
      </div>

      <div className='flex items-start gap-4'>
        <TextAlignStartIcon className='size-4 mt-1.5' />
        {canUpdateMeeting ? (
          <div className='flex-1'>
            <RichTextEditor
              content={noteValue}
              onChange={handleNoteChange}
              compact
              className='min-h-32 max-h-72 text-sm'
            />
            <div className='flex items-center gap-2 mt-2'>
              <Button type='button' onClick={handleNoteSave} disabled={!isNoteDirty}>
                {t('common.button.save')}
              </Button>
              <Button type='button' variant='ghost' onClick={handleNoteCancel} disabled={!isNoteDirty}>
                {t('common.button.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className='bg-muted w-full min-h-32 p-3 rounded-md'>
            {meeting.note ? (
              <SanitizedHtml html={meeting.note} />
            ) : (
              <p className='text-sm text-muted-foreground'>
                {t('meeting.detail.noteWillBeHere', {
                  firstName: meeting.mentor?.firstName,
                  lastName: meeting.mentor?.lastName
                })}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default function MeetingDialogPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)

  const { meetingId } = useParams<{ meetingId: string }>()
  const { meeting, isLoadingMeeting } = useGetMeeting({ meetingId })
  const { completeMeeting, isCompletingMeeting } = useCompleteMeeting({
    mentorId: meeting?.mentorUserId
  })
  const { me } = useGetMe()

  const { t } = useTranslation()
  const { formatDate, formatTime } = useDateFormat()
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<SelectedTimeSlot[]>([])

  const canUpdateMeeting =
    meeting?.mentorUserId === me?.id &&
    meeting?.status !== MeetingStatus.CANCELLED &&
    meeting?.status !== MeetingStatus.COMPLETED

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      navigate(-1)
    }, 300)
  }

  const canCompleteMeeting =
    meeting?.status === MeetingStatus.BOOKED &&
    meeting?.mentorUserId === me?.id &&
    meeting.endTimeUtc &&
    new Date(meeting.endTimeUtc) <= new Date()

  if (isLoadingMeeting) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className='min-w-6xl p-0 border-none overflow-hidden gap-0'
          position='top-center'
          showCloseButton={false}
        >
          <VisuallyHidden>
            <DialogTitle>{t('meeting.detail.loadingTitle')}</DialogTitle>
            <DialogDescription>{t('meeting.detail.loadingDescription')}</DialogDescription>
          </VisuallyHidden>

          <DialogHeader className='px-6 py-4 space-y-3 bg-muted'>
            <Skeleton className='h-7 w-1/2 bg-foreground/10' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-9 w-32 bg-foreground/10' />
              <Skeleton className='h-9 w-24 bg-foreground/10' />
              <Skeleton className='h-9 w-24 bg-foreground/10' />
            </div>
          </DialogHeader>

          <div className='p-6 grid grid-cols-12 gap-8'>
            <div className='col-span-8 space-y-6'>
              <div className='flex items-start gap-4'>
                <Skeleton className='size-5 rounded-md mt-0.5' />
                <div className='space-y-2 flex-1'>
                  <Skeleton className='h-5 w-48' />
                  <Skeleton className='h-4 w-64' />
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <Skeleton className='size-5 rounded-md mt-1.5' />
                <Skeleton className='w-full h-32 rounded-md' />
              </div>
            </div>

            <div className='col-span-4 space-y-6'>
              <div className='flex items-center justify-between gap-2'>
                <Skeleton className='h-5 w-16' />
                <Skeleton className='h-6 w-24 rounded-md' />
              </div>
              <div className='space-y-4 pt-2'>
                <Skeleton className='h-5 w-24' />
                <div className='space-y-3'>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className='flex items-center justify-between gap-4'>
                      <Skeleton className='h-4 w-28' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                  ))}
                </div>
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
        className='min-w-6xl p-0 border-none overflow-hidden gap-0'
        position='top-center'
        showCloseButton={false}
      >
        <DialogHeader className='px-6 py-4 space-y-1 bg-muted'>
          <VisuallyHidden>
            <DialogDescription>
              {meeting?.projectId && meeting?.project ? `[${meeting.project.name}] - ` : null}
              {t('meeting.detail.meetingWith')} {meeting?.mentor.firstName} {meeting?.mentor.lastName}
            </DialogDescription>
          </VisuallyHidden>

          <DialogTitle className='text-xl w-[95%]'>
            {meeting?.projectId && meeting?.project ? (
              <>
                <Link to={`/projects/${meeting.projectId}`} className='hover:text-primary transition-colors'>
                  [{meeting.project.name}]
                </Link>
                <span className='mx-1'> - </span>
              </>
            ) : null}

            {meeting?.packageBookingId ? (
              <span>
                {t('meeting.detail.session', { sequence: meeting.packageSequence })} -{' '}
                <Link
                  to={`/purchases/${meeting.packageBookingId}`}
                  className='hover:text-primary transition-colors underline-offset-4'
                >
                  {meeting.packageName}
                </Link>
              </span>
            ) : (
              <span>
                {t('meeting.detail.meetingWith')}{' '}
                <Link
                  to={`/users/${meeting?.mentorUserId}`}
                  className='hover:text-primary transition-colors underline-offset-4'
                >
                  {meeting?.mentor.firstName} {meeting?.mentor.lastName}
                </Link>
              </span>
            )}
          </DialogTitle>

          <div className='flex items-center gap-2'>
            <p className='px-3 py-2 bg-foreground/10 rounded-md text-sm font-medium backdrop-blur-sm'>
              {meeting?.startTimeUtc ? formatDate(meeting.startTimeUtc, 'dateMedium') : '-'}
            </p>
            <p className='px-3 py-2 bg-foreground/10 rounded-md text-sm font-medium backdrop-blur-sm'>
              {meeting?.startTimeUtc ? formatTime(meeting.startTimeUtc) : '-'}
            </p>
            <p className='text-sm font-medium px-1'>{t('meeting.detail.to')}</p>
            <p className='px-3 py-2 bg-foreground/10 rounded-md text-sm font-medium backdrop-blur-sm'>
              {meeting?.endTimeUtc ? formatTime(meeting.endTimeUtc) : '-'}
            </p>
            <p className='text-sm ml-2'>{getTimezoneString()}</p>
          </div>

          <div className='absolute top-4 right-4 flex items-center gap-1'>
            {meeting && (
              <MeetingDetailMenu
                meetingId={meeting.id}
                status={meeting.status}
                startTimeUtc={meeting.startTimeUtc}
                mentorId={meeting.mentorUserId}
                packageId={meeting.packageBookingId}
                onReschedule={() => setIsRescheduling(true)}
                calendarPermission={meeting.calendarPermission}
              >
                <Button variant='secondary' size='icon-sm' className='size-7'>
                  <MoreHorizontalIcon />
                </Button>
              </MeetingDetailMenu>
            )}
          </div>
        </DialogHeader>

        <div className='p-6 grid grid-cols-12 gap-8'>
          <div className='col-span-8 space-y-6'>
            {meeting ? (
              <MeetingNoteAndLink key={meeting.id} meeting={meeting} canUpdateMeeting={canUpdateMeeting} />
            ) : null}

            {meeting?.status === MeetingStatus.CANCELLED && meeting.reason && (
              <div className='flex items-start gap-4'>
                <CircleXIcon className='size-4 mt-1.5 text-destructive' />
                <div className='space-y-1.5 flex-1 p-3 bg-destructive/5 border border-destructive/20 rounded-md'>
                  <p className='text-sm font-bold text-destructive leading-none'>
                    {t('meeting.detail.cancelReasonLabel')}
                  </p>
                  <p className='text-sm text-foreground/90'>{meeting.reason}</p>
                  {meeting.cancelledBy && (
                    <div className='flex items-center gap-2 mt-2 pt-2 border-t border-destructive/10'>
                      <p className='text-xs text-muted-foreground'>{t('meeting.detail.cancelledBy')}:</p>
                      <div className='flex items-center gap-1.5'>
                        <Avatar className='size-5'>
                          <AvatarImage src={meeting.cancelledBy.avatarUrl ?? undefined} />
                          <AvatarFallback className='text-[8px]'>
                            {getAvatarFallback(`${meeting.cancelledBy.firstName} ${meeting.cancelledBy.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <p className='text-xs font-medium'>
                          {meeting.cancelledBy.firstName} {meeting.cancelledBy.lastName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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

            {((meeting?.projectId && meeting.project) || meeting?.packageBookingId) && (
              <div className='space-y-2.5'>
                <p className='text-sm font-medium'>{t('meeting.detail.information')}</p>

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
                        to={`/purchases/${meeting?.packageBookingId}`}
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

                      <p className='text-xs font-semibold truncate w-[60%] text-right'>
                        {t('meeting.detail.session', { sequence: meeting?.packageSequence })}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div className='space-y-2.5'>
              <p className='text-sm font-medium'>{t('meeting.detail.mentor')}</p>

              <Link to={`/users/${meeting?.mentorUserId}`} className='flex items-center gap-2'>
                <Avatar>
                  <AvatarImage className='hover:brightness-90' src={meeting?.mentor.avatarUrl ?? undefined} />
                  <AvatarFallback>
                    {getAvatarFallback(`${meeting?.mentor.firstName} ${meeting?.mentor.lastName}`)}
                  </AvatarFallback>
                </Avatar>

                <div className='-space-y-0.5'>
                  <p className='text-sm font-medium hover:underline hover:text-primary'>
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
                  <Link to={`/users/${member.slug}`} className='flex items-center gap-2' key={member.userId}>
                    <Avatar>
                      <AvatarImage src={member.avatarUrl ?? undefined} className='hover:brightness-90' />
                      <AvatarFallback>{getAvatarFallback(`${member.firstName} ${member.lastName}`)}</AvatarFallback>
                    </Avatar>

                    <div className='-space-y-0.5'>
                      <p className='text-sm font-medium hover:underline hover:text-primary'>
                        {member.firstName} {member.lastName}
                      </p>
                      <p className='text-xs text-muted-foreground'>{member.email}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <Link to={`/users/${meeting?.user.slug}`} className='flex items-center gap-2'>
                  <Avatar>
                    <AvatarImage src={meeting?.user.avatarUrl ?? undefined} className='hover:brightness-90' />
                    <AvatarFallback>
                      {getAvatarFallback(`${meeting?.user.firstName} ${meeting?.user.lastName}`)}
                    </AvatarFallback>
                  </Avatar>

                  <div className='-space-y-0.5'>
                    <p className='text-sm font-medium hover:underline hover:text-primary'>
                      {meeting?.user.firstName} {meeting?.user.lastName}
                    </p>
                    <p className='text-xs text-muted-foreground'>{meeting?.user.email}</p>
                  </div>
                </Link>
              )}
            </div>

            {canCompleteMeeting ? (
              <Button
                className='bg-emerald-500 hover:bg-emerald-500 w-full'
                size='sm'
                disabled={isCompletingMeeting}
                onClick={() => {
                  if (meeting?.id) {
                    completeMeeting({ meetingId: meeting.id })
                  }
                }}
              >
                {isCompletingMeeting ? <Spinner /> : <CheckCheckIcon />}
                {t('meeting.detail.completeMeeting')}
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>

      {meeting && isRescheduling ? (
        <MentorScheduleDialog
          open={isRescheduling}
          onOpenChange={setIsRescheduling}
          mentorUserId={meeting.mentorUserId}
          selectedTimeSlots={selectedTimeSlots}
          onSelectedTimeSlotsChange={setSelectedTimeSlots}
          limitSlots={
            meeting.packageRules?.find((rule) => rule.packageSequence === meeting.packageSequence)?.totalTimeSlots || 1
          }
          bookByProjectId={meeting.projectId}
          packageBookingId={meeting.packageBookingId}
          packageSessionNumber={meeting.packageSequence}
          meetingId={meeting.id}
          nextRule={{
            packageSequence: meeting.packageSequence,
            totalTimeSlots:
              meeting.packageRules?.find((rule) => rule.packageSequence === meeting.packageSequence)?.totalTimeSlots ||
              1
          }}
        />
      ) : null}
    </Dialog>
  )
}
