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
          ids: params?.ids,
          depotIds: params?.depotIds
        },
        paginator: {
          size: params?.size ?? 10,
          ...(params?.nextCursor ? { next: params.nextCursor } : {})
        },
        dataOptions: {}
      }),
    throwOnError: false
  })

  return {
    nhanhVnOrders: nhanhVnOrdersResponse?.data ?? [],
    paginator: nhanhVnOrdersResponse?.paginator,
    isLoadingNhanhVnOrders
  }
}
