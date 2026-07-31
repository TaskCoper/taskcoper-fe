import { useQuery } from '@tanstack/react-query'
import orderService from '../services'

export interface GetSystemOrdersParams {
  pageIndex?: number
  pageSize?: number
  search?: string
}

export const useGetSystemOrders = ({ pageIndex, pageSize, search }: GetSystemOrdersParams) => {
  const { data: systemOrders, isLoading: isGettingSystemOrders } = useQuery({
    queryKey: ['orders', 'system', pageIndex, pageSize, search],
    queryFn: () => orderService.getSystemOrders({ pageIndex, pageSize, search })
  })

  return { systemOrders, isGettingSystemOrders }
}
