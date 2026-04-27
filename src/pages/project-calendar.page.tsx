import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetProjectMeetings } from '@/features/meetings/hooks/use-get-project-meetings'
import BookMeetingFromCalendarDialog from '@/features/mentor-packages/components/book-meeting-from-calendar-dialog'
import { useGetProjectPurchasedMentorPackages } from '@/features/mentor-packages/hooks/use-get-project-purchased-mentor-packages'
import { useGetMyProjectPermissions } from '@/features/projects/hooks/use-get-my-project-permissions'
import CalendarViewContainer from '@/features/tasks/components/calendar/calendar-view-container'
import type { MeetingBooking } from '@/types/meeting.type'
import { CalendarPlusIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router'

function ProjectCalendarPageSkeleton() {
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

          <div className='space-y-4 px-3 py-2'>
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-5 w-full' />
            <Skeleton className='h-5 w-11/12' />
            <Skeleton className='h-5 w-10/12' />
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

export default function ProjectCalendarPage() {
  const { identifier } = useParams<{ identifier: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [bookMeetingOpen, setBookMeetingOpen] = useState(false)

  const [dateRange, setDateRange] = useState({ activeFrom: '', activeTo: '' })
  const [selectedPackageBookingIds, setSelectedPackageBookingIds] = useQueryState(
    'pkgs',
    parseAsArrayOf(parseAsString).withDefault([])
  )
  const { me: user, isGettingMe } = useGetMe()
  const { permissions, isLoadingPermissions } = useGetMyProjectPermissions({ projectIdentifier: identifier })

  const { projectMeetings, isLoadingProjectMeetings } = useGetProjectMeetings({
    projectIdentifier: identifier,
    ...dateRange
  })

  const { projectMentorPackages, isLoadingProjectMentorPackages } = useGetProjectPurchasedMentorPackages({
    projectIdentifier: identifier
  })

  const handleMeetingClick = useCallback(
    (meeting: MeetingBooking) => {
      navigate(`meetings/${meeting.id}${location.search}`)
    },
    [navigate, location.search]
  )

  const hasPackages = projectMentorPackages.value.totalCount > 0

  const sidebarContent = (
    <div>
      {hasPackages && permissions?.ownerId === user?.id && (
        <div className='px-3'>
          <BookMeetingFromCalendarDialog
            open={bookMeetingOpen}
            onOpenChange={setBookMeetingOpen}
            packages={projectMentorPackages.value.items}
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
        <Accordion
          type='multiple'
          defaultValue={
            projectMentorPackages.value.totalCount > 0 || selectedPackageBookingIds?.length === 0 ? ['item-1'] : []
          }
        >
          <AccordionItem value='item-1'>
            <AccordionTrigger className='hover:no-underline hover:bg-muted px-3 py-1.5 rounded-md'>
              {t('schedule.filter.purchasedPackages')}
            </AccordionTrigger>
            <AccordionContent>
              <div className='space-y-4 px-3 py-2'>
                {projectMentorPackages.value.items.map((pkg) => (
                  <div key={pkg.id} className='flex items-center gap-2'>
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

  if (isGettingMe || isLoadingPermissions || isLoadingProjectMentorPackages || isLoadingProjectMeetings) {
    return <ProjectCalendarPageSkeleton />
  }

  return (
    <CalendarViewContainer
      meetings={projectMeetings}
      onMeetingClick={handleMeetingClick}
      onDateRangeChange={setDateRange}
      sidebarContent={sidebarContent}
    />
  )
}
