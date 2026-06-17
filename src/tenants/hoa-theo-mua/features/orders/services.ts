import htmApi from '../../lib/api'
import type { ShippingLocation, ShippingLocationType } from './types'

interface GetOrderShippingLocationsBody {
  locationVersion: 'v2'
  type: ShippingLocationType
  parentId?: number
}

class OrderService {
  private readonly baseUrl = 'orders'

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
