import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import productService from '../../products/services'
import { PRODUCT_TYPE_FILTER } from '../../products/types'
import { getMockAiFlowerDesignComboOptions, getMockAiFlowerDesignHistory } from '../ai-flower-design-mock-data'
import { aiFlowerDesignKeys } from '../query-keys'
import generateAiService from '../services'
import type {
  AiFlowerDesignComboOptionsPage,
  GetAiFlowerDesignComboOptionsParams,
  GetAiFlowerDesignHistoryParams
} from '../types'

const EMPTY_COMBO_OPTIONS_PAGE: AiFlowerDesignComboOptionsPage = {
  items: [],
  pageIndex: 1,
  pageSize: 5,
  totalCount: 0,
  hasNextPage: false,
  hasPreviousPage: false
}

export const useGetAiFlowerDesignHistory = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  comboIds
}: GetAiFlowerDesignHistoryParams) => {
  const params = { pageIndex, pageSize, search, comboIds }
  const { data: aiFlowerDesignHistory, isLoading: isGettingAiFlowerDesignHistory } = useQuery({
    queryKey: aiFlowerDesignKeys.list(params),
    queryFn: async () => {
      try {
        return await generateAiService.getAiFlowerDesignHistory(params)
      } catch {
        return getMockAiFlowerDesignHistory(params)
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: 'always'
  })

  return { aiFlowerDesignHistory, isGettingAiFlowerDesignHistory }
}

export const useGetAiFlowerDesignComboOptions = (params: GetAiFlowerDesignComboOptionsParams) => {
  const { data, isFetching: isGettingComboOptions } = useQuery({
    queryKey: aiFlowerDesignKeys.comboOptions(params),
    queryFn: async () => {
      try {
        const response = await productService.getProducts({
          ...params,
          productType: PRODUCT_TYPE_FILTER.combo
        })

        return {
          ...response.value,
          items: response.value.items.map((product) => ({
            id: product.id,
            code: product.productCode,
            name: product.productName || product.productCode || '-',
            imageUrl: product.coverImage
          }))
        }
      } catch {
        return getMockAiFlowerDesignComboOptions(params)
      }
    },
    placeholderData: keepPreviousData
  })

  return { comboOptionsPage: data ?? EMPTY_COMBO_OPTIONS_PAGE, isGettingComboOptions }
}
