import { useQuery } from '@tanstack/react-query'
import nhanhVNService from '../services/nhanhvn.service'

export const useGetOrderTags = () => {
  const { data: orderTags = [], isLoading: isLoadingOrderTags } = useQuery({
    queryKey: ['order-tags'],
    queryFn: nhanhVNService.getOrderTags
  })

  return { orderTags, isLoadingOrderTags }
}
