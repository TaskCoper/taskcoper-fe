import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import newsCategoryService from '../service'
import type { GetCategoryParams, NewsCategoryRow } from '../type'

export const useGetCategoryParam = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE
}: GetCategoryParams = {}) => {
  const { data: category = getDefaultPaginationResponse<NewsCategoryRow>(), isLoading: isLoadingNewsCategory } =
    useQuery({
      queryKey: ['categoryNews', pageIndex, pageSize],
      queryFn: () => newsCategoryService.getNewsCategories({ pageIndex, pageSize })
    })
  return { category, isLoadingNewsCategory }
}
