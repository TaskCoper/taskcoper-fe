import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type { RecruitmentRequestsParams } from './hooks/use-get-recruitment-requests'
import type { RecruitmentRequest } from './types'

class RecruitmentRequestService extends BaseService {
  private readonly baseUrl = 'recruitment-requests'

  getRecruitmentRequests = async ({ page, pageSize, isRead }: RecruitmentRequestsParams) => {
    const { data } = await this.get<BasePaginationResponse<RecruitmentRequest>>(`/v1/${this.baseUrl}`, {
      params: { page, pageSize, isRead }
    })

    return data
  }

  getRecruitmentRequest = async ({ id }: { id?: string }) => {
    const { data } = await this.get<BaseResponse<RecruitmentRequest>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  readRecruitmentRequest = async ({ id }: { id: string }) => {
    const { data } = await this.patch<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/read`)

    return data.value
  }
}

const recruitmentRequestService = new RecruitmentRequestService()
export default recruitmentRequestService
