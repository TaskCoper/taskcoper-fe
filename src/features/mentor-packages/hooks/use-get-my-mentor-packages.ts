import type { MentorPackage } from '@/features/mentor-packages/types'
import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import mentorPackageService from '../services'

export interface GetMyMentorPackagesParams {
  pageIndex?: number
  pageSize?: number
  sortBy?: string
  searchTerm?: string
  isPin?: boolean
}

export const useGetMyMentorPackages = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  sortBy,
  searchTerm,
  isPin
}: GetMyMentorPackagesParams = {}) => {
  const { data: mentorPackages = getDefaultPaginationResponse<MentorPackage>(), isLoading: isLoadingMyMentorPackages } =
    useQuery({
      queryKey: queryKeys.mentorPackages.my({
        pageIndex,
        pageSize,
        sortBy,
        searchTerm,
        isPin
      }),
      queryFn: () =>
        mentorPackageService.getMyMentorPackages({
          pageIndex,
          pageSize,
          sortBy,
          searchTerm,
          isPin
        })
    })

  return { mentorPackages, isLoadingMyMentorPackages }
}
