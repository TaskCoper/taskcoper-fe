import type {
  CreateMentorPackageFormValues,
  UpdateMentorPackageFormValues
} from '@/features/mentor-packages/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { MentorPackage, MentorPackageDetail, PurchasedMentorPackage } from '@/types/mentor-package.type'

class MentorPackageService {
  private readonly baseUrl = 'mentor-packages'

  createMentorPackage = async ({ body }: { body: CreateMentorPackageFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getMyMentorPackages = async () => {
    const { data } = await api.get<BasePaginationResponse<MentorPackage>>(`/v1/${this.baseUrl}/me`)

    return data
  }

  getMentorPackages = async ({ mentorId }: { mentorId?: string }) => {
    if (!mentorId) return getDefaultPaginationResponse<MentorPackage>()
    const { data } = await api.get<BasePaginationResponse<MentorPackage>>(`/v1/${this.baseUrl}/mentor/${mentorId}`)

    return data
  }

  getPurchasedMentorPackages = async () => {
    const { data } = await api.get<BasePaginationResponse<PurchasedMentorPackage>>(`/v1/${this.baseUrl}/users/me`)

    return data
  }

  getPurchasedMentorPackage = async ({ packageId }: { packageId?: string }) => {
    if (!packageId) return null
    const { data } = await api.get<BaseResponse<PurchasedMentorPackage>>(`/v1/${this.baseUrl}/users/me/${packageId}`)

    return data.value
  }

  getMentorPackage = async ({ packageId }: { packageId?: string }) => {
    if (!packageId) return null
    const { data } = await api.get<BaseResponse<MentorPackageDetail>>(`/v1/${this.baseUrl}/${packageId}`)

    return data.value
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
