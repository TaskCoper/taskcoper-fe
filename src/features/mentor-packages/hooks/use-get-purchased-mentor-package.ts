import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import mentorPackageService from '../services'

export const useGetPurchasedMentorPackage = ({ packageId }: { packageId?: string }) => {
  const { data: purchasedMentorPackage, isLoading: isLoadingPurchasedMentorPackage } = useQuery({
    queryKey: queryKeys.mentorPackages.purchasedDetail(packageId),
    queryFn: () => mentorPackageService.getPurchasedMentorPackage({ packageId }),
    enabled: !!packageId
  })

  return { purchasedMentorPackage, isLoadingPurchasedMentorPackage }
}
