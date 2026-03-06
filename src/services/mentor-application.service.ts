import type { GetMyMentorApplicationsParams } from '@/features/mentor-applications/hooks/use-get-my-mentor-applications'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { Application, SubmitMentorApplicationBody } from '@/types/mentor-application.type'

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
}

const mentorApplicationService = new MentorApplication()
export default mentorApplicationService
