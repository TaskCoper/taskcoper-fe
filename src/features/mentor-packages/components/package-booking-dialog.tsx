import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import PackageFeedbackCard from '@/features/feedbacks/components/package-feedback-card'
import { useGetPurchasedPackageFeedbacks } from '@/features/feedbacks/hooks/use-get-purchased-package-feedback'
import { getMeetingStatusTheme } from '@/features/meetings/utils'
import { cn, formatDate, getAvatarFallback } from '@/shared/utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { format } from 'date-fns'
import { BoxIcon, CalendarDaysIcon, FileTextIcon, FolderOpenIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { MentorPackageBooking } from '../types'

interface PackageBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: MentorPackageBooking | null
}

const formatRange = (startISO: string, endISO: string) => {
  const start = new Date(startISO)
  const end = new Date(endISO)

  const sameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')
  const datePart = format(start, 'd MMM yyyy')
  const startTime = format(start, 'HH:mm')
  const endTime = format(end, 'HH:mm')

  const offsetMinutes = -start.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
  const gmt = `GMT${sign}${hours}`

  if (sameDay) return `${datePart}, ${startTime} – ${endTime} (${gmt})`

  const endDatePart = format(end, 'd MMM yyyy')
  return `${datePart}, ${startTime} → ${endDatePart}, ${endTime} (${gmt})`
}

