import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { MentorPackage } from '@/types/mentor-package.type'
import { useQuery } from '@tanstack/react-query'

export interface GetMentorPackagesParams {
  mentorId?: string
  enabled?: boolean
  isPin?: boolean
}

export const useGetMentorPackages = ({ mentorId, enabled = true, isPin = true }: GetMentorPackagesParams) => {
  const { data: mentorPackages = getDefaultPaginationResponse<MentorPackage>(), isLoading: isLoadingMentorPackages } =
    useQuery({
      queryKey: queryKeys.mentorPackages.list({ mentorId, isPin }),
      queryFn: () => mentorPackageService.getMentorPackages({ mentorId, isPin }),
      enabled: !!mentorId && enabled
    })

  return { mentorPackages, isLoadingMentorPackages }
}
