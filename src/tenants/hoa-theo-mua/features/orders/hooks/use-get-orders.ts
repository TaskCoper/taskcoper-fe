import { useQuery } from '@tanstack/react-query'
import orderService from '../services'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { OrderRow } from '../types'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'

export interface GetOrdersParams {
  pageIndex?: number
  pageSize?: number
  keyword?: string
  status?: string
}

export const useGetOrders = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  keyword,
  status
}: GetOrdersParams = {}) => {
  const { data: orders = getDefaultPaginationResponse<OrderRow>(), isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders', pageIndex, pageSize, keyword, status],
    queryFn: () => orderService.getOrders({ pageIndex, pageSize, keyword, status })
  })
  return { orders, isOrdersLoading }
}

export default orderService
