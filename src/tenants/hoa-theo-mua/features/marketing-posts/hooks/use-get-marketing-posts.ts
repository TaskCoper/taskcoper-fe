import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { marketingPostKeys } from '../query-keys'
import marketingPostService from '../services'
import type { GetMarketingPostsParams } from '../types'

export const useGetMarketingPosts = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  keyword,
  platform,
  status
}: GetMarketingPostsParams) => {
  const params = { pageIndex, pageSize, keyword, platform, status }
  const { data: marketingPosts, isLoading: isGettingMarketingPosts } = useQuery({
    queryKey: marketingPostKeys.list(params),
    queryFn: () => marketingPostService.getMarketingPosts(params),
    placeholderData: keepPreviousData
  })

  return { marketingPosts, isGettingMarketingPosts }
}
