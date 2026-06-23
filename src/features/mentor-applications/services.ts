import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { GetMyMentorApplicationsParams } from './hooks/use-get-my-mentor-applications'
import type { Application, SubmitMentorApplicationBody } from './types'
import type { ReviewMentorApplicationFormValues } from './validations'

class MentorApplication extends BaseService {
  private readonly baseUrl = 'mentor-applications'

  submitMentorApplication = async ({ body }: { body: SubmitMentorApplicationBody }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getMyMentorApplications = async ({ status, sortBy }: GetMyMentorApplicationsParams) => {
    const { data } = await this.get<BasePaginationResponse<Application>>(`/v1/${this.baseUrl}/me`, {
      params: {
        status,
        sortBy
      }
    })

    return data
  }

  getMentorApplications = async ({ status, sortBy }: GetMyMentorApplicationsParams) => {
    const { data } = await this.get<BasePaginationResponse<Application>>(`/v1/${this.baseUrl}`, {
      params: {
        status,
        sortBy
      }
    })

    return data
  }

  reviewMentorApplication = async ({ body }: { body: ReviewMentorApplicationFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.applicationId}/review`, body)

    return data.value
  }
}

const mentorApplicationService = new MentorApplication()
export default mentorApplicationService
