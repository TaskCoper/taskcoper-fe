import { queryKeys } from '@/lib/query-keys'
import scheduleService from '@/services/schedule.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ScheduleSlot } from '@/types/schedule.type'
import { useQuery } from '@tanstack/react-query'

export interface GetScheduleParams {
  userId: string
  activeFrom: string
  activeTo: string
  enabled?: boolean
}

export const useGetSchedule = ({ userId, activeFrom, activeTo, enabled = true }: GetScheduleParams) => {
  const { data: schedule = getDefaultPaginationResponse<ScheduleSlot>(), isLoading: isLoadingSchedule } = useQuery({
    queryKey: queryKeys.schedules.list({ userId, activeFrom, activeTo }),
    queryFn: () => scheduleService.getSchedule({ userId, activeFrom, activeTo }),
    enabled: enabled && !!userId && !!activeFrom && !!activeTo
  })

  return { schedule, isLoadingSchedule }
}
