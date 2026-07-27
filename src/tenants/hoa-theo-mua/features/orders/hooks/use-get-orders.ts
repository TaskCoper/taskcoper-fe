import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useQuery } from '@tanstack/react-query'
import orderService from '../services'

export interface GetOrdersParams {
  pageIndex?: number
  pageSize?: number
  search?: string
}

export const useGetOrders = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  search
}: GetOrdersParams) => {
  const { data: orders, isLoading: isGettingOrders } = useQuery({
    queryKey: ['orders', pageIndex, pageSize, search],
    queryFn: () => orderService.getOrders({ pageIndex, pageSize, search })
  })

  return { orders, isGettingOrders }
}
