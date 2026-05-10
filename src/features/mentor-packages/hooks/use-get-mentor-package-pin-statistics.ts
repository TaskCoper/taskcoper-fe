import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { MentorPackagePinStatistic } from '@/types/mentor-package.type'
import { useQuery } from '@tanstack/react-query'

export const useGetMentorPackagePinStatistics = () => {
  const {
    data: pinStatistics = getDefaultPaginationResponse<MentorPackagePinStatistic>(),
    isLoading: isLoadingPinStatistics
  } = useQuery({
    queryKey: queryKeys.mentorPackages.pinStatistics(),
    queryFn: mentorPackageService.getMentorPackagePinStatistics
  })

  return { pinStatistics, isLoadingPinStatistics }
}
