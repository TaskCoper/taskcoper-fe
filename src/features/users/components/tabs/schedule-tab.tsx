import MentorSchedule from '@/features/schedules/components/mentor-schedule'
import type { UserDetail } from '../../types'

interface ScheduleTabProps {
  userDetail?: UserDetail | null
}

export default function ScheduleTab({ userDetail }: ScheduleTabProps) {
  return <div>{userDetail?.id ? <MentorSchedule userId={userDetail?.id} /> : null}</div>
}
