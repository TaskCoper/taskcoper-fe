import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { GetMyIncomingRequestsParams } from './hooks/use-get-my-incoming-requests'
import type { GetMyOutcomingRequestsParams } from './hooks/use-get-my-outcoming-requests'
import type {
  PackageIncomingRequest,
  PackageIncomingRequestDetail,
  PackageOutgoingRequest,
  PackageOutgoingRequestDetail
} from './types'
import type { BookPackageFormValues, RequestPackageFormValues, ReviewPackageFormValues } from './validations'

class PackageBookingService {
  private readonly baseUrl = 'package-bookings'

  bookPackage = async ({ body }: { body: BookPackageFormValues }) => {
    const { data } = await api.post<BaseResponse<{ transactionId: string }>>(`/v1/${this.baseUrl}`, body)

    return data.value.transactionId
  }

  requestPackage = async ({ body }: { body: RequestPackageFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/requests`, body)

    return data.value
  }

  getMyIncomingRequests = async ({
    mentorPackageId,
    status,
    pageIndex,
    pageSize,
    searchTerm
  }: GetMyIncomingRequestsParams) => {
    const { data } = await api.get<BasePaginationResponse<PackageIncomingRequest>>(
      `/v1/${this.baseUrl}/requests/incoming`,
      {
        params: { mentorPackageId, status, pageIndex, pageSize, searchTerm }
      }
    )

    return data
  }

  getMyOutgoingRequests = async ({ mentorPackageId, status, pageIndex, pageSize }: GetMyOutcomingRequestsParams) => {
    const { data } = await api.get<BasePaginationResponse<PackageOutgoingRequest>>(`/v1/${this.baseUrl}/requests/me`, {
      params: { mentorPackageId, status, pageIndex, pageSize }
    })

    return data
  }

  getIncomingRequest = async ({ requestId }: { requestId?: string }) => {
    if (!requestId) return null
    const { data } = await api.get<BaseResponse<PackageIncomingRequestDetail>>(
      `/v1/${this.baseUrl}/requests/incoming/${requestId}`
    )

    return data.value
  }

  getOutgoingRequest = async ({ requestId }: { requestId?: string }) => {
    if (!requestId) return null
    const { data } = await api.get<BaseResponse<PackageOutgoingRequestDetail>>(
      `/v1/${this.baseUrl}/requests/${requestId}`
    )

    return data.value
  }

  reviewRequest = async ({ body }: { body: ReviewPackageFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/requests/${body.requestId}/review`, body)

    return data.value
  }

  cancelRequest = async ({ requestId }: { requestId: string }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/requests/${requestId}/cancel`)

    return data.value
  }
}

const packageBookingService = new PackageBookingService()
export default packageBookingService
