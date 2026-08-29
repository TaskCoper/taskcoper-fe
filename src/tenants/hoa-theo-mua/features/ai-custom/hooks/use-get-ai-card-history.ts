import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getMockAiCardHistory } from '../mock-data'
import { aiCardKeys } from '../query-keys'
import type { GetAiCardHistoryParams } from '../types'

export const useGetAiCardHistory = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  sizeId,
  writingMode
}: GetAiCardHistoryParams) => {
  const params = { pageIndex, pageSize, search, sizeId, writingMode }
  const { data: aiCardHistory, isLoading: isGettingAiCardHistory } = useQuery({
    queryKey: aiCardKeys.list(params),
    queryFn: () => getMockAiCardHistory(params),
    placeholderData: keepPreviousData
  })

  return { aiCardHistory, isGettingAiCardHistory }
}
