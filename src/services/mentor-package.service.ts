import type { GetMentorPackageStatisticsParams } from '@/features/mentor-packages/hooks/use-get-mentor-package-statistics'
import type { GetMentorPackagesParams } from '@/features/mentor-packages/hooks/use-get-mentor-packages'
import type { GetMyMentorPackagesParams } from '@/features/mentor-packages/hooks/use-get-my-mentor-packages'
import type { GetPurchasedMentorPackagesParams } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-packages'
import type {
  CreateMentorPackageFormValues,
  UpdateMentorPackageFormValues
} from '@/features/mentor-packages/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type {
  MentorPackage,
  MentorPackageDetail,
  MentorPackagePinStatistic,
  MentorPackageStatistics,
  PurchasedMentorPackage
} from '@/types/mentor-package.type'

class MentorPackageService {
  private readonly baseUrl = 'mentor-packages'

  createMentorPackage = async ({ body }: { body: CreateMentorPackageFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getMyMentorPackages = async ({ searchTerm, pageIndex, pageSize, sortBy, isPin }: GetMyMentorPackagesParams) => {
    const { data } = await api.get<BasePaginationResponse<MentorPackage>>(`/v1/${this.baseUrl}/me`, {
      params: { searchTerm, pageIndex, pageSize, sortBy, isPin }
    })

    return data
  }

  getMentorPackages = async ({ mentorId, isPin }: GetMentorPackagesParams) => {
    if (!mentorId) return getDefaultPaginationResponse<MentorPackage>()
    const { data } = await api.get<BasePaginationResponse<MentorPackage>>(`/v1/${this.baseUrl}/mentor/${mentorId}`, {
      params: { isPin }
    })

    return data
  }

  getPurchasedMentorPackages = async ({ mode, isNeedFeedback }: GetPurchasedMentorPackagesParams) => {
    const { data } = await api.get<BasePaginationResponse<PurchasedMentorPackage>>(`/v1/${this.baseUrl}/users/me`, {
      params: { mode, isNeedFeedback }
    })

    return data
  }

  getPurchasedMentorPackage = async ({ packageId }: { packageId?: string }) => {
    if (!packageId) return null
    const { data } = await api.get<BaseResponse<PurchasedMentorPackage>>(`/v1/${this.baseUrl}/users/me/${packageId}`)

    return data.value
  }

  getProjectPurchasedMentorPackages = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return getDefaultPaginationResponse<PurchasedMentorPackage>()
    const { data } = await api.get<BasePaginationResponse<PurchasedMentorPackage>>(
      `/v1/${this.baseUrl}/projects/${projectIdentifier}`
    )

    return data
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

  getMentorPackageStatistics = async ({ mentorPackageId, startTime, endTime }: GetMentorPackageStatisticsParams) => {
    if (!mentorPackageId) return null
    const { data } = await api.get<BaseResponse<MentorPackageStatistics>>(
      `/v1/${this.baseUrl}/${mentorPackageId}/statistics`,
      { params: { startTime, endTime } }
    )

    return data.value
  }

  getMentorPackagePinStatistics = async () => {
    const { data } = await api.get<BasePaginationResponse<MentorPackagePinStatistic>>(
      `/v1/${this.baseUrl}/pin/statistic`
    )

    return data
  }
}

const mentorPackageService = new MentorPackageService()
export default mentorPackageService
