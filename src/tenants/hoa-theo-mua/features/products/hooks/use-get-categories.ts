import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import { categoryProductService } from '../services'
import type { CategoryProduct, GetCategoryProductsParams } from '../types'

export const useGetCategories = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  keyword = ''
}: GetCategoryProductsParams = {}) => {
  const { data: categories = getDefaultPaginationResponse<CategoryProduct>(), isLoading: isLoadingCategories } =
    useQuery({
      queryKey: ['categoryProducts', pageIndex, pageSize, keyword],
      queryFn: () => categoryProductService.getCategories({ pageIndex, pageSize, keyword })
    })

  return { categories, isLoadingCategories }
}
