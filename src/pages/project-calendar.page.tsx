import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
  const { me: user } = useGetMe()
  const { permissions } = useGetMyProjectPermissions({ projectIdentifier: identifier })

  const { projectMeetings } = useGetProjectMeetings({
    projectIdentifier: identifier,
    ...dateRange
  })

  const { projectMentorPackages } = useGetProjectPurchasedMentorPackages({ projectIdentifier: identifier })

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

  return (
    <CalendarViewContainer
      meetings={projectMeetings}
      onMeetingClick={handleMeetingClick}
      onDateRangeChange={setDateRange}
      sidebarContent={sidebarContent}
    />
  )
}
