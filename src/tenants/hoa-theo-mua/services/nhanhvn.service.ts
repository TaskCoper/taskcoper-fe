import type { BaseResponse } from '@/lib/axios'
import type { Depot, OrderTag, ProductLabel } from '../types/nhanhvn.type'
import { BaseService } from './base.service'

class NhanhVNService extends BaseService {
  private readonly baseUrl = 'nhanh-vn'

  getDepots = async () => {
    const { data } = await this.post<
      BaseResponse<{
        code: number
        paginator: null
        data: Depot[]
      }>
    >(`/v1/${this.baseUrl}/depot`, {
      filters: {}
    })

    return data.value.data
  }

  getOrderTags = async () => {
    const { data } = await this.post<
      BaseResponse<{
        code: number
        paginator: null
        data: OrderTag[]
      }>
    >(`/v1/${this.baseUrl}/orders-tags`, {
      filters: {}
    })

    return data.value.data
  }

  getOrderSources = async () => {
    const { data } = await this.post<
      BaseResponse<{
        code: number
        paginator: null
        data: OrderTag[]
      }>
    >(`/v1/${this.baseUrl}/orders-sources`, {
      filters: {},
      paginator: {
        size: 100
      }
    })

    return data.value.data
  }

  getProductLabels = async () => {
    const { data } = await this.post<
      BaseResponse<{
        code: number
        paginator: { next: number | null }
        data: ProductLabel[]
      }>
    >(`/v1/${this.baseUrl}/products/label`, {
      filters: {}
    })

    return data.value.data
  }
}

const nhanhVNService = new NhanhVNService()
export default nhanhVNService
