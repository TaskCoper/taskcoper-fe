import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { useQuery } from '@tanstack/react-query'

export interface GetMentorPackageStatisticsParams {
  mentorPackageId?: string
  startTime: string
  endTime: string
}

export const useGetMentorPackageStatistics = ({
  mentorPackageId,
  startTime,
  endTime
}: GetMentorPackageStatisticsParams) => {
  const {
    data: packageStatistics,
    isLoading: isLoadingPackageStatistics,
    isFetching: isFetchingPackageStatistics
  } = useQuery({
    queryKey: queryKeys.mentorPackages.statistics({ mentorPackageId, startTime, endTime }),
    queryFn: () => mentorPackageService.getMentorPackageStatistics({ mentorPackageId, startTime, endTime }),
    enabled: !!mentorPackageId
  })

  return { packageStatistics, isLoadingPackageStatistics, isFetchingPackageStatistics }
}
