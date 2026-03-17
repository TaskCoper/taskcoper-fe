import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { MentorPackage } from '@/types/mentor-package.type'
import { useQuery } from '@tanstack/react-query'

export const useGetMyMentorPackages = () => {
  const { data: mentorPackages = getDefaultPaginationResponse<MentorPackage>(), isLoading: isLoadingMyMentorPackages } =
    useQuery({
      queryKey: queryKeys.mentorPackages.my(),
      queryFn: () => mentorPackageService.getMyMentorPackages()
    })

  return { mentorPackages, isLoadingMyMentorPackages }
}
