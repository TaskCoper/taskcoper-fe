import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetMyMeetings } from '@/features/meetings/hooks/use-get-my-meetings'
import BookMeetingFromCalendarDialog from '@/features/mentor-packages/components/book-meeting-from-calendar-dialog'
import { useGetPurchasedMentorPackages } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-packages'
import CalendarViewContainer from '@/features/tasks/components/calendar/calendar-view-container'
import type { MeetingBooking } from '@/types/meeting.type'
import { CalendarPlusIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'

function CalendarPageSkeleton() {
  return (
    <div className='h-screen flex flex-col'>
      <div className='flex flex-1 min-h-0 w-full max-h-[calc(100vh-3.5rem)]'>
        <div className='flex w-72 shrink-0 flex-col gap-2 border-r overflow-auto'>
          <div className='px-4 pt-4'>
            <Skeleton className='h-64 w-full rounded-xl' />
          </div>

          <div className='px-3 pt-2'>
            <Skeleton className='h-9 w-full rounded-md' />
          </div>

          <Separator className='mt-2' />

          <div className='flex flex-col gap-4 px-3 py-2'>
            <Skeleton className='h-4 w-28' />
            <div className='space-y-3'>
              <Skeleton className='h-5 w-full' />
              <Skeleton className='h-5 w-5/6' />
              <Skeleton className='h-5 w-4/5' />
            </div>

            <Skeleton className='h-4 w-40' />
            <div className='space-y-3'>
              <Skeleton className='h-5 w-full' />
              <Skeleton className='h-5 w-11/12' />
              <Skeleton className='h-5 w-10/12' />
            </div>
          </div>
        </div>

        <div className='flex-1 flex flex-col min-h-0'>
          <div className='border-b px-4 py-3 flex items-center justify-between gap-3'>
            <Skeleton className='h-7 w-44' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-24 rounded-md' />
              <Skeleton className='h-8 w-28 rounded-md' />
            </div>
          </div>

          <div className='flex-1 px-4 pb-4 pt-3'>
            <Skeleton className='size-full rounded-xl' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [bookMeetingOpen, setBookMeetingOpen] = useState(false)
  const [dateRange, setDateRange] = useState({ activeFrom: '', activeTo: '' })
  const [selectedPackageBookingIds, setSelectedPackageBookingIds] = useQueryState(
    'pkgs',
    parseAsArrayOf(parseAsString).withDefault([])
  )
  const [mode, setMode] = useQueryState('mode', parseAsArrayOf(parseAsInteger).withDefault([]))

  const [showSchedulesOverlay, setShowSchedulesOverlay] = useQueryState('overlay', parseAsBoolean.withDefault(true))

  const { t } = useTranslation()
  const { me: user, isGettingMe } = useGetMe()

  const { myMeetings, isLoadingMyMeetings } = useGetMyMeetings({
    ...dateRange,
    packageBookingIds: selectedPackageBookingIds ?? [],
    mode: (mode ?? []).length > 0 ? (mode ?? []) : []
  })
  const { purchasedMentorPackages, isLoadingPurchasedMentorPackages } = useGetPurchasedMentorPackages()

  const handleMeetingClick = useCallback(
    (meeting: MeetingBooking) => {
      navigate(`meetings/${meeting.id}${location.search}`)
    },
    [navigate, location.search]
  )

  const hasPackages = purchasedMentorPackages.value.totalCount > 0

  const sidebarContent = (
    <div className='mt-2'>
      {hasPackages && (
        <div className='px-3'>
          <BookMeetingFromCalendarDialog
            open={bookMeetingOpen}
            onOpenChange={setBookMeetingOpen}
            packages={purchasedMentorPackages.value.items}
          >
            <Button className='w-full' size='sm'>
              <CalendarPlusIcon />
              {t('purchasedPackage.bookSchedule')}
            </Button>
          </BookMeetingFromCalendarDialog>
        </div>
      )}

      <Separator className='mt-4' />

      <div className='flex flex-col justify-between gap-8 mt-4 px-2'>
        {user?.role === 'Mentor' && (
          <div className='space-y-2 px-3'>
            <div className='flex items-start space-x-2'>
              <Checkbox
                id='show-schedules'
                checked={showSchedulesOverlay}
                onCheckedChange={(checked) => setShowSchedulesOverlay(!!checked)}
              />
              <div className='grid gap-1 leading-none'>
                <label
                  htmlFor='show-schedules'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                >
                  {t('schedule.popover.showOverlay')}
                </label>
                <p className='text-xs text-muted-foreground'>{t('schedule.popover.description')}</p>
              </div>
            </div>
          </div>
        )}

        <div className='space-y-3 px-3'>
          <p className='text-sm font-medium'>{t('schedule.filter.title')}</p>

          <RadioGroup
            value={(mode ?? []).length === 0 ? 'all' : String((mode ?? [])[0])}
            onValueChange={(val) => {
              if (val === 'all') setMode([])
              else setMode([parseInt(val, 10)])
            }}
          >
            <div className='flex items-center gap-2'>
              <RadioGroupItem value='all' id='mode-all' />
              <Label htmlFor='mode-all' className='cursor-pointer font-normal'>
                {t('schedule.filter.all')}
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <RadioGroupItem value='0' id='mode-me' />
              <Label htmlFor='mode-me' className='cursor-pointer font-normal'>
                {t('schedule.filter.mine')}
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <RadioGroupItem value='1' id='mode-mentor' />
              <Label htmlFor='mode-mentor' className='cursor-pointer font-normal'>
                {t('schedule.filter.mentor')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Accordion
          type='multiple'
          defaultValue={
            purchasedMentorPackages.value.totalCount > 0 || selectedPackageBookingIds?.length === 0 ? ['item-1'] : []
          }
        >
          <AccordionItem value='item-1'>
            <AccordionTrigger className='hover:no-underline hover:bg-muted px-3 py-1.5 rounded-md'>
              {t('schedule.filter.purchasedPackages')}
            </AccordionTrigger>
            <AccordionContent>
              <div className='space-y-4 px-3 py-2'>
                {purchasedMentorPackages.value.items.map((pkg) => (
                  <div key={pkg.packageBookingId} className='flex items-center gap-2'>
                    <Checkbox
                      id={`pkg-${pkg.packageBookingId}`}
                      checked={(selectedPackageBookingIds ?? []).includes(pkg.packageBookingId)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPackageBookingIds([...(selectedPackageBookingIds ?? []), pkg.packageBookingId])
                        } else {
                          setSelectedPackageBookingIds(
                            (selectedPackageBookingIds ?? []).filter((id) => id !== pkg.packageBookingId)
                          )
                        }
                      }}
                    />
                    <Label
                      htmlFor={`pkg-${pkg.packageBookingId}`}
                      className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer line-clamp-1'
                    >
                      {pkg.name || pkg.packageBookingId}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )

  if (isGettingMe || isLoadingPurchasedMentorPackages || isLoadingMyMeetings) {
    return <CalendarPageSkeleton />
  }

  return (
    <CalendarViewContainer
      meetings={myMeetings}
      onMeetingClick={handleMeetingClick}
      onDateRangeChange={setDateRange}
      sidebarContent={sidebarContent}
      showSchedulesOverlay={showSchedulesOverlay}
    />
  )
}
