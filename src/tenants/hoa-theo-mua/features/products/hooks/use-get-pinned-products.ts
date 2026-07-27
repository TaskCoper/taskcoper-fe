import { useQuery } from '@tanstack/react-query'
import productService from '../services'

export const useGetPinnedProducts = () => {
  const { data: pinnedProducts, isLoading: isGettingPinnedProducts } = useQuery({
    queryKey: ['products', 'pinned'],
    queryFn: productService.getPinnedProducts
  })

  return { pinnedProducts, isGettingPinnedProducts }
}
