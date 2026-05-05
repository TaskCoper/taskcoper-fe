import type { SubmitPackageFeedbackFormValues } from '@/features/feedbacks/validations'
import { api, type BaseResponse } from '@/lib/axios'

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
}

const feedbackService = new FeedbackService()
export default feedbackService
