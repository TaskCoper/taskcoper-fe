import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getMeetingStatusTheme } from '@/features/meetings/utils'
import { useGetPurchasedMentorPackage } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-package'
import MentorScheduleDialog from '@/features/schedules/components/mentor-schedule-dialog'
import { cn } from '@/shared/utils'
import { MeetingStatus, MeetingStatusLabel } from '@/types/meeting.type'
import { format } from 'date-fns'
import {
  CalendarDaysIcon,
  CalendarIcon,
  CalendarPlusIcon,
  CheckCircle2Icon,
  ClockIcon,
  FolderOpenIcon,
  GraduationCapIcon,
  HistoryIcon,
  InfoIcon,
  VideoIcon,
  XCircleIcon
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

export interface SelectedTimeSlot {
  dayOfWeek: number
  startTime: string
  endTime: string
  startTimeUtc: string
  endTimeUtc: string
}

const getStatusIcon = (status: MeetingStatus) => {
  switch (status) {
    case MeetingStatus.COMPLETED:
      return <CheckCircle2Icon className='size-3' />
    case MeetingStatus.BOOKED:
      return <CalendarIcon className='size-3' />
    case MeetingStatus.RESCHEDULE:
      return <HistoryIcon className='size-3' />
    case MeetingStatus.CANCELLED:
    case MeetingStatus.SUSPENDED:
      return <XCircleIcon className='size-3' />
    default:
      return <InfoIcon className='size-3' />
  }
}

export default function PurchasedPackagePage() {
  const { packageId } = useParams<{ packageId: string }>()
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<SelectedTimeSlot[]>([])
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const { purchasedMentorPackage } = useGetPurchasedMentorPackage({ packageId })

  const currentSequence = Math.max(
    0,
    ...(purchasedMentorPackage?.meetings
      .map((meeting) => {
        if (meeting.status === MeetingStatus.COMPLETED) {
          return meeting.packageBookingSequence
        }
        return 0
      })
      .filter(Boolean) ?? [])
  )

  const progress =
    ((purchasedMentorPackage?.meetings?.filter((meeting) => meeting.status === MeetingStatus.COMPLETED).length || 0) /
      Math.max(1, purchasedMentorPackage?.totalSessions ?? 1)) *
    100

  const completedSessions =
    purchasedMentorPackage?.meetings?.filter(
      (meeting) => meeting.status === MeetingStatus.COMPLETED && !meeting.parentId
    ).length || 0

  const limitSlots =
    purchasedMentorPackage?.rules.find((rule) => rule.packageSequence === currentSequence + 1)?.totalTimeSlots ?? 1

  const nextRule = purchasedMentorPackage?.rules.find((rule) => rule.packageSequence === currentSequence + 1) ?? {
    totalTimeSlots: 1,
    packageSequence: currentSequence + 1
  }

  return (
    <>
      <div className='max-w-7xl mx-auto space-y-10 p-4 pb-10 grid grid-cols-12 gap-8'>
        <div className='col-span-8 space-y-4'>
          <img
            src={purchasedMentorPackage?.coverImageUrl ?? undefined}
            alt={purchasedMentorPackage?.name}
            className='w-full h-60 object-cover rounded-xl'
          />

          <div className='space-y-1'>
            <p className='text-2xl font-bold'>{purchasedMentorPackage?.name}</p>
            <p className='text-muted-foreground text-sm'>{purchasedMentorPackage?.description}</p>
          </div>

          <div className='space-y-2'>
            {purchasedMentorPackage?.meetings
              .filter((x) => !x.parentId)
              .map((meeting) => (
                <Card key={meeting.meetingId} className='p-3 flex-row items-center justify-between rounded-lg'>
                  <div>
                    <p className='text-sm font-semibold'>
                      {t('purchasedPackage.meetingSession', { sequence: meeting.packageBookingSequence })}
                    </p>
                    <div className='flex items-center gap-1'>
                      <ClockIcon className='size-3 text-muted-foreground' />
                      <p className='text-muted-foreground text-xs'>
                        {format(meeting.startTimeUtc, t('purchasedPackage.meetingDateFormat'))}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant='outline'
                    className={cn('rounded-sm px-2 py-0.5 border', getMeetingStatusTheme(meeting.status).badge)}
                  >
                    {getStatusIcon(meeting.status)}
                    {t(MeetingStatusLabel[meeting.status])}
                  </Badge>

                  {meeting.status === MeetingStatus.BOOKED && meeting.meetingLink ? (
                    <Link to={meeting.meetingLink} target='_blank'>
                      <Button size='sm'>
                        <VideoIcon />
                        {t('purchasedPackage.meetButton')}
                      </Button>
                    </Link>
                  ) : null}
                </Card>
              ))}
          </div>
        </div>

        <div className='col-span-4 space-y-8'>
          <div className='space-y-4'>
            <div>
              <p className='font-semibold'>
                {t('purchasedPackage.progress')} ({completedSessions}/{purchasedMentorPackage?.totalSessions})
              </p>
              <p className='text-xs text-muted-foreground'>{t('purchasedPackage.overallProgress')}</p>
            </div>
            <Progress value={progress} className='h-2' />
          </div>

          <div className='space-y-4'>
            <div>
              <p className='font-semibold'>{t('purchasedPackage.information')}</p>
              <p className='text-xs text-muted-foreground'>{t('purchasedPackage.packageInformation')}</p>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <FolderOpenIcon className='size-4' />
                  <p className='text-xs font-medium'>{t('purchasedPackage.belongsToProject')}</p>
                </div>

                <Link
                  to={`/projects/${purchasedMentorPackage?.projectId}/info`}
                  className='hover:text-primary hover:underline'
                >
                  <p className='text-xs font-semibold'>{purchasedMentorPackage?.project?.name}</p>
                </Link>
              </div>

              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <GraduationCapIcon className='size-4' />
                  <p className='text-xs font-medium'>{t('purchasedPackage.createdBy')}</p>
                </div>

                <Link
                  to={`/users/${purchasedMentorPackage?.mentorUserId}`}
                  className='hover:text-primary hover:underline'
                >
                  <p className='text-xs font-semibold'>
                    {purchasedMentorPackage?.mentor?.firstName} {purchasedMentorPackage?.mentor.lastName}
                  </p>
                </Link>
              </div>

              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <CalendarDaysIcon className='size-4' />
                  <p className='text-xs font-medium'>{t('purchasedPackage.purchasedOn')}</p>
                </div>

                <p className='text-xs font-semibold'>
                  {purchasedMentorPackage?.createdOnUtc
                    ? format(new Date(purchasedMentorPackage.createdOnUtc), 'dd/MM/yyyy')
                    : '-'}
                </p>
              </div>
            </div>

            <Button onClick={() => setOpen(true)} className='w-full'>
              <CalendarPlusIcon />
              {t('purchasedPackage.bookSchedule')}
            </Button>
          </div>
        </div>
      </div>

      {purchasedMentorPackage?.mentorUserId ? (
        <MentorScheduleDialog
          open={open}
          onOpenChange={setOpen}
          mentorUserId={purchasedMentorPackage.mentorUserId}
          selectedTimeSlots={selectedTimeSlots}
          onSelectedTimeSlotsChange={setSelectedTimeSlots}
          limitSlots={limitSlots}
          bookByProjectId={purchasedMentorPackage.projectId}
          packageBookingId={purchasedMentorPackage.packageBookingId}
          packageSessionNumber={currentSequence + 1}
          nextRule={nextRule}
        />
      ) : null}
    </>
  )
}
