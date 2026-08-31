import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { useInfiniteQuery } from '@tanstack/react-query'
import { productKeys } from '../query-keys'
import productService from '../services'
import type { GetProductsParams } from './use-get-products'

const DEFAULT_INFINITE_PAGE_SIZE = 20

/**
 * Catalog browsing for the add-to-pinned picker, where the user scrolls a full-height list rather
 * than clicking through pages. Same endpoint and filters as `useGetProducts`, different key
 * namespace so the two caches never collide.
 */
export const useGetProductsInfinite = ({
  pageSize = DEFAULT_INFINITE_PAGE_SIZE,
  enabled = true,
  ...params
}: GetProductsParams & { enabled?: boolean } = {}) => {
  const query = useInfiniteQuery({
    queryKey: productKeys.listInfinite({ ...params, pageSize }),
    queryFn: ({ pageParam = DEFAULT_PAGE_INDEX }) =>
      productService.getProducts({ ...params, pageIndex: pageParam, pageSize }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage) => {
      const { pageIndex, totalCount, pageSize: currentPageSize } = lastPage.value
      const totalPages = Math.ceil(totalCount / currentPageSize)

      return pageIndex < totalPages ? pageIndex + 1 : undefined
    },
    enabled
  })

  return {
    products: query.data?.pages.flatMap((page) => page.value.items) ?? [],
    totalCount: query.data?.pages[0]?.value.totalCount ?? 0,
    isGettingProducts: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage
  }
}
