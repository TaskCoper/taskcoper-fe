import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { useQuery } from '@tanstack/react-query'

export const useGetPurchasedMentorPackages = () => {
  const { data: purchasedMentorPackages, isLoading: isLoadingPurchasedMentorPackages } = useQuery({
    queryKey: queryKeys.mentorPackages.purchased(),
    queryFn: () => mentorPackageService.getPurchasedMentorPackages()
  })

  return { purchasedMentorPackages, isLoadingPurchasedMentorPackages }
}
