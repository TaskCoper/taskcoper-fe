import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { PurchasedMentorPackage } from '@/types/mentor-package.type'
import { useQuery } from '@tanstack/react-query'

export interface GetPurchasedMentorPackagesParams {
  mode?: number[]
  // 0: All
  // 1: WithCalendarFullAccess => các gói mua cho project và có quyền đặt lịch
  // 2: WithCalendarReadOnly => các gói mua cho project nhưng không có quyền đặt lịch
  // 3: gói mua cho cá nhân
  isNeedFeedback?: boolean
  enabled?: boolean
}

export const useGetPurchasedMentorPackages = ({
  mode,
  isNeedFeedback,
  enabled = true
}: GetPurchasedMentorPackagesParams = {}) => {
  const {
    data: purchasedMentorPackages = getDefaultPaginationResponse<PurchasedMentorPackage>(),
    isLoading: isLoadingPurchasedMentorPackages
  } = useQuery({
    queryKey: queryKeys.mentorPackages.purchased({ mode, isNeedFeedback }),
    queryFn: () => mentorPackageService.getPurchasedMentorPackages({ mode, isNeedFeedback }),
    enabled
  })

  return { purchasedMentorPackages, isLoadingPurchasedMentorPackages }
}
