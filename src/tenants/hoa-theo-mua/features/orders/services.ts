import htmApi from '../../lib/api'
import type { NhanhVnOrdersRequest, NhanhVnOrdersResponse, ShippingLocation, ShippingLocationType } from './types'

interface GetOrderShippingLocationsBody {
  locationVersion: 'v2'
  type: ShippingLocationType
  parentId?: number
}

class OrderService {
  private readonly baseUrl = 'orders/nhanh-vn'

  getOrdersNhanhVn = async (body?: NhanhVnOrdersRequest) => {
    const { data } = await htmApi.post<NhanhVnOrdersResponse>(`v1/${this.baseUrl}`, body)

    return data
  }

  getOrderShippingLocations = async (body: GetOrderShippingLocationsBody) => {
    const { data } = await htmApi.post<{ code: number; data: ShippingLocation[] }>(
      `v1/${this.baseUrl}/shipping-location`,
      body
    )

    return data.data
  }
}

const orderService = new OrderService()
export default orderService
