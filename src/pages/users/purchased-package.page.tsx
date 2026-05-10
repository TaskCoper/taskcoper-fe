import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import PackageFeedbackCard from '@/features/feedbacks/components/package-feedback-card'
import { useGetPurchasedPackageFeedbacks } from '@/features/feedbacks/hooks/use-get-purchased-package-feedback'
import { getMeetingStatusTheme } from '@/features/meetings/utils'
import { useGetPurchasedMentorPackage } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-package'
import MentorScheduleDialog from '@/features/schedules/components/mentor-schedule-dialog'
import { cn, getAvatarFallback } from '@/shared/utils'
import { MeetingStatus } from '@/types/meeting.type'
import { format } from 'date-fns'
import {
  BoxIcon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  CircleStarIcon,
  FileTextIcon,
  FolderOpenIcon,
  GraduationCapIcon
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useParams } from 'react-router'

export interface SelectedTimeSlot {
  dayOfWeek: number
  startTime: string
  endTime: string
  startTimeUtc: string
  endTimeUtc: string
}

const formatRange = (startISO: string, endISO: string) => {
  const start = new Date(startISO)
  const end = new Date(endISO)

  const sameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')

  const datePart = format(start, 'd MMM yyyy')
  const startTime = format(start, 'HH:mm')
  const endTime = format(end, 'HH:mm')

  // get GMT offset from local timezone
  const offsetMinutes = -start.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')

  const gmt = `GMT${sign}${hours}`

  if (sameDay) {
    return `${datePart}, ${startTime} – ${endTime} (${gmt})`
  }

  const endDatePart = format(end, 'd MMM yyyy')
  return `${datePart}, ${startTime} → ${endDatePart}, ${endTime} (${gmt})`
}

