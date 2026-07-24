import { useQuery } from '@tanstack/react-query'
import productService from '../services'

export const useGetProduct = ({ id, enabled = true }: { id: string | number; enabled?: boolean }) => {
  const { data: product, isLoading: isGettingProduct } = useQuery({
    queryKey: ['product', String(id)],
    queryFn: () => productService.getProduct({ id }),
    enabled: enabled && id !== '' && id != null
  })

  return { product, isGettingProduct }
}
