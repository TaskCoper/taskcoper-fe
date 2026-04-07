import { useGetProjectMeetings } from '@/features/meetings/hooks/use-get-project-meetings'
import CalendarViewContainer from '@/features/tasks/components/calendar/calendar-view-container'
import type { MeetingBooking } from '@/types/meeting.type'
import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

export default function ProjectCalendarPage() {
  const { identifier } = useParams<{ identifier: string }>()
  const navigate = useNavigate()

  const [dateRange, setDateRange] = useState({ activeFrom: '', activeTo: '' })

  const { projectMeetings = [] } = useGetProjectMeetings({
    projectIdentifier: identifier || '',
    ...dateRange
  })

  const handleMeetingClick = useCallback(
    (meeting: MeetingBooking) => {
      navigate(`meetings/${meeting.id}`)
    },
    [navigate]
  )

  return (
    <CalendarViewContainer
      meetings={projectMeetings}
      onMeetingClick={handleMeetingClick}
      onDateRangeChange={setDateRange}
    />
  )
}
