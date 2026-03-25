import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGetPurchasedMentorPackage } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-package'
import MentorScheduleDialog from '@/features/schedules/components/mentor-schedule-dialog'
import { cn } from '@/shared/utils'
import { MeetingStatus } from '@/types/meeting.type'
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
import { Link, useParams } from 'react-router'

export interface SelectedTimeSlot {
  dayOfWeek: number
  startTime: string
  endTime: string
  startTimeUtc: string
  endTimeUtc: string
}

const getStatusStyles = (status: MeetingStatus) => {
  switch (status) {
    case MeetingStatus.COMPLETED:
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20'
    case MeetingStatus.BOOKED:
      return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/20'
    case MeetingStatus.RESCHEDULE:
      return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/20'
    case MeetingStatus.CANCELLED:
    case MeetingStatus.SUSPENDED:
      return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20'
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-500/20'
  }
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
                    <p className='text-sm font-semibold'>Meeting buổi {meeting.packageBookingSequence}</p>
                    <div className='flex items-center gap-1'>
                      <ClockIcon className='size-3 text-muted-foreground' />
                      <p className='text-muted-foreground text-xs'>
                        {format(meeting.startTimeUtc, `dd/MM/yyyy 'vào' HH:mm`)}
                      </p>
                    </div>
                  </div>

                  <Badge className={cn('rounded-sm', getStatusStyles(meeting.status))}>
                    {getStatusIcon(meeting.status)}
                    {meeting.status}
                  </Badge>

                  {meeting.status === MeetingStatus.BOOKED && meeting.meetingLink ? (
                    <Link to={meeting.meetingLink} target='_blank'>
                      <Button size='sm'>
                        <VideoIcon />
                        Meet
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
              <p className='font-semibold'>Tiến độ ({progress.toFixed(0)}%)</p>
              <p className='text-xs text-muted-foreground'>Tiến độ tổng thể của gói mentor</p>
            </div>
            <Progress value={progress} className='h-2' />
          </div>

          <div className='space-y-4'>
            <div>
              <p className='font-semibold'>Thông tin</p>
              <p className='text-xs text-muted-foreground'>Thông tin gói mentor</p>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <FolderOpenIcon className='size-4' />
                  <p className='text-xs font-medium'>Thuộc về dự án</p>
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
                  <p className='text-xs font-medium'>Được tạo bởi</p>
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
                  <p className='text-xs font-medium'>Đã mua vào</p>
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
              Đặt lịch
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