export default function PackageBookingDialog({ open, onOpenChange, booking }: PackageBookingDialogProps) {
  const { t } = useTranslation()
  const progress = booking && booking.totalSessions > 0 ? (booking.completedSessions / booking.totalSessions) * 100 : 0
  const { feedbacks, isLoadingFeedbacks } = useGetPurchasedPackageFeedbacks({
    packageBookingId: booking?.packageBookingId,
    enabled: open
  })
  const rootMeetings =
    booking?.meetings
      .filter((meeting) => !meeting.parentId)
      .sort(
        (a, b) =>
          b.packageBookingSequence - a.packageBookingSequence ||
          new Date(b.createdOnUtc).getTime() - new Date(a.createdOnUtc).getTime()
      ) ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-6xl' position='top-center'>
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>{t('transactions.column.viewDetails')}</DialogTitle>
            <DialogDescription>{booking?.packageName}</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        {booking ? (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
            <div className='space-y-10 lg:col-span-8'>
              {(feedbacks?.value?.items?.length ?? 0) > 0 ? (
                <div className='space-y-4'>
                  {feedbacks?.value.items.map((feedback) => (
                    <PackageFeedbackCard key={feedback.id} feedback={feedback} />
                  ))}
                </div>
              ) : isLoadingFeedbacks ? (
                <div className='flex flex-col items-center justify-center gap-2 rounded-md bg-muted p-8'>
                  <p className='text-xs text-muted-foreground'>{t('common.ui.loading')}</p>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center gap-2 rounded-md bg-muted p-8'>
                  <BoxIcon className='size-6 text-muted-foreground' />
                  <p className='text-xs text-muted-foreground'>{t('purchasedPackage.noFeedback')}</p>
                </div>
              )}

              <div className='space-y-2.5'>
                <div>
                  <p className='font-semibold'>{t('mentorPackage.page.durationTitle')}</p>
                  <p className='text-xs text-muted-foreground'>{t('mentorPackage.page.durationDescription')}</p>
                </div>

                <div className='space-y-2'>
                  {booking.rules.length ? (
                    booking.rules
                      .slice()
                      .sort((a, b) => a.packageSequence - b.packageSequence)
                      .map((rule) => (
                        <Card
                          key={rule.packageSequence}
                          className='flex-row items-center justify-between p-2 shadow-none rounded-md'
                        >
                          <p className='text-sm font-medium'>
                            {t('mentorPackageRule.item.session')} {rule.packageSequence}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {rule.totalTimeSlots} {t('mentorPackageRule.form.totalTimeSlots')}
                          </p>
                        </Card>
                      ))
                  ) : (
                    <div className='rounded-md text-center bg-muted p-3 text-xs text-muted-foreground'>
                      {t('common.ui.noDataAvailable')}
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-2.5'>
                <div>
                  <p className='font-semibold'>{t('purchasedPackage.history.title')}</p>
                  <p className='text-xs text-muted-foreground'>{t('purchasedPackage.history.description')}</p>
                </div>

                <div className='space-y-2'>
                  {rootMeetings.length ? (
                    rootMeetings.map((meeting) => (
                      <Card key={meeting.meetingId} className='relative h-20 flex-row gap-2 rounded-md p-2 shadow-none'>
                        <div className={cn('h-full w-1.5 rounded-full', getMeetingStatusTheme(meeting.status).dot)} />
                        <div className='flex flex-1 flex-col justify-between py-1'>
                          <p className='text-xs text-muted-foreground'>
                            {formatRange(meeting.startTimeUtc, meeting.endTimeUtc)}
                          </p>
                          <div>
                            <p className='text-sm font-semibold'>
                              {t('purchasedPackage.meetingSession', { sequence: meeting.packageBookingSequence })}
                            </p>
                            {meeting.meetingLink ? (
                              <a
                                href={meeting.meetingLink}
                                target='_blank'
                                rel='noreferrer'
                                className='text-xs text-foreground/80 hover:underline'
                              >
                                {meeting.meetingLink.replace('https://', '')}
                              </a>
                            ) : (
                              <p className='text-xs text-muted-foreground'>{t('meeting.detail.noLinkYet')}</p>
                            )}
                          </div>
                        </div>

                        {meeting.note ? (
                          <FileTextIcon className='absolute top-2 right-2 size-4 text-muted-foreground' />
                        ) : null}
                      </Card>
                    ))
                  ) : (
                    <div className='rounded-md bg-muted p-4 text-center text-xs text-muted-foreground'>
                      {t('purchaseHistory.detail.noMeetings')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='space-y-10 lg:col-span-4'>
              <div className='space-y-2'>
                <div>
                  <p className='font-semibold'>
                    {t('purchasedPackage.progress')} ({booking.completedSessions}/{booking.totalSessions})
                  </p>
                  <p className='text-xs text-muted-foreground'>{t('purchasedPackage.overallProgress')}</p>
                </div>
                <Progress value={progress} className='h-2' />
              </div>

              <div className='space-y-3'>
                <div>
                  <p className='font-semibold'>{t('mentorPackage.bookingDialog.bookingInformation')}</p>
                  <p className='text-xs text-muted-foreground'>{t('purchasedPackage.packageInformation')}</p>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <FolderOpenIcon className='size-4' />
                      <p className='text-xs font-medium'>{t('purchasedPackage.belongsToProject')}</p>
                    </div>
                    <p className='text-xs font-semibold'>{booking.bookedByProject?.name ?? '—'}</p>
                  </div>

                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <CalendarDaysIcon className='size-4' />
                      <p className='text-xs font-medium'>{t('purchasedPackage.purchasedOn')}</p>
                    </div>
                    <p className='text-xs font-semibold'>
                      {booking.createdOnUtc ? formatDate(booking.createdOnUtc) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <div>
                  <p className='font-semibold'>{t('mentorPackage.bookingDialog.deadlinesTitle')}</p>
                  <p className='text-xs text-muted-foreground'>{t('mentorPackage.bookingDialog.deadlinesDescription')}</p>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-xs text-muted-foreground'>
                      {t('mentorPackage.bookingDialog.activationDeadline')}
                    </p>
                    <p className='text-xs font-semibold'>
                      {booking.activationDeadlineUtc ? formatDate(booking.activationDeadlineUtc) : '—'}
                    </p>
                  </div>

                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-xs text-muted-foreground'>{t('mentorPackage.bookingDialog.activatedOn')}</p>
                    <p className='text-xs font-semibold'>
                      {booking.activatedOnUtc ? formatDate(booking.activatedOnUtc) : '—'}
                    </p>
                  </div>

                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-xs text-muted-foreground'>{t('mentorPackage.bookingDialog.usageDeadline')}</p>
                    <p className='text-xs font-semibold'>
                      {booking.usageDeadlineUtc ? formatDate(booking.usageDeadlineUtc) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className='space-y-2.5'>
                <p className='font-semibold'>{t('mentorPackage.bookingDialog.bookedBy')}</p>
                <Link to={`/users/${booking.bookedByUser.slug}`} className='flex items-center gap-2'>
                  <Avatar>
                    <AvatarImage className='hover:brightness-90' src={booking.bookedByUser.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {getAvatarFallback(`${booking.bookedByUser.firstName} ${booking.bookedByUser.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='-space-y-0.5'>
                    <p className='text-sm font-medium hover:text-primary hover:underline'>
                      {booking.bookedByUser.firstName} {booking.bookedByUser.lastName}
                    </p>
                    <p className='text-xs text-muted-foreground'>{booking.bookedByUser.email}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
