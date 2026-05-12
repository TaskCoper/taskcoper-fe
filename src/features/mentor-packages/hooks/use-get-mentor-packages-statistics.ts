import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import mentorPackageService from '../services'

export interface GetMentorPackagesStatisticsParams {
  startTime: string
  endTime: string
}

export const useGetMentorPackagesStatistics = ({ startTime, endTime }: GetMentorPackagesStatisticsParams) => {
  const { data: mentorPackagesStatistics, isLoading: isLoadingMentorPackagesStatistics } = useQuery({
    queryKey: queryKeys.mentorPackages.allStatistics({ startTime, endTime }),
    queryFn: () => mentorPackageService.getMentorPackagesStatistics({ startTime, endTime }),
    enabled: !!startTime && !!endTime
  })

  return { mentorPackagesStatistics, isLoadingMentorPackagesStatistics }
}
