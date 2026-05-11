import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import mentorPackageService from '../services'
import type { PurchasedMentorPackage } from '../types'

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
