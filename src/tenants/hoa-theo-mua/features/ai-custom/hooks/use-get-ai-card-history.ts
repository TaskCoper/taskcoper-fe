import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { aiCardKeys } from '../query-keys'
import generateAiService from '../services'
import type { GetAiCardHistoryParams } from '../types'

export const useGetAiCardHistory = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  id,
  size,
  cardTemplateName,
  formType
}: GetAiCardHistoryParams) => {
  const params = { id, pageIndex, pageSize, size, cardTemplateName, formType }
  const { data: aiCardHistory, isLoading: isGettingAiCardHistory } = useQuery({
    queryKey: aiCardKeys.list(params),
    queryFn: () => generateAiService.getAiCardHistory(params),
    placeholderData: keepPreviousData
  })

  return { aiCardHistory, isGettingAiCardHistory }
}
