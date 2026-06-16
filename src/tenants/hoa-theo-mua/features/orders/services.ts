import type { BasePaginationResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { OrderRow } from './types'
import type { GetOrdersParams } from './hooks/use-get-orders'

class OrderService {
  private readonly baseUrl = 'orders'

  getOrders = async ({ pageIndex, pageSize }: GetOrdersParams) => {
    const { data } = await htmApi.get<BasePaginationResponse<OrderRow>>(`v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize
      }
    })
    return data
  }
}

const orderService = new OrderService()

export default orderService
