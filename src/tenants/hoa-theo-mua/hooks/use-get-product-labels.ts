import { useQuery } from '@tanstack/react-query'
import nhanhVNService from '../services/nhanhvn.service'

export const useGetProductLabels = () => {
  const {
    data: productLabels = [],
    isLoading: isLoadingProductLabels,
    refetch: refetchProductLabels
  } = useQuery({
    queryKey: ['product-labels'],
    queryFn: nhanhVNService.getProductLabels
  })

  return { productLabels, isLoadingProductLabels, refetchProductLabels }
}
