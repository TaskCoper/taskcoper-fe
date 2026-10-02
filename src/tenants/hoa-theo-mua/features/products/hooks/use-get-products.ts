import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useQuery } from '@tanstack/react-query'
import { productKeys } from '../query-keys'
import productService from '../services'
import type { ProductTypeFilterValue } from '../types'

export interface GetProductsParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  categoryIds?: string[]
  priceFrom?: number
  priceTo?: number
  sortBy?: string[]
  isPin?: boolean
  isActive?: boolean
  productType?: ProductTypeFilterValue
  productHierarchy?: number
}

export const useGetProducts = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  categoryIds,
  priceFrom,
  priceTo,
  sortBy,
  isPin,
  isActive,
  productType
}: GetProductsParams) => {
  const { data: products, isLoading: isGettingProducts } = useQuery({
    queryKey: productKeys.list({
      pageIndex,
      pageSize,
      search,
      categoryIds,
      priceFrom,
      priceTo,
      sortBy,
      isPin,
      isActive,
      productType
    }),
    queryFn: () =>
      productService.getProducts({
        pageIndex,
        pageSize,
        search,
        categoryIds,
        priceFrom,
        priceTo,
        sortBy,
        isPin,
        isActive,
        productType
      })
  })

  return { products, isGettingProducts }
}
