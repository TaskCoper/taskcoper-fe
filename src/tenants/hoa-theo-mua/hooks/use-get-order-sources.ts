import { useQuery } from '@tanstack/react-query'
import nhanhVNService from '../services/nhanhvn.service'

export const useGetOrderSources = () => {
  const {
    data: orderSources = [],
    isLoading: isLoadingOrderSources,
    refetch: refetchOrderSources
  } = useQuery({
    queryKey: ['order-sources'],
    queryFn: nhanhVNService.getOrderSources
  })

  return { orderSources, isLoadingOrderSources, refetchOrderSources }
}
