import { useQuery } from '@tanstack/react-query'
import productService from '../services'

export const useGetMaxPriceProduct = ({ categoryId }: { categoryId?: string } = {}) => {
  const { data: maxPrice, isLoading: isGettingMaxPriceProduct } = useQuery({
    queryKey: ['products', 'max-price', categoryId],
    queryFn: () => productService.getMaxPriceProduct({ categoryId })
  })

  return { maxPrice, isGettingMaxPriceProduct }
}
