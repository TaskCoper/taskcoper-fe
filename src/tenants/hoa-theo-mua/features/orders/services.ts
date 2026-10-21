import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type { GetOrderDetailCardsParams } from './hooks/use-get-order-detail-cards'
import type { GetOrdersParams } from './hooks/use-get-orders'
import type { GetSystemOrdersParams } from './hooks/use-get-system-orders'
import type {
  Order,
  ShippingLocation,
  ShippingLocationType,
  SystemOrder,
  SystemOrderDetail,
  SystemOrderDetailCard
} from './types'
import type { UpdateOrderFormValues } from './validation'

interface GetOrderShippingLocationsBody {
  locationVersion: 'v2'
  type: ShippingLocationType
  parentId?: number
}

class OrderService extends BaseService {
  private readonly baseUrl = 'orders'

  getOrders = async ({ pageIndex, pageSize, search }: GetOrdersParams) => {
    const { data } = await this.get<BasePaginationResponse<Order>>(`/v1/nhanh-vn/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        search
      }
    })

    return data
  }

  getSystemOrders = async ({ pageIndex, pageSize, search }: GetSystemOrdersParams) => {
    const { data } = await this.get<BasePaginationResponse<SystemOrder>>(`/v1/${this.baseUrl}/admin`, {
      params: { pageIndex, pageSize, search }
    })

    return data
  }

  getOrder = async ({ id }: { id?: string }) => {
    const { data } = await this.get<BaseResponse<Order>>(`/v1/nhanh-vn/${this.baseUrl}/${id}`)

    return data.value
  }

  getSystemOrder = async ({ id }: { id?: string }) => {
    const { data } = await this.get<BaseResponse<SystemOrderDetail>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  getOrderDetailCards = async ({ orderDetailsId, virtualId }: GetOrderDetailCardsParams) => {
    const { data } = await this.get<BaseResponse<{ cards: SystemOrderDetailCard[] }>>(
      `/v1/order-details/${orderDetailsId}/cards`,
      { params: { virtualId } }
    )

    return data.value?.cards ?? []
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

  updateOrder = async ({ body }: { body: UpdateOrderFormValues }) => {
    const { data } = await this.patch<BaseResponse<string>>(`/v1/${this.baseUrl}/update-ahamove`, body)

    return data.value
  }

  manualConfirmPayment = async ({ orderId }: { orderId: string }) => {
    const { data } = await this.post<string>('/v1/sepay/manual-confirm-payment', { orderId })

    return data
  }
}

const orderService = new OrderService()
export default orderService
