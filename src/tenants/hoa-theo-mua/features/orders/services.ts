import htmApi from '../../lib/api'
import type { NhanhVnOrdersRequest, NhanhVnOrdersResponse } from './types'

class OrderService {
  private readonly baseUrl = 'orders/nhanh-vn'

  getOrdersNhanhVn = async (body?: NhanhVnOrdersRequest) => {
    const { data } = await htmApi.post<NhanhVnOrdersResponse>(`v1/${this.baseUrl}`, body)

    return data
  }
}

const orderService = new OrderService()
export default orderService
