import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getMockAiCardHistory } from '../mock-data'
import { aiCardKeys } from '../query-keys'
import generateAiService from '../services'
import type { GetAiCardHistoryParams } from '../types'

export const useGetAiCardHistory = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  sizeName,
  formType
}: GetAiCardHistoryParams) => {
  const params = { pageIndex, pageSize, search, sizeName, formType }
  const { data: aiCardHistory, isLoading: isGettingAiCardHistory } = useQuery({
    queryKey: aiCardKeys.list(params),
    queryFn: async () =>
      (await generateAiService.getAiCardHistory(params).catch(() => null)) ?? getMockAiCardHistory(params),
    placeholderData: keepPreviousData,
    throwOnError: false
  })

  return { aiCardHistory, isGettingAiCardHistory }
}
