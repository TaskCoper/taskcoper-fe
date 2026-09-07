import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type { CreateFloralMockupPayload, FloralMockupListItem, GetFloralMockupsParams } from './types'

class FloralMockupService extends BaseService {
  private readonly baseUrl = 'mockups'

  getFloralMockups = async ({ search, pageIndex, pageSize, isActive }: GetFloralMockupsParams) => {
    const { data } = await this.get<BasePaginationResponse<FloralMockupListItem>>(`/v1/${this.baseUrl}`, {
      params: {
        search,
        pageIndex,
        pageSize,
        isActive
      }
    })
    return data.value
  }

  addFloralMockup = async (body: CreateFloralMockupPayload) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)
    return data.value
  }

  changeStatusFloralMockup = async (id: string) => {
    const { data } = await this.patch<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/status`)
    return data.value
  }

  deleteFloralMockup = async (id: string) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}`)
    return data.value
  }
}

const floralMockupService = new FloralMockupService()
export default floralMockupService
