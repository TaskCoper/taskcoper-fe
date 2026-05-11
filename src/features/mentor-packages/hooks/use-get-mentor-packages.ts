import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import mentorPackageService from '../services'
import type { MentorPackage } from '../types'

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
