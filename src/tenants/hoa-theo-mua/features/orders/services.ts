import type { BasePaginationResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { NhanhVnOrdersRequest, NhanhVnOrdersResponse, OrderRow } from './types'
import type { GetOrdersParams } from './hooks/use-get-orders'

class OrderService {
  private readonly baseUrl = 'orders'
  private readonly baseNhanhUrl = 'orders/nhanh-vn'

  getOrders = async ({ pageIndex, pageSize }: GetOrdersParams) => {
    const { data } = await htmApi.get<BasePaginationResponse<OrderRow>>(`v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize
      }
    })
    return data
  }

  getOrdersNhanhVn = async (body?: NhanhVnOrdersRequest) => {
    const { data } = await htmApi.post<NhanhVnOrdersResponse>(`v1/${this.baseNhanhUrl}`, body)
    return data
  }
}

const orderService = new OrderService()

export default orderService
