import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { GetMyMentorApplicationsParams } from './hooks/use-get-my-mentor-applications'
import type { Application, SubmitMentorApplicationBody } from './types'
import type { ReviewMentorApplicationFormValues } from './validations'

class MentorApplication {
  private readonly baseUrl = 'mentor-applications'

  submitMentorApplication = async ({ body }: { body: SubmitMentorApplicationBody }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getMyMentorApplications = async ({ status, sortBy }: GetMyMentorApplicationsParams) => {
    const { data } = await api.get<BasePaginationResponse<Application>>(`/v1/${this.baseUrl}/me`, {
      params: {
        status,
        sortBy
      }
    })

    return data
  }

  getMentorApplications = async ({ status, sortBy }: GetMyMentorApplicationsParams) => {
    const { data } = await api.get<BasePaginationResponse<Application>>(`/v1/${this.baseUrl}`, {
      params: {
        status,
        sortBy
      }
    })

    return data
  }

  reviewMentorApplication = async ({ body }: { body: ReviewMentorApplicationFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.applicationId}/review`, body)

    return data.value
  }
}

const mentorApplicationService = new MentorApplication()
export default mentorApplicationService
