import type { BaseResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { NhanhVnOrdersRequest, NhanhVnOrdersResponse, ShippingLocation, ShippingLocationType } from './types'

interface GetOrderShippingLocationsBody {
  locationVersion: 'v2'
  type: ShippingLocationType
  parentId?: number
}

class OrderService {
  private readonly baseUrl = 'orders/nhanh-vn'
  private readonly baseOrderUrl = 'orders'

  getOrdersNhanhVn = async (body?: NhanhVnOrdersRequest) => {
    const { data } = await htmApi.post<NhanhVnOrdersResponse>(`v1/${this.baseUrl}`, body)

    return data
  }

  getOrderShippingLocations = async (body: GetOrderShippingLocationsBody) => {
    const { data } = await htmApi.post<BaseResponse<{ code: number; data: ShippingLocation[] }>>(
      `v1/${this.baseOrderUrl}/shipping-location`,
      body
    )

    return data.value.data
  }
}

const orderService = new OrderService()
export default orderService
