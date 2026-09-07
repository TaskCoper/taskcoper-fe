import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getMockCardTemplates } from '../mock-data'
import { cardTemplateKeys } from '../query-keys'
import cardTemplateService from '../services'
import type { GetCardTemplatesParams } from '../types'

export const useGetCardTemplates = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  isActive,
  templateType
}: GetCardTemplatesParams) => {
  const params = { pageIndex, pageSize, search, isActive, templateType }
  const { data: cardTemplates, isLoading: isGettingCardTemplates } = useQuery({
    queryKey: cardTemplateKeys.list(params),
    queryFn: async () => {
      try {
        return await cardTemplateService.getCardTemplates(params)
      } catch {
        return getMockCardTemplates(params)
      }
    },
    placeholderData: keepPreviousData
  })

  return { cardTemplates, isGettingCardTemplates }
}
