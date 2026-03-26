import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { PurchasedMentorPackage } from '@/types/mentor-package.type'
import { useQuery } from '@tanstack/react-query'

export const useGetPurchasedMentorPackages = () => {
  const {
    data: purchasedMentorPackages = getDefaultPaginationResponse<PurchasedMentorPackage>(),
    isLoading: isLoadingPurchasedMentorPackages
  } = useQuery({
    queryKey: queryKeys.mentorPackages.purchased(),
    queryFn: () => mentorPackageService.getPurchasedMentorPackages()
  })

  return { purchasedMentorPackages, isLoadingPurchasedMentorPackages }
}
