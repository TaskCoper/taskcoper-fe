import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { MentorPackage } from '@/types/mentor-package.type'
import { useQuery } from '@tanstack/react-query'

export interface GetMentorPackagesParams {
  mentorId?: string
  enabled?: boolean
  limit?: number
}

export const useGetMentorPackages = ({ mentorId, enabled = true, limit }: GetMentorPackagesParams) => {
  const { data: mentorPackages = getDefaultPaginationResponse<MentorPackage>(), isLoading: isLoadingMentorPackages } =
    useQuery({
      queryKey: queryKeys.mentorPackages.list({ mentorId, limit }),
      queryFn: () => mentorPackageService.getMentorPackages({ mentorId, limit }),
      enabled: !!mentorId && enabled
    })

  return { mentorPackages, isLoadingMentorPackages }
}
