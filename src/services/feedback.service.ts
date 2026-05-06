import type { GetFeedbacksParams } from '@/features/feedbacks/hooks/use-get-feedbacks'
import type { SubmitPackageFeedbackFormValues } from '@/features/feedbacks/validations'
import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { Feedback } from '@/types/feedback.type'

class FeedbackService {
  private readonly baseUrl = 'feedbacks'

  submitFeedback = async ({
    body
  }: {
    body: Omit<SubmitPackageFeedbackFormValues, 'metadata'> & {
      metadata: string
    }
  }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getPurchasedPackageFeedbacks = async ({ packageBookingId }: { packageBookingId?: string }) => {
    if (!packageBookingId) return getDefaultPaginationResponse<Feedback>()
    const { data } = await api.get<BasePaginationResponse<Feedback>>(
      `/v1/${this.baseUrl}/mentor-package-bookings/${packageBookingId}`
    )

    return data
  }

  getFeedbacks = async ({ targetType, targetId }: GetFeedbacksParams) => {
    if (!targetId) return getDefaultPaginationResponse<Feedback>()
    const { data } = await api.get<BasePaginationResponse<Feedback>>(
      `/v1/${this.baseUrl}/targets/${targetType}/${targetId}`
    )

    return data
  }
}

const feedbackService = new FeedbackService()
export default feedbackService
