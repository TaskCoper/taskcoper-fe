import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import categoryService from '../services'
import type { Category, GetCategoriesParams } from '../types'

export const useGetCategories = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  keyword
}: GetCategoriesParams = {}) => {
  const { data: categories = getDefaultPaginationResponse<Category>(), isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categoryProducts', pageIndex, pageSize, keyword],
    queryFn: () => categoryService.getCategories({ pageIndex, pageSize, keyword })
  })

  return { categories, isLoadingCategories }
}
