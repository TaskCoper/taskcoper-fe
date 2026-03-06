import type { SubmitMentorApplicationFormValues } from '@/features/mentor-applications/validations'
import api, { type BaseResponse } from '@/lib/axios'

class MentorApplication {
  private readonly baseUrl = 'mentor-applications'

  submitMentorApplication = async ({ body }: { body: SubmitMentorApplicationFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }
}

const mentorApplicationService = new MentorApplication()
export default mentorApplicationService
