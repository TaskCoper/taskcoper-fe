import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getMockFloralMockups } from '../mock-data'
import { floralMockupKeys } from '../query-keys'
import type { GetFloralMockupsParams } from '../types'

export const useGetFloralMockups = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  isActive
}: GetFloralMockupsParams) => {
  const params = { pageIndex, pageSize, search, isActive }
  const {
    data: floralMockups,
    isLoading: isGettingFloralMockups,
    isFetching: isFetchingFloralMockups,
    isError: isGetFloralMockupsError,
    refetch: refetchFloralMockups
  } = useQuery({
    queryKey: floralMockupKeys.list(params),
    queryFn: () => getMockFloralMockups(params),
    placeholderData: keepPreviousData,
    retry: false
  })

  return {
    floralMockups,
    isGettingFloralMockups,
    isFetchingFloralMockups,
    isGetFloralMockupsError,
    refetchFloralMockups
  }
}
