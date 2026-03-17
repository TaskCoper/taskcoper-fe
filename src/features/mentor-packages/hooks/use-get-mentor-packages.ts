import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { MentorPackage } from '@/types/mentor-package.type'
import { useQuery } from '@tanstack/react-query'

export const useGetMentorPackages = ({ mentorId }: { mentorId?: string }) => {
  const { data: mentorPackages = getDefaultPaginationResponse<MentorPackage>(), isLoading: isLoadingMentorPackages } =
    useQuery({
      queryKey: queryKeys.mentorPackages.list({ mentorId }),
      queryFn: () => mentorPackageService.getMentorPackages({ mentorId }),
      enabled: !!mentorId
    })

  return { mentorPackages, isLoadingMentorPackages }
}
