import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import PackageFeedbackCard from '@/features/feedbacks/components/package-feedback-card'
import { useGetPurchasedPackageFeedbacks } from '@/features/feedbacks/hooks/use-get-purchased-package-feedback'
import { getMeetingStatusTheme } from '@/features/meetings/utils'
import { useDateFormat } from '@/lib/date'
import { cn, getAvatarFallback } from '@/shared/utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { BoxIcon, CalendarDaysIcon, FileTextIcon, FolderOpenIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { MentorPackageBooking } from '../types'

interface PackageBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: MentorPackageBooking | null
}

const formatRange = (
  startISO: string,
  endISO: string,
  formatDate: (input: Date | string, preset?: string) => string,
  formatTime: (input: Date | string, preset?: string) => string
) => {
  const start = new Date(startISO)
  const end = new Date(endISO)

  const sameDay = formatDate(start, 'iso') === formatDate(end, 'iso')
  const datePart = formatDate(start, 'dateMedium')
  const startTime = formatTime(start)
  const endTime = formatTime(end)

  const offsetMinutes = -start.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
  const gmt = `GMT${sign}${hours}`

  if (sameDay) return `${datePart}, ${startTime} – ${endTime} (${gmt})`

  const endDatePart = formatDate(end, 'dateMedium')
  return `${datePart}, ${startTime} → ${endDatePart}, ${endTime} (${gmt})`
}

function FeedbackLoadingState() {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className='rounded-md border p-4 shadow-xs'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-10 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-3 w-32 rounded-md' />
              <Skeleton className='h-3 w-20 rounded-md' />
            </div>
          </div>

          <div className='mt-4 space-y-2'>
            <Skeleton className='h-3 w-full rounded-md' />
            <Skeleton className='h-3 w-11/12 rounded-md' />
            <Skeleton className='h-3 w-9/12 rounded-md' />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PackageBookingDialog({ open, onOpenChange, booking }: PackageBookingDialogProps) {
  const { t } = useTranslation()
  const { formatDate, formatTime } = useDateFormat()
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

  const durationRules =
    booking && booking.totalSessions > 0
      ? (() => {
          const totalTimeSlotsBySequence = new Map(
            booking.rules.map((item) => [item.packageSequence, item.totalTimeSlots])
          )

          return Array.from({ length: booking.totalSessions }, (_, index) => {
            const packageSequence = index + 1

            return {
              packageSequence,
              totalTimeSlots: totalTimeSlotsBySequence.get(packageSequence) ?? 1
            }
          })
        })()
      : []

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
                <FeedbackLoadingState />
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
                  {durationRules.length ? (
                    <Accordion type='single' collapsible className='w-full space-y-2'>
                      {durationRules.map((rule) => (
                        <AccordionItem key={rule.packageSequence} value={`session-${rule.packageSequence}`}>
                          <AccordionTrigger className='px-2 py-2 hover:no-underline'>
                            <p className='text-sm font-medium'>
                              {t('mentorPackageRule.item.session')} {rule.packageSequence}
                            </p>
                          </AccordionTrigger>
                          <AccordionContent className='px-2 pb-2'>
                            <p>{t('mentorPackageRule.item.sessionTakesHours', { hours: rule.totalTimeSlots })}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
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
                            {formatRange(meeting.startTimeUtc, meeting.endTimeUtc, formatDate, formatTime)}
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
                      {booking.createdOnUtc ? formatDate(booking.createdOnUtc, 'dateLong') : '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <div>
                  <p className='font-semibold'>{t('mentorPackage.bookingDialog.deadlinesTitle')}</p>
                  <p className='text-xs text-muted-foreground'>
                    {t('mentorPackage.bookingDialog.deadlinesDescription')}
                  </p>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-xs text-muted-foreground'>
                      {t('mentorPackage.bookingDialog.activationDeadline')}
                    </p>
                    <p className='text-xs font-semibold'>
                      {booking.activationDeadlineUtc ? formatDate(booking.activationDeadlineUtc, 'dateLong') : '—'}
                    </p>
                  </div>

                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-xs text-muted-foreground'>{t('mentorPackage.bookingDialog.activatedOn')}</p>
                    <p className='text-xs font-semibold'>
                      {booking.activatedOnUtc ? formatDate(booking.activatedOnUtc, 'dateLong') : '—'}
                    </p>
                  </div>

                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-xs text-muted-foreground'>{t('mentorPackage.bookingDialog.usageDeadline')}</p>
                    <p className='text-xs font-semibold'>
                      {booking.usageDeadlineUtc ? formatDate(booking.usageDeadlineUtc, 'dateLong') : '—'}
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
