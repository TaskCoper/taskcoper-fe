import MentorSchedule from '@/features/schedules/components/mentor-schedule'
import type { UserDetail } from '@/types/user.type'

interface ScheduleTabProps {
  userDetail?: UserDetail | null
}

export default function ScheduleTab({ userDetail }: ScheduleTabProps) {
  return <div>{userDetail?.id ? <MentorSchedule userId={userDetail?.id} /> : null}</div>
}
