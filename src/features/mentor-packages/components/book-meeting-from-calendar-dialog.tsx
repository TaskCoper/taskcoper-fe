import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetPurchasedMentorPackage } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-package'
import { MentorScheduleContent } from '@/features/schedules/components/mentor-schedule-dialog'
import { useAuthStore } from '@/lib/zustand/auth.store'
import type { SelectedTimeSlot } from '@/pages/users/purchased-package.page'
import { MeetingStatus } from '@/types/meeting.type'
import type { PurchasedMentorPackage } from '@/types/mentor-package.type'
import { format, getISOWeek, startOfWeek } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import { CalendarDaysIcon, EyeIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import PurchasedMentorPackageCard from './purchased-mentor-package-card'

interface BookMeetingFromCalendarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  packages: PurchasedMentorPackage[]
}

export default function BookMeetingFromCalendarDialog({
  open,
  onOpenChange,
  children,
  packages
}: BookMeetingFromCalendarDialogProps) {
  const { t, i18n } = useTranslation()
  const { user } = useAuthStore()

  const dateLocale = i18n.language.startsWith('vi') ? vi : enUS

  const [selectedPackage, setSelectedPackage] = useState<PurchasedMentorPackage | null>(null)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<SelectedTimeSlot[]>([])

  const upcomingMeeting = selectedPackage?.meetings?.find(
    (m) => !m.parentId && (m.status === MeetingStatus.BOOKED || m.status === MeetingStatus.RESCHEDULE)
  )

  // Load full package detail once user picks a package (enabled only if no upcoming meeting)
  const { purchasedMentorPackage, isLoadingPurchasedMentorPackage } = useGetPurchasedMentorPackage({
    packageId: upcomingMeeting ? undefined : selectedPackage?.packageBookingId
  })

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setSelectedPackage(null)
      setSelectedTimeSlots([])
    }, 200)
  }

  const handleBack = () => {
    setSelectedPackage(null)
    setSelectedTimeSlots([])
  }

  const detail = purchasedMentorPackage

  const currentSequence = detail
    ? Math.max(
        0,
        ...detail.meetings
          .map((m) => (m.status === MeetingStatus.COMPLETED ? m.packageBookingSequence : 0))
          .filter(Boolean)
      )
    : 0

  const limitSlots = detail?.rules.find((r) => r.packageSequence === currentSequence + 1)?.totalTimeSlots ?? 1

  const nextRule = detail?.rules.find((r) => r.packageSequence === currentSequence + 1) ?? {
    totalTimeSlots: 1,
    packageSequence: currentSequence + 1
  }

  const today = new Date()
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 })

  const isScheduleStep = !!selectedPackage

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedPackage(null)
          setSelectedTimeSlots([])
        }
        onOpenChange(open)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent position='top-center' className='min-w-6xl'>
        <DialogHeader>
          {isScheduleStep ? (
            <>
              <div className='mb-4'>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink onClick={handleBack} className='cursor-pointer'>
                        {t('purchasedPackage.purchasedPackages')}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className='truncate max-w-[300px]'>{selectedPackage.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <DialogTitle className='flex items-center gap-2'>
                {t('purchasedPackage.bookMeetingSession', {
                  sequence: nextRule.packageSequence,
                  slots: nextRule.totalTimeSlots
                })}
              </DialogTitle>

              <DialogDescription>
                {t('meeting.mentorSchedule.weekLabel', {
                  week: getISOWeek(currentWeekStart),
                  month: format(currentWeekStart, 'MMMM yyyy', { locale: dateLocale })
                })}
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>{t('purchasedPackage.purchasedPackages')}</DialogTitle>
              <DialogDescription>{t('purchasedPackage.selectPackageToBook')}</DialogDescription>
            </>
          )}
        </DialogHeader>

        {!isScheduleStep && (
          <div className='grid grid-cols-3 gap-4 mt-2'>
            {packages
              .filter((x) => x.projectOwnerId === user?.UserId)
              .map((pkg) => {
                const completed =
                  pkg.meetings?.filter((m) => m.status === MeetingStatus.COMPLETED && !m.parentId).length ?? 0
                const total = pkg.totalSessions ?? 1
                const isDone = completed >= total

                return (
                  <div
                    key={pkg.packageBookingId}
                    onClick={() => !isDone && setSelectedPackage(pkg)}
                    className={isDone ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}
                  >
                    <PurchasedMentorPackageCard mentorPackage={pkg} />
                  </div>
                )
              })}
          </div>
        )}

        {isScheduleStep && (
          <>
            {upcomingMeeting ? (
              <div className='flex flex-col items-center text-center py-20 bg-muted/80 rounded-lg'>
                <div className='bg-primary/10 p-4 rounded-full mb-4'>
                  <CalendarDaysIcon className='size-10 text-primary' />
                </div>
                <h3 className='text-lg font-semibold'>{t('purchasedPackage.hasUpcomingMeeting')}</h3>
                <p className='text-sm text-muted-foreground max-w-sm'>
                  {t('purchasedPackage.upcomingMeetingNote', {
                    date: i18n.language.startsWith('vi')
                      ? format(new Date(upcomingMeeting.startTimeUtc), "'lúc' hh:mm a dd/MM/yyyy", {
                          locale: vi
                        })
                      : format(new Date(upcomingMeeting.startTimeUtc), "'at' hh:mm a 'on' MMMM do, yyyy", {
                          locale: enUS
                        })
                  })}
                </p>

                <Link to={`meetings/${upcomingMeeting.meetingId}`}>
                  <Button size='sm' className='mt-4'>
                    <EyeIcon />
                    {t('purchasedPackage.viewMeeting')}
                  </Button>
                </Link>
              </div>
            ) : isLoadingPurchasedMentorPackage || !detail ? (
              <div className='grid grid-cols-7 gap-2 mt-4'>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className='flex flex-col gap-2'>
                    <Skeleton className='h-10 rounded-lg' />
                    <Skeleton className='h-20 rounded-md' />
                  </div>
                ))}
              </div>
            ) : (
              <div className='mt-4'>
                <MentorScheduleContent
                  open={open}
                  mentorUserId={detail.mentorUserId}
                  selectedTimeSlots={selectedTimeSlots}
                  onSelectedTimeSlotsChange={setSelectedTimeSlots}
                  limitSlots={limitSlots}
                  bookByProjectId={detail.projectId}
                  packageBookingId={detail.packageBookingId}
                  packageSessionNumber={currentSequence + 1}
                  onSuccess={handleClose}
                />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
