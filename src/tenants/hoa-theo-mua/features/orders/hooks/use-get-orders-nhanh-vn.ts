import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import orderService from '../services'

export const useGetOrdersNhanhVn = () => {
  const { data: nhanhVnOrdersResponse, isLoading: isLoadingNhanhVnOrders } = useQuery({
    queryKey: queryKeys.htmOrdersNhanhVn.list(),
    queryFn: () => orderService.getOrdersNhanhVn(),
    throwOnError: false
  })

  return {
    nhanhVnOrders: nhanhVnOrdersResponse?.data ?? [],
    isLoadingNhanhVnOrders
  }
}
