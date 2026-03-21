import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { useQuery } from '@tanstack/react-query'

export const useGetMentorPackage = ({ packageId }: { packageId?: string }) => {
  const { data: mentorPackage, isLoading: isLoadingMentorPackage } = useQuery({
    queryKey: queryKeys.mentorPackages.detail(packageId),
    queryFn: () => mentorPackageService.getMentorPackage({ packageId }),
    enabled: !!packageId
  })

  return { mentorPackage, isLoadingMentorPackage }
}
