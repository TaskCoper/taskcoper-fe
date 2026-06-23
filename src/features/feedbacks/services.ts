import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { GetFeedbacksParams } from './hooks/use-get-feedbacks'
import type { Feedback } from './types'
import type { SubmitPackageFeedbackFormValues } from './validations'

class FeedbackService extends BaseService {
  private readonly baseUrl = 'feedbacks'

  submitFeedback = async ({
    body
  }: {
    body: Omit<SubmitPackageFeedbackFormValues, 'metadata'> & {
      metadata: string
    }
  }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getPurchasedPackageFeedbacks = async ({ packageBookingId }: { packageBookingId?: string }) => {
    if (!packageBookingId) return getDefaultPaginationResponse<Feedback>()
    const { data } = await this.get<BasePaginationResponse<Feedback>>(
      `/v1/${this.baseUrl}/mentor-package-bookings/${packageBookingId}`
    )

    return data
  }

  getFeedbacks = async ({ targetType, targetId, pageIndex, pageSize, sortBy, searchTerm }: GetFeedbacksParams) => {
    if (!targetId) return getDefaultPaginationResponse<Feedback>()
    const { data } = await this.get<BasePaginationResponse<Feedback>>(
      `/v1/${this.baseUrl}/targets/${targetType}/${targetId}`,
      {
        params: {
          pageIndex,
          pageSize,
          sortBy,
          searchTerm
        }
      }
    )

    return data
  }
}

const feedbackService = new FeedbackService()
export default feedbackService
