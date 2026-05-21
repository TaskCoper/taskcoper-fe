import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { GetMyIncomingRequestsParams } from './hooks/use-get-my-incoming-requests'
import type { PackageIncomingRequest, PackageRequestDetail } from './types'
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

  getMyIncomingRequests = async ({ mentorPackageId, status, pageIndex, pageSize }: GetMyIncomingRequestsParams) => {
    if (!mentorPackageId) return getDefaultPaginationResponse<PackageIncomingRequest>()

    const { data } = await api.get<BasePaginationResponse<PackageIncomingRequest>>(
      `/v1/${this.baseUrl}/requests/incoming`,
      {
        params: { mentorPackageId, status, pageIndex, pageSize }
      }
    )

    return data
  }

  getRequest = async ({ requestId }: { requestId?: string }) => {
    if (!requestId) return null
    const { data } = await api.get<BaseResponse<PackageRequestDetail>>(
      `/v1/${this.baseUrl}/requests/incoming/${requestId}`
    )

    return data.value
  }

  reviewRequest = async ({ body }: { body: ReviewPackageFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/requests/${body.requestId}/review`, body)

    return data.value
  }
}

const packageBookingService = new PackageBookingService()
export default packageBookingService
