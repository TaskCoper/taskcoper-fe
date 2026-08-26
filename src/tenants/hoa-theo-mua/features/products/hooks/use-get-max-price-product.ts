import { useQuery } from '@tanstack/react-query'
import { productKeys } from '../query-keys'
import productService from '../services'

export const useGetMaxPriceProduct = ({ categoryId }: { categoryId?: string } = {}) => {
  const { data: maxPrice, isLoading: isGettingMaxPriceProduct } = useQuery({
    queryKey: productKeys.maxPrice(categoryId),
    queryFn: () => productService.getMaxPriceProduct({ categoryId })
  })

  return { maxPrice, isGettingMaxPriceProduct }
}
