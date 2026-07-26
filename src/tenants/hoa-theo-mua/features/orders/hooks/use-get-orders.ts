import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useQuery } from '@tanstack/react-query'
import orderService from '../services'

export interface GetOrdersParams {
  pageIndex?: number
  pageSize?: number
}

export const useGetOrders = ({ pageIndex = DEFAULT_PAGE_INDEX, pageSize = DEFAULT_PAGE_SIZE }: GetOrdersParams) => {
  const { data: orders, isLoading: isGettingOrders } = useQuery({
    queryKey: ['orders', pageIndex, pageSize],
    queryFn: () => orderService.getOrders({ pageIndex, pageSize })
  })

  return { orders, isGettingOrders }
}
