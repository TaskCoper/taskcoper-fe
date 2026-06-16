import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import articleService from '../services'
import type { ArticleRow } from '../types'

export interface GetArticlesParams {
  pageIndex?: number
  pageSize?: number
  keyword?: string
  status?: number
}
export const useGetArticles = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  keyword,
  status
}: GetArticlesParams = {}) => {
  const { data: articles = getDefaultPaginationResponse<ArticleRow>(), isLoading: isLoadingArticle } = useQuery({
    queryKey: ['articels', pageIndex, pageSize, keyword, status],
    queryFn: () => articleService.getArticles({ pageIndex, pageSize, keyword, status })
  })
  return { articles, isLoadingArticle }
}
