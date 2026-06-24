import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'

import type { NhanhVnOrder, NhanhVnOrdersRequest, ShippingLocation, ShippingLocationType } from './types'

interface GetOrderShippingLocationsBody {
  locationVersion: 'v2'
  type: ShippingLocationType
  parentId?: number
}

class OrderService extends BaseService {
  private readonly baseUrl = 'orders'

  getOrdersNhanhVn = async (body?: NhanhVnOrdersRequest) => {
    const { data } = await this.post<BasePaginationResponse<NhanhVnOrder>>(`/v1/${this.baseUrl}/nhanh-vn`, body)

    return data
  }

  getOrderShippingLocations = async (body: GetOrderShippingLocationsBody) => {
    const { data } = await this.post<BaseResponse<{ code: number; data: ShippingLocation[] }>>(
      `/v1/${this.baseUrl}/shipping-location`,
      body
    )

    return data.value.data
  }
}

const orderService = new OrderService()
export default orderService
