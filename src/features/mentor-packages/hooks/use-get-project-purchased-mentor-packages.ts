import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { PurchasedMentorPackage } from '@/types/mentor-package.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectPurchasedMentorPackages = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const {
    data: projectMentorPackages = getDefaultPaginationResponse<PurchasedMentorPackage>(),
    isLoading: isLoadingProjectMentorPackages
  } = useQuery({
    queryKey: queryKeys.mentorPackages.projectPurchased(projectIdentifier),
    queryFn: () => mentorPackageService.getProjectPurchasedMentorPackages({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectMentorPackages, isLoadingProjectMentorPackages }
}
