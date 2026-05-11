import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import mentorPackageService from '../services'
import type { MentorPackagePinStatistic } from '../types'

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
