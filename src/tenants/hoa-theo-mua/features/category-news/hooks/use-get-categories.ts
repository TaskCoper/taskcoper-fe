import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import newsCategoryService from '../services'
import type { GetCategoryParams, NewsCategoryRow } from '../types'

export const useGetCategories = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE
}: GetCategoryParams = {}) => {
  const { data: categories = getDefaultPaginationResponse<NewsCategoryRow>(), isLoading: isLoadingCategories } =
    useQuery({
      queryKey: ['categoriesNews', pageIndex, pageSize],
      queryFn: () => newsCategoryService.getNewsCategories({ pageIndex, pageSize })
    })

  return { categories, isLoadingCategories }
}
