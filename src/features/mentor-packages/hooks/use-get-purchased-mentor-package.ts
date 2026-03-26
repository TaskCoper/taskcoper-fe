import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { useQuery } from '@tanstack/react-query'

export const useGetPurchasedMentorPackage = ({ packageId }: { packageId?: string }) => {
  const { data: purchasedMentorPackage, isLoading: isLoadingPurchasedMentorPackage } = useQuery({
    queryKey: queryKeys.mentorPackages.purchasedDetail(packageId),
    queryFn: () => mentorPackageService.getPurchasedMentorPackage({ packageId }),
    enabled: !!packageId
  })

  return { purchasedMentorPackage, isLoadingPurchasedMentorPackage }
}
