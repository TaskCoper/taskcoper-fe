import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { MentorPackage } from '@/types/mentor-package.type'
import { useQuery } from '@tanstack/react-query'

interface UseGetMentorPackagesProps {
  mentorId?: string
  enabled?: boolean
}

export const useGetMentorPackages = ({ mentorId, enabled = true }: UseGetMentorPackagesProps) => {
  const { data: mentorPackages = getDefaultPaginationResponse<MentorPackage>(), isLoading: isLoadingMentorPackages } =
    useQuery({
      queryKey: queryKeys.mentorPackages.list({ mentorId }),
      queryFn: () => mentorPackageService.getMentorPackages({ mentorId }),
      enabled: !!mentorId && enabled
    })

  return { mentorPackages, isLoadingMentorPackages }
}
