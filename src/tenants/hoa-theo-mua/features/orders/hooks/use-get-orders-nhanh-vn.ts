import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import orderService from '../services'
import type { GetOrdersNhanhVnParams } from '../types'

export const useGetOrdersNhanhVn = (params?: GetOrdersNhanhVnParams) => {
  const { data: nhanhVnOrdersResponse, isLoading: isLoadingNhanhVnOrders } = useQuery({
    queryKey: queryKeys.htmOrdersNhanhVn.list(params),
    queryFn: () =>
      orderService.getOrdersNhanhVn({
        filters: {
          createdAtFrom: params?.createdAtFrom,
          createdAtTo: params?.createdAtTo,
          saleName: params?.saleName
        },
        dataOptions: {}
      }),
    throwOnError: false
  })

  return {
    nhanhVnOrders: nhanhVnOrdersResponse?.data ?? [],
    isLoadingNhanhVnOrders
  }
}
