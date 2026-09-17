import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { floralMockupKeys } from '../query-keys'
import type { GetFloralMockupsParams } from '../types'
import floralMockupService from '../services'

export const useGetFloralMockups = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  isActive,
  type
}: GetFloralMockupsParams) => {
  const params = { pageIndex, pageSize, search, isActive, type }
  const {
    data: floralMockups,
    isLoading: isGettingFloralMockups,
    isFetching: isFetchingFloralMockups,
    isError: isGetFloralMockupsError,
    refetch: refetchFloralMockups
  } = useQuery({
    queryKey: floralMockupKeys.list(params),
    queryFn: () => floralMockupService.getFloralMockups(params),
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
