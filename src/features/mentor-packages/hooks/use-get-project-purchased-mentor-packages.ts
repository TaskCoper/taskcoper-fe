import type { PurchasedMentorPackage } from '@/features/mentor-packages/types'
import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import mentorPackageService from '../services'

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
