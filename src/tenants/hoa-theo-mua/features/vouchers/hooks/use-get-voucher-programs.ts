import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import voucherService from '../services'
import { voucherKeys } from './query-keys'
import type { GetProgramsParams } from '../types'

export const useGetVoucherPrograms = (params: GetProgramsParams = {}) => {
  const queryParams = { pageIndex: DEFAULT_PAGE_INDEX, pageSize: DEFAULT_PAGE_SIZE, ...params }
  const programs = useQuery({
    queryKey: voucherKeys.programList(queryParams),
    queryFn: () => voucherService.getPrograms(queryParams),
    placeholderData: keepPreviousData
  })

  return { programs, isGettingPrograms: programs.isLoading, isFetchingPrograms: programs.isFetching }
}
