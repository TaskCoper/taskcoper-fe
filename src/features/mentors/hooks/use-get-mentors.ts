import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import mentorService from '../services'
import type { Mentor } from '../types'

export interface GetMentorsParams {
  pageIndex?: number
  pageSize?: number
  domainIds?: string[]
  searchTerm?: string
  rating?: number
  sortBy?: string[]
}

export const useGetMentors = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  domainIds,
  searchTerm,
  rating,
  sortBy
}: GetMentorsParams = {}) => {
  const { data: mentors = getDefaultPaginationResponse<Mentor>(), isLoading: isLoadingMentors } = useQuery({
    queryKey: queryKeys.mentors.list({
      pageIndex,
      pageSize,
      domainIds,
      searchTerm,
      rating,
      sortBy
    }),
    queryFn: () =>
      mentorService.getMentors({
        pageIndex,
        pageSize,
        domainIds,
        searchTerm,
        rating,
        sortBy
      })
  })

  return { mentors, isLoadingMentors }
}
