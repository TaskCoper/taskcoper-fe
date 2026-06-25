import type { BaseResponse } from '@/lib/axios'
import type { Depot, OrderTag } from '../types/nhanhvn.type'
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
}

const nhanhVNService = new NhanhVNService()
export default nhanhVNService
