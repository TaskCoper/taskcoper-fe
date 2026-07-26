import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type { GetOrdersParams } from './hooks/use-get-orders'
import type { Order, ShippingLocation, ShippingLocationType } from './types'

interface GetOrderShippingLocationsBody {
  locationVersion: 'v2'
  type: ShippingLocationType
  parentId?: number
}

class OrderService extends BaseService {
  private readonly baseUrl = 'orders'

  getOrders = async ({ pageIndex, pageSize }: GetOrdersParams) => {
    const { data } = await this.get<BasePaginationResponse<Order>>(`/v1/nhanh-vn/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize
      }
    })

    return data
  }

  getOrder = async ({ id }: { id?: string }) => {
    const { data } = await this.get<BaseResponse<Order>>(`/v1/nhanh-vn/${this.baseUrl}/${id}`)

    return data.value
  }

  getOrderShippingLocations = async (body: GetOrderShippingLocationsBody) => {
    const { data } = await this.post<BaseResponse<{ code: number; data: ShippingLocation[] }>>(
      `/v1/${this.baseUrl}/shipping-location`,
      {
        filters: body
      }
    )

    return data.value.data
  }
}

const orderService = new OrderService()
export default orderService
