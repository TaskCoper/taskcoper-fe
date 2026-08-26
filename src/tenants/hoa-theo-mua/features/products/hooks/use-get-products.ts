import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useQuery } from '@tanstack/react-query'
import { productKeys } from '../query-keys'
import productService from '../services'

export interface GetProductsParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  categoryIds?: string[]
  priceFrom?: number
  priceTo?: number
  sortBy?: string[]
  isPin?: boolean
}

export const useGetProducts = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  categoryIds,
  priceFrom,
  priceTo,
  sortBy,
  isPin
}: GetProductsParams) => {
  const { data: products, isLoading: isGettingProducts } = useQuery({
    queryKey: productKeys.list({ pageIndex, pageSize, search, categoryIds, priceFrom, priceTo, sortBy, isPin }),
    queryFn: () =>
      productService.getProducts({ pageIndex, pageSize, search, categoryIds, priceFrom, priceTo, sortBy, isPin })
  })

  return { products, isGettingProducts }
}