const PurchasedPackageSkeleton = () => (
  <div className='absolute inset-0 overflow-y-auto'>
    <div className='max-w-7xl mx-auto space-y-10 p-4 pb-10 grid grid-cols-12 gap-6'>
      <div className='col-span-8 space-y-4'>
        <Skeleton className='w-full h-60 rounded-xl' />

        <div className='space-y-2'>
          <Skeleton className='h-7 w-2/3' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
        </div>

        <div className='space-y-4'>
          {[1, 2].map((item) => (
            <div key={item} className='p-4 border border-muted rounded-xl space-y-3'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='size-9 rounded-full' />
                  <div className='space-y-1'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </div>
                <Skeleton className='h-6 w-16 rounded-md' />
              </div>

              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
                <Skeleton className='h-4 w-2/3' />
              </div>

              <div className='grid grid-cols-2 gap-x-6 gap-y-2.5 pt-2'>
                {[1, 2, 3, 4].map((metric) => (
                  <div key={metric} className='flex items-center justify-between'>
                    <Skeleton className='h-3 w-20' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='col-span-4 space-y-8'>
        <Skeleton className='h-24 w-full rounded-lg' />

        <div className='space-y-2'>
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-3 w-56' />
          <Skeleton className='h-2 w-full rounded-full' />
        </div>

        <div className='space-y-4'>
          <div className='space-y-1'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-52' />
          </div>

          <div className='space-y-2'>
            {[1, 2, 3].map((row) => (
              <div key={row} className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='size-4 rounded-full' />
                  <Skeleton className='h-3 w-28' />
                </div>
                <Skeleton className='h-3 w-20' />
              </div>
            ))}
          </div>

          <Skeleton className='h-10 w-full rounded-md' />
        </div>

        <div className='space-y-2.5'>
          <Skeleton className='h-4 w-24' />
          <div className='flex items-center gap-2'>
            <Skeleton className='size-9 rounded-full' />
            <div className='space-y-1'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-3 w-36' />
            </div>
          </div>
        </div>

        <div className='space-y-2.5'>
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-3 w-40' />
        </div>

        <div className='space-y-2.5'>
          <div className='space-y-1'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-3 w-56' />
          </div>

          <div className='space-y-2'>
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className='h-16 w-full rounded-md' />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default function PurchasedPackagePage() {
  const { packageId } = useParams<{ packageId: string }>()
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<SelectedTimeSlot[]>([])
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const { purchasedMentorPackage, isLoadingPurchasedMentorPackage } = useGetPurchasedMentorPackage({ packageId })
  const { feedbacks } = useGetPurchasedPackageFeedbacks({
    packageBookingId: purchasedMentorPackage?.packageBookingId,
    enabled: purchasedMentorPackage?.isFeedbackSubmitted
  })

  if (isLoadingPurchasedMentorPackage) {
    return <PurchasedPackageSkeleton />
  }

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
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='max-w-7xl mx-auto space-y-10 p-4 pb-10 grid grid-cols-12 gap-6'>
        <div className='col-span-8 space-y-4'>
          <img
            src={purchasedMentorPackage?.coverImageUrl ?? undefined}
            alt={purchasedMentorPackage?.name}
            className='w-full h-60 object-cover rounded-xl'
          />

          <div>
            <p className='text-2xl font-bold'>{purchasedMentorPackage?.name}</p>
            <p className='text-muted-foreground text-sm'>{purchasedMentorPackage?.description}</p>
          </div>

          {(feedbacks?.value?.items?.length ?? 0) > 0 ? (
            <div className='space-y-4'>
              {feedbacks?.value.items.map((feedback) => (
                <PackageFeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          ) : (
            <div className='flex flex-col justify-center items-center gap-2 p-8 bg-muted rounded-md'>
              <BoxIcon className='size-6 text-muted-foreground' />
              <p className='text-xs text-muted-foreground'>{t('purchasedPackage.noFeedback')}</p>
            </div>
          )}
        </div>

        <div className='col-span-4 space-y-8'>
          {purchasedMentorPackage?.isNeedFeedback ? (
            <div className='p-2 bg-amber-100 rounded-md border border-amber-500 border-dashed space-y-2'>
              <div>
                <div className='flex items-center gap-1'>
                  <CircleStarIcon className='size-4 text-orange-500' />
                  <p className='text-sm font-semibold text-orange-500'>{t('purchasedPackage.feedbackTitle')}</p>
                </div>
                <p className='text-xs text-muted-foreground'>{t('purchasedPackage.feedbackDescription')}</p>
              </div>

              <Link
                to={`feedback`}
                className={cn(buttonVariants({ size: 'sm' }), 'bg-orange-500 w-full hover:bg-orange-500/90')}
              >
                {t('purchasedPackage.feedbackButton')}
              </Link>
            </div>
          ) : null}

          <div className='space-y-2'>
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
              {purchasedMentorPackage?.project ? (
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
              ) : null}

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
                    ? format(new Date(purchasedMentorPackage.createdOnUtc), t('purchasedPackage.purchasedOnDateFormat'))
                    : '-'}
                </p>
              </div>
            </div>

            <Button onClick={() => setOpen(true)} className='w-full'>
              <CalendarPlusIcon />
              {t('purchasedPackage.bookSchedule')}
            </Button>
          </div>

          <div className='space-y-2.5'>
            <p className='font-semibold'>{t('meeting.detail.mentor')}</p>

            <Link to={`/users/${purchasedMentorPackage?.mentorUserId}`} className='flex items-center gap-2'>
              <Avatar>
                <AvatarImage
                  className='hover:brightness-90'
                  src={purchasedMentorPackage?.mentor.avatarUrl ?? undefined}
                />
                <AvatarFallback>
                  {getAvatarFallback(
                    `${purchasedMentorPackage?.mentor.firstName} ${purchasedMentorPackage?.mentor.lastName}`
                  )}
                </AvatarFallback>
              </Avatar>

              <div className='-space-y-0.5'>
                <p className='text-sm font-medium hover:underline hover:text-primary'>
                  {purchasedMentorPackage?.mentor.firstName} {purchasedMentorPackage?.mentor.lastName}
                </p>
                <p className='text-xs text-muted-foreground'>{purchasedMentorPackage?.mentor.email}</p>
              </div>
            </Link>
          </div>

          <div className='space-y-2.5'>
            <p className='font-semibold'>{t('meeting.detail.participants')}</p>
          </div>

          <div className='space-y-2.5'>
            <div>
              <p className='font-semibold'>{t('purchasedPackage.history.title')}</p>
              <p className='text-xs text-muted-foreground'>{t('purchasedPackage.history.description')}</p>
            </div>

            <div className='space-y-2'>
              {purchasedMentorPackage?.meetings
                .filter((x) => !x.parentId)
                .sort(
                  (a, b) =>
                    b.packageBookingSequence - a.packageBookingSequence ||
                    new Date(b.createdOnUtc).getTime() - new Date(a.createdOnUtc).getTime()
                )
                .map((meeting) => (
                  <Card key={meeting.meetingId} className='p-1 shadow-none rounded-md h-18 flex-row gap-2 relative'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'h-full w-1.5 rounded-full cursor-default',
                            getMeetingStatusTheme(meeting.status).dot
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side='top' className='text-xs'>
                        {t('purchasedPackage.statusTooltip', {
                          status: t(`meeting.status.${meeting.status.toLowerCase()}`)
                        })}
                      </TooltipContent>
                    </Tooltip>
                    <div className='flex flex-col justify-between py-1'>
                      <p className='text-xs text-muted-foreground'>
                        {formatRange(meeting.startTimeUtc, meeting.endTimeUtc)}
                      </p>

                      <div>
                        <Link
                          to={`meetings/${meeting.meetingId}`}
                          className='hover:underline hover:text-primary leading-none'
                        >
                          <p className='font-semibold'>
                            {t('purchasedPackage.meetingSession', { sequence: meeting.packageBookingSequence })}
                          </p>
                        </Link>

                        {meeting.meetingLink ? (
                          <Link
                            to={meeting.meetingLink}
                            target='_blank'
                            className='text-xs text-foreground/80 hover:underline'
                          >
                            <p>{meeting.meetingLink.replace('https://', '')}</p>
                          </Link>
                        ) : (
                          <p className='text-xs text-muted-foreground'>{t('meeting.detail.noLinkYet')}</p>
                        )}
                      </div>
                    </div>

                    {meeting.note ? (
                      <FileTextIcon className='size-4 text-muted-foreground absolute top-2 right-2' />
                    ) : null}
                  </Card>
                ))}
            </div>
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

      <Outlet />
    </div>
  )
}
