import type {
  CreateMentorPackageFormValues,
  UpdateMentorPackageFormValues
} from '@/features/mentor-packages/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { MentorPackage } from '@/types/mentor-package.type'

class MentorPackageService {
  private readonly baseUrl = 'mentor-packages'

  createMentorPackage = async ({ body }: { body: CreateMentorPackageFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getMyMentorPackages = async () => {
    const { data } = await api.get<BasePaginationResponse<MentorPackage[]>>(`/v1/${this.baseUrl}/me`)

    return data
  }

  updateMentorPackage = async ({ body }: { body: UpdateMentorPackageFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  deleteMentorPackage = async ({ mentorPackageId }: { mentorPackageId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${mentorPackageId}`)

    return data.value
  }
}

const mentorPackageService = new MentorPackageService()
export default mentorPackageService
