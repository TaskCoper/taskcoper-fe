import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import articleService from '../services'
import type { CategoryData } from '../types'

export interface GetCategoryNewsParam {
  pageIndex?: number
  pageSize?: number
}

export const useGetCategoryNew = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE
}: GetCategoryNewsParam = {}) => {
  const { data: categoryNews = getDefaultPaginationResponse<CategoryData>(), isLoading: isLoadingCategory } = useQuery({
    queryKey: ['categoryNews', pageIndex, pageSize],
    queryFn: () => articleService.getCategoryNews({ pageIndex, pageSize })
  })
  return { categoryNews, isLoadingCategory }
}
