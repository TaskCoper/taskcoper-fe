import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useQuery } from '@tanstack/react-query'
import productService from '../services'

export interface GetProductsParams {
  PageIndex?: number
  PageSize?: number
  PriceFrom?: number
  PriceTo?: number
  SortBy?: string[]
}

export const useGetProducts = ({
  PageIndex = DEFAULT_PAGE_INDEX,
  PageSize = DEFAULT_PAGE_SIZE,
  PriceFrom,
  PriceTo,
  SortBy
}: GetProductsParams) => {
  const { data: products, isLoading: isGettingProducts } = useQuery({
    queryKey: ['products', PageIndex, PageSize, PriceFrom, PriceTo, SortBy],
    queryFn: () => productService.getProducts({ PageIndex, PageSize, PriceFrom, PriceTo, SortBy })
  })

  return { products, isGettingProducts }
}
