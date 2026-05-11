import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import scheduleService from '../services'

export interface GetMySchedulesParams {
  isActive?: boolean
}

export const useGetMySchedules = ({ isActive }: GetMySchedulesParams = {}) => {
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: queryKeys.schedules.my({ isActive }),
    queryFn: () => scheduleService.getMySchedules({ isActive })
  })

  return { schedules, isLoadingSchedules }
}
