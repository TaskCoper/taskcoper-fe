import { queryKeys } from '@/lib/query-keys'
import scheduleService from '@/services/schedule.service'
import { useQuery } from '@tanstack/react-query'

export interface GetScheduleParams {
  userId: string
  activeFrom: string
  activeTo: string
}

export const useGetSchedule = ({ userId, activeFrom, activeTo }: GetScheduleParams) => {
  const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: queryKeys.schedules.list({ userId, activeFrom, activeTo }),
    queryFn: () => scheduleService.getSchedule({ userId, activeFrom, activeTo }),
    enabled: !!userId && !!activeFrom && !!activeTo
  })

  return { schedule, isLoadingSchedule }
}
