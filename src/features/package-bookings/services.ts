import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { TransactionTargetModel } from '../transactions/types'
import type { GetMyIncomingRequestsParams } from './hooks/use-get-my-incoming-requests'
import type { GetMyOutgoingRequestsParams } from './hooks/use-get-my-outgoing-requests'
import type {
  PackageIncomingRequest,
  PackageIncomingRequestDetail,
  PackageOutgoingRequest,
  PackageOutgoingRequestDetail
} from './types'
import type { BookPackageFormValues, RequestPackageFormValues, ReviewPackageFormValues } from './validations'

class PackageBookingService extends BaseService {
  private readonly baseUrl = 'package-bookings'

  bookPackage = async ({ body }: { body: BookPackageFormValues }) => {
    const { data } = await this.post<
      BaseResponse<{
        transactionId: string
        isAmountZero: boolean
        targetModel: TransactionTargetModel
        targetModelId: string
      }>
    >(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  requestPackage = async ({ body }: { body: RequestPackageFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/requests`, body)

    return data.value
  }

  getMyIncomingRequests = async ({
    mentorPackageId,
    status,
    pageIndex,
    pageSize,
    searchTerm
  }: GetMyIncomingRequestsParams) => {
    const { data } = await this.get<BasePaginationResponse<PackageIncomingRequest>>(
      `/v1/${this.baseUrl}/requests/incoming`,
      {
        params: { mentorPackageId, status, pageIndex, pageSize, searchTerm }
      }
    )

    return data
  }

  getMyOutgoingRequests = async ({ mentorPackageId, status, pageIndex, pageSize }: GetMyOutgoingRequestsParams) => {
    const { data } = await this.get<BasePaginationResponse<PackageOutgoingRequest>>(`/v1/${this.baseUrl}/requests/me`, {
      params: { mentorPackageId, status, pageIndex, pageSize }
    })

    return data
  }

  getIncomingRequest = async ({ requestId }: { requestId?: string }) => {
    if (!requestId) return null
    const { data } = await this.get<BaseResponse<PackageIncomingRequestDetail>>(
      `/v1/${this.baseUrl}/requests/incoming/${requestId}`
    )

    return data.value
  }

  getOutgoingRequest = async ({ requestId }: { requestId?: string }) => {
    if (!requestId) return null
    const { data } = await this.get<BaseResponse<PackageOutgoingRequestDetail>>(
      `/v1/${this.baseUrl}/requests/${requestId}`
    )

    return data.value
  }

  reviewRequest = async ({ body }: { body: ReviewPackageFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/requests/${body.requestId}/review`,
      body
    )

    return data.value
  }

  cancelRequest = async ({ requestId }: { requestId: string }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/requests/${requestId}/cancel`)

    return data.value
  }
}

const packageBookingService = new PackageBookingService()
export default packageBookingService
