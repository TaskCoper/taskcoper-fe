import { Button } from '@/components/ui/button'
import { useGetMyMeetings } from '@/features/meetings/hooks/use-get-my-meetings'
import CalendarViewContainer from '@/features/tasks/components/calendar/calendar-view-container'
import { useAuthStore } from '@/lib/zustand/auth.store'
import type { MeetingBooking } from '@/types/meeting.type'
import { CalendarIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

export default function CalendarPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [dateRange, setDateRange] = useState({ activeFrom: '', activeTo: '' })

  const { myMeetings = [] } = useGetMyMeetings(dateRange)

  const handleMeetingClick = useCallback(
    (meeting: MeetingBooking) => {
      navigate(`meetings/${meeting.id}`)
    },
    [navigate]
  )

  const sidebarContent = (
    <>
      <div className='flex-1' />
      {user?.Role === 'Mentor' && (
        <Link to='schedules'>
          <Button size='sm' className='w-full'>
            <CalendarIcon />
            {t('schedule.button.viewSchedules')}
          </Button>
        </Link>
      )}
    </>
  )

  return (
    <CalendarViewContainer
      meetings={myMeetings}
      onMeetingClick={handleMeetingClick}
      onDateRangeChange={setDateRange}
      sidebarContent={sidebarContent}
    />
  )
}
