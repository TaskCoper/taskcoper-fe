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
  sizeKey,
  formType
}: GetAiCardHistoryParams) => {
  const params = { pageIndex, pageSize, search, sizeKey, formType }
  const { data: aiCardHistory, isLoading: isGettingAiCardHistory } = useQuery({
    queryKey: aiCardKeys.list(params),
    queryFn: async () => {
      try {
        return await generateAiService.getAiCardHistory(params)
      } catch {
        return getMockAiCardHistory(params)
      }
    },
    placeholderData: keepPreviousData
  })

  return { aiCardHistory, isGettingAiCardHistory }
}
